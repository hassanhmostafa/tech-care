/**
 * Chat tRPC router.
 * Stored-message conversations between regular users and health experts.
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, expertProcedure, router } from "../_core/trpc";
import {
  findOrCreateConversation,
  getUserConversations,
  getExpertConversations,
  getConversationMessages,
  sendMessage,
  getConversationById,
  listExperts,
} from "../db";

export const chatRouter = router({
  /**
   * List all approved experts (role = 'expert').
   * Accessible to any authenticated user so they can browse and start conversations.
   * Frontend: trpc.chat.listExperts.useQuery()
   */
  listExperts: protectedProcedure.query(async () => {
    return listExperts();
  }),

  /**
   * Start (or resume) a conversation with an expert.
   * Returns the conversation object.
   * Frontend: trpc.chat.startConversation.useMutation()
   */
  startConversation: protectedProcedure
    .input(z.object({ expertId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.id === input.expertId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "You cannot start a conversation with yourself." });
      }
      const conversation = await findOrCreateConversation(ctx.user.id, input.expertId);
      return conversation;
    }),

  /**
   * Get all conversations for the current user.
   * Frontend: trpc.chat.myConversations.useQuery()
   */
  myConversations: protectedProcedure.query(async ({ ctx }) => {
    return getUserConversations(ctx.user.id);
  }),

  /**
   * Get the expert's inbox — all conversations assigned to them.
   * Frontend: trpc.chat.expertInbox.useQuery()
   */
  expertInbox: expertProcedure.query(async ({ ctx }) => {
    return getExpertConversations(ctx.user.id);
  }),

  /**
   * Get messages for a conversation.
   * Both the user and the expert in the conversation can access this.
   * Frontend: trpc.chat.getMessages.useQuery({ conversationId })
   */
  getMessages: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .query(async ({ ctx, input }) => {
      const conv = await getConversationById(input.conversationId);
      if (!conv) throw new TRPCError({ code: "NOT_FOUND", message: "Conversation not found" });

      // Security: only participants can read messages
      if (conv.userId !== ctx.user.id && conv.expertId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not a participant in this conversation" });
      }

      return getConversationMessages(input.conversationId);
    }),

  /**
   * Send a message in a conversation.
   * Both the user and the expert can send messages.
   * Frontend: trpc.chat.sendMessage.useMutation()
   */
  sendMessage: protectedProcedure
    .input(z.object({
      conversationId: z.number(),
      content: z.string().min(1).max(5000),
    }))
    .mutation(async ({ ctx, input }) => {
      const conv = await getConversationById(input.conversationId);
      if (!conv) throw new TRPCError({ code: "NOT_FOUND", message: "Conversation not found" });

      // Security: only participants can send messages
      if (conv.userId !== ctx.user.id && conv.expertId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not a participant in this conversation" });
      }

      await sendMessage({
        conversationId: input.conversationId,
        senderId: ctx.user.id,
        content: input.content,
      });

      return { success: true };
    }),
});
