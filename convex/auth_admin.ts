import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId, getAuthSessionId } from "@convex-dev/auth/server";

export const userAuth = query({
  args: {},
  returns: v.union(
    v.object({ userId: v.string(), sessionId: v.string() }),
    v.object({ userId: v.string() }),
    v.object({ sessionId: v.string() }),
    v.null()
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    const sessionId = await getAuthSessionId(ctx);

    if (userId && sessionId) {
      return { userId, sessionId };
    }
    if (userId) {
      return { userId };
    }
    if (sessionId) {
      return { sessionId };
    }
    return null;
  },
});


export const terminateSession = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Find all sessions for the given userId
    const sessions = await ctx.db
      .query("authSessions")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .collect();

    // Delete all found sessions
    for (const session of sessions) {
      await ctx.db.delete(session._id);
    }
    return { success: true, deleted: sessions.length };
  },
});
