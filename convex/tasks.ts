import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ─── Agent-oriented mutations & queries (existing) ───

export const createTask = mutation({
  args: {
    projectId: v.id("projects"),
    ownerUserId: v.optional(v.id("users")),
    title: v.string(),
    description: v.optional(v.string()),
    type: v.string(),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    const taskId = await ctx.db.insert("tasks", {
      projectId: args.projectId,
      ownerUserId: args.ownerUserId,  // undefined está bien
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
  handler: async (ctx, args) => {
    const task = await ctx.db
      .query("tasks")
      .withIndex("by_status_type", (q) =>
        q.eq("status", "pending").eq("type", args.type),
      )
      .filter((q) => q.eq(q.field("waitingForClarification"), false))
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
  handler: async (ctx, args) => {
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
  handler: async (ctx, args) => {
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
  handler: async (ctx, args) => {
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
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("tasks")
      .filter((q) => q.eq(q.field("projectId"), args.projectId))
      .take(100);
    return tasks;
  },
});

export const listByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("tasks")
      .filter((q) => q.eq(q.field("status"), args.status))
      .take(100);
    return tasks;
  },
});

export const getTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    return task;
  },
});

// ─── Pomotask mutations & queries ───

/**
 * Create a Pomodoro-style task with estimated/real pomodoro counts.
 * Maps to the existing tasks table using optional pomotask fields.
 */
export const createPomotaskTask = mutation({
  args: {
    projectId: v.id("projects"),
    ownerUserId: v.optional(v.id("users")),
    title: v.string(),
    estimatedPomodoros: v.number(),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    const now = Date.now();
    return await ctx.db.insert("tasks", {
      projectId: args.projectId,
      ownerUserId: args.ownerUserId,
      title: args.title,
      type: "pomotask",
      status: "pending",
      waitingForClarification: false,
      retryCount: 0,
      maxRetries: 3,
      createdAt: now,
      estimatedPomodoros: args.estimatedPomodoros,
      realPomodoros: 0,
    });
  },
});

/** Update a pomotask task (name, estimatedPomodoros, status, etc.) */
export const updatePomotaskTask = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.optional(v.string()),
    estimatedPomodoros: v.optional(v.number()),
    realPomodoros: v.optional(v.number()),
    status: v.optional(v.string()),
    completedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    const patch: Record<string, unknown> = {};
    if (args.title !== undefined) patch.title = args.title;
    if (args.estimatedPomodoros !== undefined) patch.estimatedPomodoros = args.estimatedPomodoros;
    if (args.realPomodoros !== undefined) patch.realPomodoros = args.realPomodoros;
    if (args.status !== undefined) patch.status = args.status;
    if (args.completedAt !== undefined) patch.completedAt = args.completedAt;

    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(args.taskId, patch);
    }

    return await ctx.db.get(args.taskId);
  },
});

/** Delete a pomotask task */
export const deletePomotaskTask = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.taskId);
  },
});

/** Split a pomotask into subtasks (divided status) */
export const splitPomotaskTask = mutation({
  args: {
    taskId: v.id("tasks"),
    ownerUserId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    const total = task.estimatedPomodoros ?? 1;
    if (total <= 1) throw new Error("Only tasks with estimatedPomodoros > 1 can be split");

    // Mark parent as divided
    await ctx.db.patch(args.taskId, { status: "divided" });

    // Create subtasks
    const now = Date.now();
    const subtaskIds = [];
    for (let i = 0; i < total; i++) {
      const id = await ctx.db.insert("tasks", {
        projectId: task.projectId,
        ownerUserId: args.ownerUserId ?? task.ownerUserId,
        title: `${task.title} (${i + 1}/${total})`,
        type: "pomotask",
        status: "pending",
        waitingForClarification: false,
        retryCount: 0,
        maxRetries: 3,
        createdAt: now,
        estimatedPomodoros: 1,
        realPomodoros: 0,
        parentTaskId: args.taskId,
      });
      subtaskIds.push(id);
    }

    return subtaskIds;
  },
});

/** List all pomotask tasks across all projects */
export const listAllPomotaskTasks = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("tasks")
      .filter((q) => q.eq(q.field("type"), "pomotask"))
      .order("desc")
      .take(200);
  },
});

/** List pomotask tasks for a project (returns [] when projectId is empty/invalid) */
export const listPomotaskTasksByProject = query({
  args: { projectId: v.string() },
  handler: async (ctx, args) => {
    if (!args.projectId || args.projectId === "skip") return [];
    // Compare against the stored projectId field (string-comparable IDs)
    return await ctx.db
      .query("tasks")
      .filter((q) =>
        q.and(
          q.eq(q.field("projectId"), args.projectId),
          q.eq(q.field("type"), "pomotask"),
        ),
      )
      .order("desc")
      .take(200);
  },
});

/** Get a single pomotask task (returns null when not found or taskId is invalid) */
export const getPomotaskTask = query({
  args: { taskId: v.string() },
  handler: async (ctx, args) => {
    if (!args.taskId || args.taskId === "skip") return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await ctx.db.get(args.taskId as any);
  },
});

// ─── Migration mutations ───

/**
 * Insert a task during Dexie→Convex migration.
 * Accepts full task data including explicit projectId (the new Convex ID)
 * and ownerUserId so it works immediately after sign-up.
 */
export const migrateUserTask = mutation({
  args: {
    projectId: v.id("projects"),
    ownerUserId: v.id("users"),
    title: v.string(),
    estimatedPomodoros: v.number(),
    realPomodoros: v.number(),
    status: v.string(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== args.ownerUserId)
      throw new Error("Not authenticated");
    return await ctx.db.insert("tasks", {
      projectId: args.projectId,
      ownerUserId: args.ownerUserId,
      title: args.title,
      type: "pomotask",
      status: args.status,
      waitingForClarification: false,
      retryCount: 0,
      maxRetries: 3,
      createdAt: args.createdAt,
      estimatedPomodoros: args.estimatedPomodoros,
      realPomodoros: args.realPomodoros,
      completedAt: args.completedAt,
      updatedAt: args.updatedAt,
    });
  },
});
