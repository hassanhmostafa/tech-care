/**
 * Health readings tRPC router.
 * All procedures require authentication — users can only access their own data.
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getUserReadings, createHealthReading, deleteHealthReading, getUserById } from "../db";
import { TRPCError } from "@trpc/server";
import { calculateBmi, calculateWeightTarget } from "../../shared/bmi";
import { calculateHealthScore } from "../../shared/healthScore";

export const healthRouter = router({
  /**
   * Get all health readings for the currently logged-in user.
   * Frontend: trpc.health.myReadings.useQuery()
   */
  myReadings: protectedProcedure.query(async ({ ctx }) => {
    return getUserReadings(ctx.user.id);
  }),

  /**
   * Log a new health reading.
   * Frontend: trpc.health.logReading.useMutation()
   */
  logReading: protectedProcedure
    .input(
      z.object({
        kioskId: z.string(),
        bloodPressureSystolic: z.number().int().min(50).max(300).optional(),
        bloodPressureDiastolic: z.number().int().min(30).max(200).optional(),
        heartRate: z.number().int().min(30).max(250).optional(),
        weight: z.string().optional(),
        height: z.string().optional(),
        bmi: z.string().optional(),
        temperature: z.string().optional(),
        notes: z.string().max(500).optional(),
        recordedAt: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return createHealthReading({
        userId: ctx.user.id,
        kioskId: input.kioskId,
        bloodPressureSystolic: input.bloodPressureSystolic ?? null,
        bloodPressureDiastolic: input.bloodPressureDiastolic ?? null,
        heartRate: input.heartRate ?? null,
        weight: input.weight ?? null,
        height: input.height ?? null,
        bmi: input.bmi ?? null,
        temperature: input.temperature ?? null,
        notes: input.notes ?? null,
        recordedAt: input.recordedAt ?? new Date(),
      });
    }),

  /**
   * Compute BMI comparison for the current user.
   * Uses the most recent reading that has both weight and height.
   * Falls back to test data if no real reading exists.
   * Frontend: trpc.health.bmiComparison.useQuery()
   */
  bmiComparison: protectedProcedure.query(async ({ ctx }) => {
    const user = await getUserById(ctx.user.id);
    if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

    // Require profile to be set up
    if (!user.gender || !user.birthDate) {
      return { status: "profile_incomplete" as const };
    }

    const readings = await getUserReadings(ctx.user.id);
    // Find the most recent reading with both weight and height
    const reading = readings.find((r) => r.weight !== null && r.height !== null);

    if (!reading || reading.weight === null || reading.height === null) {
      return { status: "no_readings" as const };
    }

    const result = calculateBmi(
      parseFloat(reading.weight),
      parseFloat(reading.height),
      user.birthDate,
      user.gender
    );

    const weightTarget = calculateWeightTarget(
      parseFloat(reading.weight),
      parseFloat(reading.height),
      user.gender
    );

    return {
      status: "ok" as const,
      ...result,
      weight: parseFloat(reading.weight),
      height: parseFloat(reading.height),
      readingDate: reading.recordedAt,
      weightTarget,
    };
  }),

  /**
   * Get the user's overall health score from their most recent reading.
   */
  healthScore: protectedProcedure.query(async ({ ctx }) => {
    const readings = await getUserReadings(ctx.user.id);
    if (!readings || readings.length === 0) {
      return { status: "no_readings" as const };
    }
    // Use most recent reading
    const latest = readings[0];
    const result = calculateHealthScore({
      bloodPressureSystolic: latest.bloodPressureSystolic,
      bloodPressureDiastolic: latest.bloodPressureDiastolic,
      heartRate: latest.heartRate,
      bmi: latest.bmi ? parseFloat(latest.bmi) : null,
      temperature: latest.temperature ? parseFloat(latest.temperature) : null,
    });
    return { status: "ok" as const, ...result, readingDate: latest.recordedAt };
  }),

  /**
   * Delete a health reading (user must own it).
   * Frontend: trpc.health.deleteReading.useMutation()
   */
  deleteReading: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const readings = await getUserReadings(ctx.user.id);
      const owned = readings.find((r) => r.id === input.id);
      if (!owned) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Reading not found or not owned by you" });
      }
      await deleteHealthReading(input.id, ctx.user.id);
      return { success: true };
    }),
});
