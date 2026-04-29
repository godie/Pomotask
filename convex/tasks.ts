import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Crear tarea con soporte Pomodoro
export const createPomodoroTask = mutation({
  args: {
    projectId: v.id("projects"),
    ownerUserId: v.optional(v.id("users")),
    title: v.string(),
    description: v.optional(v.string()),
    estimatedPomodoros: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    const taskId = await ctx.db.insert("tasks", {
      projectId: args.projectId,
      ownerUserId: args.ownerUserId,
      title: args.title,
      description: args.description,
      type: "pomodoro",
      status: "pending",
      createdBy: args.ownerUserId,
      waitingForClarification: false,
      retryCount: 0,
      maxRetries: 3,
      createdAt: Date.now(),
      baseBranch: project.baseBranch,
      estimatedPomodoros: args.estimatedPomodoros,
      realPomodoros: 0,
    });

    return taskId;
  },
});

// Actualizar tarea Pomodoro
export const updatePomodoroTask = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    estimatedPomodoros: v.optional(v.number()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    const updates: any = { updatedAt: Date.now() };
    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.estimatedPomodoros !== undefined) {
      updates.estimatedPomodoros = args.estimatedPomodoros;
    }
    if (args.status !== undefined) {
      updates.status = args.status;
      if (args.status === "completed") {
        updates.completedAt = Date.now();
      }
    }

    await ctx.db.patch(args.taskId, updates);
    return await ctx.db.get(args.taskId);
  },
});

// Incrementar pomodoros reales en una tarea
export const incrementRealPomodoros = mutation({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    const newRealPomodoros = (task.realPomodoros || 0) + 1;
    await ctx.db.patch(args.taskId, {
      realPomodoros: newRealPomodoros,
      updatedAt: Date.now(),
    });

    return newRealPomodoros;
  },
});

// Completar sesión de Pomodoro
export const completePomodoroSession = mutation({
  args: {
    userId: v.id("users"),
    taskId: v.optional(v.id("tasks")),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    type: v.union(
      v.literal("focus"),
      v.literal("short_break"),
      v.literal("long_break")
    ),
    durationSeconds: v.number(),
  },
  handler: async (ctx, args) => {
    const sessionId = await ctx.db.insert("pomodoroSessions", {
      userId: args.userId,
      taskId: args.taskId,
      startedAt: args.startedAt,
      completedAt: args.completedAt ?? Date.now(),
      type: args.type,
      durationSeconds: args.durationSeconds,
      completed: true,
    });

    // Si es una sesión de focus y tiene taskId, incrementar realPomodoros
    if (args.type === "focus" && args.taskId) {
      const task = await ctx.db.get(args.taskId);
      if (task) {
        const newRealPomodoros = (task.realPomodoros || 0) + 1;
        await ctx.db.patch(args.taskId, {
          realPomodoros: newRealPomodoros,
          updatedAt: Date.now(),
        });
      }
    }

    return sessionId;
  },
});

// Registrar inicio de sesión de Pomodoro
export const startPomodoroSession = mutation({
  args: {
    userId: v.id("users"),
    taskId: v.optional(v.id("tasks")),
    type: v.union(
      v.literal("focus"),
      v.literal("short_break"),
      v.literal("long_break")
    ),
  },
  handler: async (ctx, args) => {
    const sessionId = await ctx.db.insert("pomodoroSessions", {
      userId: args.userId,
      taskId: args.taskId,
      startedAt: Date.now(),
      type: args.type,
      durationSeconds: 0,
      completed: false,
    });

    return sessionId;
  },
});

// Actualizar sesión en progreso
export const updatePomodoroSession = mutation({
  args: {
    sessionId: v.id("pomodoroSessions"),
    durationSeconds: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      durationSeconds: args.durationSeconds,
    });
  },
});

// Obtener tareas por proyecto
export const getTasksByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .take(100);
    return tasks;
  },
});

// Obtener tareas por usuario
export const getTasksByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_owner", (q) => q.eq("ownerUserId", args.userId))
      .take(100);
    return tasks;
  },
});

// Obtener estadísticas de sesiones de un usuario
export const getSessionStats = query({
  args: {
    userId: v.id("users"),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("pomodoroSessions")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", args.userId).gte("startedAt", args.startDate)
      )
      .filter((q) => q.lt(q.field("startedAt"), args.endDate))
      .collect();

    const focusSessions = sessions.filter(
      (s) => s.type === "focus" && s.completed
    );
    const totalFocusSeconds = focusSessions.reduce(
      (sum, s) => sum + s.durationSeconds,
      0
    );
    const totalPomodoros = focusSessions.length;

    return {
      totalPomodoros,
      totalFocusSeconds,
      totalFocusMinutes: Math.round(totalFocusSeconds / 60),
      sessions,
    };
  },
});

// Obtener sesiones por tarea
export const getSessionsByTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("pomodoroSessions")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .collect();
    return sessions;
  },
});

// Mantener las funciones originales para compatibilidad
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
  handler: async (ctx, args) => {
    const task = await ctx.db
      .query("tasks")
      .withIndex("by_status_type", (q) =>
        q.eq("status", "pending").eq("type", args.type)
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
