/**
 * Health readings tRPC router.
 * All procedures require authentication — users can only access their own data.
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getUserReadings, createHealthReading, deleteHealthReading } from "../db";
import { TRPCError } from "@trpc/server";

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
