/**
 * Admin tRPC router.
 * All procedures require the caller to be authenticated AND have role = "admin".
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  getAllKiosksAdmin,
  createKiosk,
  updateKiosk,
  deleteKiosk,
  deactivateKiosk,
} from "../db";
import { nanoid } from "nanoid";

// Middleware that enforces admin role
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

const kioskInputSchema = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
  address: z.string().min(1),
  latitude: z.string(),
  longitude: z.string(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  image: z.string().url().optional(),
  rating: z.string().optional(),
  isActive: z.enum(["true", "false"]).default("true"),
  hours: z
    .array(z.object({ day: z.string(), open: z.string(), close: z.string() }))
    .optional(),
  services: z.array(z.string()).optional(),
});

export const adminRouter = router({
  /**
   * List ALL kiosks including inactive ones.
   * Frontend: trpc.admin.listKiosks.useQuery()
   */
  listKiosks: adminProcedure.query(async () => {
    return getAllKiosksAdmin();
  }),

  /**
   * Create a new kiosk.
   * Frontend: trpc.admin.createKiosk.useMutation()
   */
  createKiosk: adminProcedure.input(kioskInputSchema).mutation(async ({ input }) => {
    const id = `kiosk-${nanoid(8)}`;
    return createKiosk({ ...input, id });
  }),

  /**
   * Update an existing kiosk.
   * Frontend: trpc.admin.updateKiosk.useMutation()
   */
  updateKiosk: adminProcedure
    .input(z.object({ id: z.string(), data: kioskInputSchema.partial() }))
    .mutation(async ({ input }) => {
      return updateKiosk(input.id, input.data);
    }),

  /**
   * Toggle a kiosk active/inactive (soft delete).
   * Frontend: trpc.admin.toggleKiosk.useMutation()
   */
  toggleKiosk: adminProcedure
    .input(z.object({ id: z.string(), isActive: z.enum(["true", "false"]) }))
    .mutation(async ({ input }) => {
      return updateKiosk(input.id, { isActive: input.isActive });
    }),

  /**
   * Permanently delete a kiosk.
   * Frontend: trpc.admin.deleteKiosk.useMutation()
   */
  deleteKiosk: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await deleteKiosk(input.id);
      return { success: true };
    }),
});
