/**
 * Kiosk Integration Router
 *
 * Handles communication with TRIPLEBIGHT Android health kiosk machines.
 * The kiosk POSTs health readings to /api/kiosk/data after each session.
 *
 * Flow:
 * 1. User scans QR code on kiosk or logs in → POST /api/kiosk/session/create
 *    Returns a short-lived token (60 min)
 * 2. Kiosk completes measurements → POST /api/kiosk/data (with token + readings)
 *    Readings are saved to health_readings table under the user's account
 * 3. Admin manages registered devices via the admin panel
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { kioskDevices, kioskSessions, healthReadings, users } from "../../drizzle/schema";
import { eq, and, gt } from "drizzle-orm";
import crypto from "crypto";

// ─── Helpers ────────────────────────────────────────────────────────────────

function parseFloatOrNull(val: string | undefined): number | null {
  if (!val) return null;
  const parts = val.split("#");
  const n = parseFloat(parts[0]);
  return isNaN(n) ? null : n;
}

function parseIntOrNull(val: string | undefined): number | null {
  const f = parseFloatOrNull(val);
  return f === null ? null : Math.round(f);
}

// ─── Kiosk Data Payload Schema ───────────────────────────────────────────────
// Based on Henan Lejia API Protocol v1.0

const KioskDataSchema = z.object({
  /** Session token obtained from /api/kiosk/session/create */
  sessionToken: z.string().optional(),
  /** Device hardware ID (e.g. "2CFDA15B9372") */
  deviceID: z.string().optional(),
  /** Physical examination number */
  examNo: z.string().optional(),

  // Height & Weight
  hw: z.object({
    height: z.string().optional(),
    weight: z.string().optional(),
    bmi: z.string().optional(),
  }).optional(),

  // Blood Pressure
  blood: z.object({
    high: z.string().optional(),   // systolic
    low: z.string().optional(),    // diastolic
    rate: z.string().optional(),   // heart rate
    rhigh: z.string().optional(),  // right arm systolic
    rlow: z.string().optional(),   // right arm diastolic
  }).optional(),

  // Blood Oxygen
  spo2: z.object({
    sp: z.string().optional(),
  }).optional(),

  // Body Temperature
  tiwen: z.string().optional(),

  // Body Composition
  fat: z.object({
    zflv: z.string().optional(),   // body fat rate
    jcdx: z.string().optional(),   // basal metabolism
    tsfl: z.string().optional(),   // body water content
    tsflv: z.string().optional(),  // body water rate
    zfl: z.string().optional(),    // body fat content
    jrl: z.string().optional(),    // muscle content
    jrlv: z.string().optional(),   // muscle rate
    gy: z.string().optional(),     // bone salt
    nzzf: z.string().optional(),   // visceral fat grade
  }).optional(),

  // Blood Sugar
  xt: z.object({
    type: z.string().optional(),
    value: z.string().optional(),
  }).optional(),

  // Uric Acid
  ns: z.string().optional(),

  // Cholesterol
  dgc: z.string().optional(),

  // Waist-Hip Ratio
  ytb: z.object({
    waist: z.string().optional(),
    hip: z.string().optional(),
    whr: z.string().optional(),
  }).optional(),

  // ID Card (optional — if kiosk has ID reader)
  sfz: z.object({
    name: z.string().optional(),
    sex: z.string().optional(),
    idnumber: z.string().optional(),
    age: z.string().optional(),
  }).optional(),
}).passthrough();

// ─── Router ─────────────────────────────────────────────────────────────────

export const kioskIntegrationRouter = router({

  /**
   * Create a kiosk session.
   * Called when a user authenticates at the kiosk (via QR code scan or login).
   * Returns a token that the kiosk uses when submitting readings.
   */
  createSession: protectedProcedure
    .input(z.object({
      deviceId: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify the device is registered and active
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [device] = await db
        .select()
        .from(kioskDevices)
        .where(and(
          eq(kioskDevices.deviceId, input.deviceId),
          eq(kioskDevices.isActive, "true")
        ));

      if (!device) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Device not registered or inactive. Please contact your administrator.",
        });
      }

      // Generate a secure random token
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 60 minutes

      await db.insert(kioskSessions).values({
        token,
        deviceId: input.deviceId,
        userId: ctx.user.id,
        status: "active",
        expiresAt,
      });

      return { token, expiresAt };
    }),

  /**
   * Get a session token for kiosk login (used by QR code flow).
   * Returns a URL the user can open on their phone to authenticate,
   * which then creates a session for the kiosk.
   */
  getSessionQR: protectedProcedure
    .input(z.object({ deviceId: z.string() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await db.insert(kioskSessions).values({
        token,
        deviceId: input.deviceId,
        userId: ctx.user.id,
        status: "active",
        expiresAt,
      });

      return { token, expiresAt };
    }),

  /**
   * Admin: List all registered kiosk devices.
   */
  listDevices: protectedProcedure
    .query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const db = await getDb();
      if (!db) return [];
      return db.select().from(kioskDevices).orderBy(kioskDevices.createdAt);
    }),

  /**
   * Admin: Register a new kiosk device.
   */
  registerDevice: protectedProcedure
    .input(z.object({
      deviceId: z.string().min(1).max(64),
      label: z.string().optional(),
      kioskId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const existing = await db
        .select()
        .from(kioskDevices)
        .where(eq(kioskDevices.deviceId, input.deviceId));

      if (existing.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A device with this ID is already registered.",
        });
      }

      await db.insert(kioskDevices).values({
        deviceId: input.deviceId,
        label: input.label ?? null,
        kioskId: input.kioskId ?? null,
        isActive: "true",
      });

      return { success: true };
    }),

  /**
   * Admin: Update a kiosk device (label, kioskId, active status).
   */
  updateDevice: protectedProcedure
    .input(z.object({
      id: z.number(),
      label: z.string().optional(),
      kioskId: z.string().optional(),
      isActive: z.enum(["true", "false"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const updates: Record<string, unknown> = {};
      if (input.label !== undefined) updates.label = input.label;
      if (input.kioskId !== undefined) updates.kioskId = input.kioskId;
      if (input.isActive !== undefined) updates.isActive = input.isActive;

      await db
        .update(kioskDevices)
        .set(updates)
        .where(eq(kioskDevices.id, input.id));

      return { success: true };
    }),

  /**
   * Admin: Delete a kiosk device registration.
   */
  deleteDevice: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      await db.delete(kioskDevices).where(eq(kioskDevices.id, input.id));
      return { success: true };
    }),
});

/**
 * Express route handler for POST /api/kiosk/data
 * This is a plain Express route (not tRPC) because the kiosk sends raw HTTP POST,
 * not tRPC-formatted requests.
 *
 * The kiosk POSTs JSON with:
 * - sessionToken: the token from createSession
 * - deviceID: the hardware device ID
 * - All measurement fields as per the API protocol
 */
export async function handleKioskData(req: any, res: any) {
  try {
    const body = req.body;

    if (!body || typeof body !== "object") {
      return res.status(400).json({ code: "0", msg: "Invalid request body" });
    }

    const parsed = KioskDataSchema.safeParse(body);
    if (!parsed.success) {
      return res.status(400).json({ code: "0", msg: "Invalid data format" });
    }

    const data = parsed.data;
    const sessionToken = data.sessionToken;
    const deviceId = data.deviceID;

    if (!sessionToken && !deviceId) {
      return res.status(400).json({ code: "0", msg: "sessionToken or deviceID required" });
    }

    // Resolve userId from session token
    let userId: number | null = null;
    let resolvedKioskId: string | null = null;

    if (sessionToken) {
      const db = await getDb();
      if (!db) return res.status(500).json({ code: "0", msg: "Database unavailable" });

      const [session] = await db
        .select()
        .from(kioskSessions)
        .where(and(
          eq(kioskSessions.token, sessionToken),
          eq(kioskSessions.status, "active"),
          gt(kioskSessions.expiresAt, new Date())
        ));

      if (!session) {
        return res.status(401).json({ code: "0", msg: "Invalid or expired session token" });
      }

      userId = session.userId;

      // Mark session as used
      await db
        .update(kioskSessions)
        .set({ status: "used" })
        .where(eq(kioskSessions.id, session.id));

      // Get the kiosk location linked to this device
      if (deviceId) {
        const [device] = await db
          .select()
          .from(kioskDevices)
          .where(eq(kioskDevices.deviceId, deviceId));
        if (device?.kioskId) resolvedKioskId = device.kioskId;
      }
    }

    if (!userId) {
      return res.status(401).json({ code: "0", msg: "Could not identify user from session" });
    }

    // ── Map kiosk fields to health_readings schema ──────────────────────────

    const hw = data.hw;
    const blood = data.blood;
    const spo2 = data.spo2;

    // Blood pressure: prefer left arm (high/low), fallback to right arm (rhigh/rlow)
    const systolic = parseIntOrNull(blood?.high) ?? parseIntOrNull(blood?.rhigh);
    const diastolic = parseIntOrNull(blood?.low) ?? parseIntOrNull(blood?.rlow);
    const heartRate = parseIntOrNull(blood?.rate);

    const weight = parseFloatOrNull(hw?.weight);
    const height = parseFloatOrNull(hw?.height);
    const bmi = parseFloatOrNull(hw?.bmi);
    const temperature = parseFloatOrNull(data.tiwen);

    // Build notes with extra metrics not in the main schema
    const extraMetrics: string[] = [];
    const spO2 = parseFloatOrNull(spo2?.sp);
    if (spO2 !== null) extraMetrics.push(`SpO2: ${spO2}%`);
    const bodyFatRate = parseFloatOrNull(data.fat?.zflv);
    if (bodyFatRate !== null) extraMetrics.push(`Body Fat: ${bodyFatRate}%`);
    const muscleRate = parseFloatOrNull(data.fat?.jrlv);
    if (muscleRate !== null) extraMetrics.push(`Muscle Rate: ${muscleRate}%`);
    const visceralFat = parseFloatOrNull(data.fat?.nzzf);
    if (visceralFat !== null) extraMetrics.push(`Visceral Fat Grade: ${visceralFat}`);
    const bloodSugar = parseFloatOrNull(data.xt?.value);
    if (bloodSugar !== null) extraMetrics.push(`Blood Sugar: ${bloodSugar} mmol/L`);
    const uricAcid = parseFloatOrNull(data.ns);
    if (uricAcid !== null) extraMetrics.push(`Uric Acid: ${uricAcid} mmol/L`);
    const cholesterol = parseFloatOrNull(data.dgc);
    if (cholesterol !== null) extraMetrics.push(`Cholesterol: ${cholesterol} mmol/L`);
    const whr = parseFloatOrNull(data.ytb?.whr);
    if (whr !== null) extraMetrics.push(`Waist-Hip Ratio: ${whr}`);
    if (data.examNo) extraMetrics.push(`Exam No: ${data.examNo}`);

    const notes = extraMetrics.length > 0 ? extraMetrics.join(" | ") : null;

    // Insert the health reading
    const db2 = await getDb();
    if (!db2) return res.status(500).json({ code: "0", msg: "Database unavailable" });
    await db2.insert(healthReadings).values({
      userId,
      kioskId: resolvedKioskId ?? (deviceId ?? "unknown"),
      bloodPressureSystolic: systolic ?? undefined,
      bloodPressureDiastolic: diastolic ?? undefined,
      heartRate: heartRate ?? undefined,
      weight: weight !== null ? String(weight) : undefined,
      height: height !== null ? String(height) : undefined,
      bmi: bmi !== null ? String(bmi) : undefined,
      temperature: temperature !== null ? String(temperature) : undefined,
      notes: notes ?? undefined,
      recordedAt: new Date(),
    });

    return res.json({ code: "1", msg: "successful" });
  } catch (err) {
    console.error("[KioskData] Error processing kiosk data:", err);
    return res.status(500).json({ code: "0", msg: "Internal server error" });
  }
}
