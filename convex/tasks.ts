import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Task document type matching schema
interface TaskDoc {
  _id: string;
  projectId: string;
  ownerUserId: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  createdBy: string;
  claimedBy?: string;
  parentTaskId?: string;
  branchName?: string;
  baseBranch?: string;
  prUrl?: string;
  commitSha?: string;
  resultType?: string;
  resultPayload?: string;
  waitingForClarification: boolean;
  retryCount: number;
  maxRetries: number;
  createdAt: number;
  startedAt?: number;
  endedAt?: number;
}

interface ProjectDoc {
  baseBranch?: string;
}

// Query result type
interface TaskListItem extends TaskDoc {}

// Handler context types (from Convex)
interface QueryContext {
  db: {
    get: (id: string) => Promise<TaskDoc | null>;
    query: (tableName: string) => QueryBuilder;
  };
}

interface MutationContext extends QueryContext {
  db: QueryContext["db"] & {
    insert: (tableName: string, doc: Record<string, unknown>) => Promise<string>;
    patch: (id: string, fields: Record<string, unknown>) => Promise<void>;
  };
}

interface QueryBuilder {
  withIndex: (name: string, fn?: (q: QueryBuilder) => QueryBuilder) => QueryBuilder;
  filter: (fn: (q: FilterBuilder) => FilterBuilder) => FilterBuilder;
  first: () => Promise<TaskDoc | null>;
  take: (n: number) => Promise<TaskDoc[]>;
}

interface FilterBuilder {
  eq: (field: string, value: unknown) => FilterBuilder;
  and: (...filters: FilterBuilder[]) => FilterBuilder;
}

interface MutationArgs {
  projectId: string;
  ownerUserId: string;
  title: string;
  description?: string;
  type: string;
}

interface ClaimArgs {
  agentId: string;
  type: string;
}

interface ProgressArgs {
  taskId: string;
  agentId: string;
  message: string;
  level: "info" | "warn" | "error";
}

interface CompleteArgs {
  taskId: string;
  agentId: string;
  prUrl?: string;
  commitSha?: string;
  resultType?: string;
  resultPayload?: string;
}

interface FailArgs {
  taskId: string;
  agentId: string;
  reason: string;
}

export const createTask = mutation({
  args: {
    projectId: v.id("projects"),
    ownerUserId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    type: v.string(),
  },
  handler: async (ctx: MutationContext, args: MutationArgs): Promise<string> => {
    const project = await ctx.db.get(args.projectId) as ProjectDoc | null;
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
  handler: async (ctx: MutationContext, args: ClaimArgs): Promise<TaskDoc | null> => {
    const task = await ctx.db
      .query("tasks")
      .withIndex("by_status_type", (q) =>
        q.eq("status", "pending").eq("type", args.type)
      )
      .filter((q) => q.eq(q.field("waitingForClarification"), false))
      .first() as TaskDoc | null;

    if (!task) return null;

    await ctx.db.patch(task._id, {
      status: "in_progress",
      claimedBy: args.agentId,
      startedAt: Date.now(),
    });

    return await ctx.db.get(task._id) as TaskDoc | null;
  },
});

export const reportProgress = mutation({
  args: {
    taskId: v.id("tasks"),
    agentId: v.id("agents"),
    message: v.string(),
    level: v.union(v.literal("info"), v.literal("warn"), v.literal("error")),
  },
  handler: async (ctx: MutationContext, args: ProgressArgs): Promise<void> => {
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
  handler: async (ctx: MutationContext, args: CompleteArgs): Promise<void> => {
    const task = await ctx.db.get(args.taskId) as TaskDoc | null;
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
  handler: async (ctx: MutationContext, args: FailArgs): Promise<void> => {
    const task = await ctx.db.get(args.taskId) as TaskDoc | null;
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

// Query functions

interface ListByProjectArgs {
  projectId: string;
}

interface ListByStatusArgs {
  status: string;
}

interface GetTaskArgs {
  taskId: string;
}

export const listByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx: QueryContext, args: ListByProjectArgs): Promise<TaskListItem[]> => {
    const tasks = await ctx.db
      .query("tasks")
      .filter((q) => q.eq(q.field("projectId"), args.projectId))
      .take(100);
    return tasks as TaskListItem[];
  },
});

export const listByStatus = query({
  args: { status: v.string() },
  handler: async (ctx: QueryContext, args: ListByStatusArgs): Promise<TaskListItem[]> => {
    const tasks = await ctx.db
      .query("tasks")
      .filter((q) => q.eq(q.field("status"), args.status))
      .take(100);
    return tasks as TaskListItem[];
  },
});

export const getTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx: QueryContext, args: GetTaskArgs): Promise<TaskListItem | null> => {
    const task = await ctx.db.get(args.taskId);
    return task as TaskListItem | null;
  },
});
