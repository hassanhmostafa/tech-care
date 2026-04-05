/**
 * Kiosk Owner tRPC router.
 * Procedures here require the caller to be authenticated AND have role = "kiosk_owner" OR "admin".
 * Kiosk owners can only edit kiosks they own. Admins can edit any kiosk.
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { kioskOwnerProcedure, router } from "../_core/trpc";
import { getKiosksByOwnerId, getKioskById, updateKiosk } from "../db";

const kioskEditSchema = z.object({
  name: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  image: z.string().url().optional().or(z.literal("")),
  isActive: z.enum(["true", "false"]).optional(),
  hours: z
    .array(z.object({ day: z.string(), open: z.string(), close: z.string() }))
    .optional(),
  services: z.array(z.string()).optional(),
});

export const kioskOwnerRouter = router({
  /**
   * List all kiosks owned by the current user.
   * Admins see all kiosks.
   * Frontend: trpc.kioskOwner.myKiosks.useQuery()
   */
  myKiosks: kioskOwnerProcedure.query(async ({ ctx }) => {
    if (ctx.user.role === "admin") {
      // Admins can see all kiosks via the admin panel; here return their own assigned ones
      return getKiosksByOwnerId(ctx.user.id);
    }
    return getKiosksByOwnerId(ctx.user.id);
  }),

  /**
   * Update a kiosk the current user owns.
   * Admins can update any kiosk.
   * Frontend: trpc.kioskOwner.updateMyKiosk.useMutation()
   */
  updateMyKiosk: kioskOwnerProcedure
    .input(z.object({ kioskId: z.string(), data: kioskEditSchema }))
    .mutation(async ({ ctx, input }) => {
      const kiosk = await getKioskById(input.kioskId);

      if (!kiosk) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Kiosk not found" });
      }

      // Enforce ownership: kiosk_owner can only edit their own kiosk
      if (ctx.user.role === "kiosk_owner" && kiosk.ownerId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only edit kiosks you own",
        });
      }

      return updateKiosk(input.kioskId, input.data);
    }),
});
