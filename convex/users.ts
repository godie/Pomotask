import { query } from "./_generated/server";

/**
 * Returns the current authenticated user's ID (identity.subject).
 * Returns null when the user is not authenticated.
 */
export const getCurrentUserId = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return identity.subject;
  },
});
