import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/restrict-plus-operands */

export const createTask = mutation({
  args: {
    projectId: v.id("projects"),
    ownerUserId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    type: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    const taskId = await ctx.db.insert("tasks", {
      projectId: args.projectId,
      ownerUserId: args.ownerUserId,
      title: args.title,
      description: args.description,
      type: args.type,
      status: "pending",
      createdBy: args.ownerUserId,
      waitingForClarification: false,
      retryCount: 0,
      maxRetries: 3,
      createdAt: Date.now(),
      baseBranch: project.baseBranch,
    });

    const slug = args.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const branchName = `${slug}-${taskId}`;

    await ctx.db.patch(taskId, { branchName });

    return taskId;
  },
});

export const claimTask = mutation({
  args: {
    agentId: v.id("agents"),
    type: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    const task = await ctx.db
      .query("tasks")
      .withIndex("by_status_type", (q: any) =>
        q.eq("status", "pending").eq("type", args.type)
      )
      .filter((q: any) => q.eq(q.field("waitingForClarification"), false))
      .first();

    if (!task) return null;

    await ctx.db.patch(task._id, {
      status: "in_progress",
      claimedBy: args.agentId,
      startedAt: Date.now(),
    });

    return await ctx.db.get(task._id);
  },
});

export const reportProgress = mutation({
  args: {
    taskId: v.id("tasks"),
    agentId: v.id("agents"),
    message: v.string(),
    level: v.union(v.literal("info"), v.literal("warn"), v.literal("error")),
  },
  handler: async (ctx: any, args: any) => {
    await ctx.db.insert("taskLogs", {
      taskId: args.taskId,
      agentId: args.agentId,
      message: args.message,
      level: args.level,
      timestamp: Date.now(),
    });
  },
});

export const completeTask = mutation({
  args: {
    taskId: v.id("tasks"),
    agentId: v.id("agents"),
    prUrl: v.optional(v.string()),
    commitSha: v.optional(v.string()),
    resultType: v.optional(v.string()),
    resultPayload: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");
    if (task.claimedBy !== args.agentId) {
      throw new Error("Agent not authorized for this task");
    }

    await ctx.db.patch(args.taskId, {
      status: "completed",
      endedAt: Date.now(),
      prUrl: args.prUrl,
      commitSha: args.commitSha,
      resultType: args.resultType,
      resultPayload: args.resultPayload,
    });

    await ctx.db.insert("taskLogs", {
      taskId: args.taskId,
      agentId: args.agentId,
      message: "Task completed successfully",
      level: "info",
      timestamp: Date.now(),
    });
  },
});

export const failTask = mutation({
  args: {
    taskId: v.id("tasks"),
    agentId: v.id("agents"),
    reason: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");
    if (task.claimedBy !== args.agentId) {
      throw new Error("Agent not authorized for this task");
    }

    await ctx.db.insert("taskLogs", {
      taskId: args.taskId,
      agentId: args.agentId,
      message: args.reason,
      level: "error",
      timestamp: Date.now(),
    });

    const newRetryCount = task.retryCount + 1;
    const shouldFail = newRetryCount >= task.maxRetries;

    await ctx.db.patch(args.taskId, {
      status: shouldFail ? "failed" : "pending",
      retryCount: newRetryCount,
      claimedBy: undefined,
      startedAt: undefined,
    });
  },
});

export const listByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx: any, args: any) => {
    return await ctx.db
      .query("tasks")
      .filter((q: any) => q.eq(q.field("projectId"), args.projectId))
      .collect();
  },
});

export const listByStatus = query({
  args: { status: v.string() },
  handler: async (ctx: any, args: any) => {
    return await ctx.db
      .query("tasks")
      .filter((q: any) => q.eq(q.field("status"), args.status))
      .collect();
  },
});

export const getTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx: any, args: any) => {
    return await ctx.db.get(args.taskId);
  },
});
