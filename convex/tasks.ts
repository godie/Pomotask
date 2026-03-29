import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import { v } from "convex/values";

// Placeholder to avoid unused import errors
export const placeholderMutation = mutation({
  args: { arg: v.string() },
  handler: (_ctx: MutationCtx, args: { arg: string }) => {
    return args.arg;
  },
});

export const placeholderQuery = query({
  args: {},
  handler: (_ctx: QueryCtx) => {
    return null;
  },
});
