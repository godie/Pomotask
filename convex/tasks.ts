import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Placeholder to avoid unused import errors
export const placeholderMutation = mutation({
  args: { arg: v.string() },
  handler: async (_ctx, args) => {
    return args.arg;
  },
});

export const placeholderQuery = query({
  args: {},
  handler: async (_ctx) => {
    return null;
  },
});
