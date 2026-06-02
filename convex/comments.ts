import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const addComment = mutation({
  args: {
    taskId: v.id("tasks"),
    authorId: v.string(),
    authorType: v.string(),
    type: v.string(),
    message: v.string(),
    parentCommentId: v.optional(v.id("taskComments")),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    const commentId = await ctx.db.insert("taskComments", {
      taskId: args.taskId,
      authorId: args.authorId,
      authorType: args.authorType,
      type: args.type,
      message: args.message,
      parentCommentId: args.parentCommentId,
      createdAt: Date.now(),
    });

    return await ctx.db.get(commentId);
  },
});

export const listComments = query({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("taskComments")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .order("desc")
      .take(100);
    return comments;
  },
});