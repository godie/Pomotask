import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  users: defineTable({
    name: v.string(),
    email: v.string(),
  }),

  projects: defineTable({
    ownerUserId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    baseBranch: v.optional(v.string()),
  }),

  agents: defineTable({
    ownerUserId: v.id("users"),
    name: v.string(),
    type: v.string(),
    status: v.string(),
    capabilities: v.array(v.string()),
    lastSeenAt: v.number(),
  }),

  // Tareas compatibles con Pomodoro y sistema de agentes
  tasks: defineTable({
    projectId: v.id("projects"),
    ownerUserId: v.optional(v.id("users")),
    title: v.string(),
    description: v.optional(v.string()),
    type: v.string(),
    status: v.string(), // "pending", "in_progress", "completed", "failed"
    createdBy: v.optional(v.id("users")),
    claimedBy: v.optional(v.id("agents")),
    parentTaskId: v.optional(v.id("tasks")),
    branchName: v.optional(v.string()),
    baseBranch: v.optional(v.string()),
    prUrl: v.optional(v.string()),
    commitSha: v.optional(v.string()),
    resultType: v.optional(v.string()),
    resultPayload: v.optional(v.string()),
    waitingForClarification: v.boolean(),
    retryCount: v.number(),
    maxRetries: v.number(),
    createdAt: v.number(),
    startedAt: v.optional(v.number()),
    endedAt: v.optional(v.number()),
    // Campos específicos de Pomodoro
    estimatedPomodoros: v.optional(v.number()),
    realPomodoros: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  })
    .index("by_status_type", ["status", "type"])
    .index("by_project", ["projectId"])
    .index("by_owner", ["ownerUserId"]),

  taskLogs: defineTable({
    taskId: v.id("tasks"),
    agentId: v.id("agents"),
    timestamp: v.number(),
    level: v.string(), // "info", "warn", "error", etc.
    message: v.string(),
  }).index("by_task", ["taskId"]),

  taskComments: defineTable({
    taskId: v.id("tasks"),
    authorId: v.string(), // Can be user ID or agent ID, so v.string() or we could use v.union but v.string() is fine for now as it's mixed
    authorType: v.string(), // "user" or "agent"
    type: v.string(),
    message: v.string(),
    parentCommentId: v.optional(v.id("taskComments")),
    resolvedAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_task", ["taskId"]),

  // Sesiones de Pomodoro
  pomodoroSessions: defineTable({
    userId: v.id("users"),
    taskId: v.optional(v.id("tasks")),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    type: v.string(), // "focus", "short_break", "long_break"
    durationSeconds: v.number(),
    completed: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_task", ["taskId"])
    .index("by_user_date", ["userId", "startedAt"]),
});
