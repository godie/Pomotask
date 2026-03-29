import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
  }),

  projects: defineTable({
    ownerUserId: v.string(), // ID from users table (as string for simplicity/flexibility)
    name: v.string(),
    description: v.optional(v.string()),
    baseBranch: v.optional(v.string()),
  }),

  agents: defineTable({
    ownerUserId: v.string(),
    name: v.string(),
    type: v.string(),
    status: v.string(),
    capabilities: v.array(v.string()),
    lastSeenAt: v.number(),
  }),

  tasks: defineTable({
    projectId: v.string(),
    ownerUserId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    type: v.string(),
    status: v.string(), // "pending", "in_progress", "completed", "failed"
    createdBy: v.string(),
    claimedBy: v.optional(v.string()),
    parentTaskId: v.optional(v.string()),
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
  }).index("by_status_type", ["status", "type"]),

  taskLogs: defineTable({
    taskId: v.string(),
    agentId: v.string(),
    timestamp: v.number(),
    level: v.string(), // "info", "warn", "error", etc.
    message: v.string(),
  }).index("by_task", ["taskId"]),

  taskComments: defineTable({
    taskId: v.string(),
    authorId: v.string(),
    authorType: v.string(), // "user" or "agent"
    type: v.string(),
    message: v.string(),
    parentCommentId: v.optional(v.string()),
    resolvedAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_task", ["taskId"]),
});
