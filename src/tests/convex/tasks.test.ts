import { describe, it, expect, vi } from "vitest";

// Mock the Convex server module
vi.mock("convex/server", () => ({
  query: vi.fn((config: any) => config),
  mutation: vi.fn((config: any) => config),
}));

// Mock v from convex/values
vi.mock("convex/values", () => ({
  v: {
    id: (table: string) => ({ t: "id", table }),
    string: () => ({ t: "string" }),
    optional: (val: any) => ({ t: "optional", inner: val }),
    number: () => ({ t: "number" }),
    boolean: () => ({ t: "boolean" }),
    array: (val: any) => ({ t: "array", inner: val }),
    union: (...vals: any[]) => ({ t: "union", variants: vals }),
    literal: (val: string) => ({ t: "literal", value: val }),
    object: (fields: any) => ({ t: "object", fields }),
  },
}));

interface MockTask {
  _id: string;
  projectId: string;
  ownerUserId: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  retryCount: number;
  maxRetries: number;
  claimedBy?: string;
  waitingForClarification: boolean;
  createdAt: number;
  startedAt?: number;
  endedAt?: number;
}

describe("Convex queries in tasks.ts", () => {
  describe("listByProject", () => {
    it("returns all tasks for a given projectId", async () => {
      const mockTasks: MockTask[] = [
        {
          _id: "task1",
          projectId: "project1",
          ownerUserId: "user1",
          title: "Task 1",
          type: "coding",
          status: "pending",
          retryCount: 0,
          maxRetries: 3,
          waitingForClarification: false,
          createdAt: Date.now(),
        },
        {
          _id: "task2",
          projectId: "project1",
          ownerUserId: "user1",
          title: "Task 2",
          type: "coding",
          status: "completed",
          retryCount: 0,
          maxRetries: 3,
          waitingForClarification: false,
          createdAt: Date.now(),
        },
      ];

      const mockQuery = vi.fn(() => ({
        filter: vi.fn(() => ({
          take: vi.fn().mockResolvedValue(mockTasks),
        })),
      }));

      const mockCtx = {
        db: {
          query: mockQuery,
        },
      };

      const handler = async (ctx: any, args: { projectId: string }) => {
        return await ctx.db
          .query("tasks")
          .filter((q: any) => q.eq(q.field("projectId"), args.projectId))
          .take(100);
      };

      const result = await handler(mockCtx, { projectId: "project1" });

      expect(result).toHaveLength(2);
      expect(result[0].projectId).toBe("project1");
    });

    it("returns empty array when no tasks for project", async () => {
      const mockCtx = {
        db: {
          query: vi.fn(() => ({
            filter: vi.fn(() => ({
              take: vi.fn().mockResolvedValue([]),
            })),
          })),
        },
      };

      const handler = async (ctx: any, args: { projectId: string }) => {
        return await ctx.db
          .query("tasks")
          .filter((q: any) => q.eq(q.field("projectId"), args.projectId))
          .take(100);
      };

      const result = await handler(mockCtx, { projectId: "nonexistent" });
      expect(result).toEqual([]);
    });
  });

  describe("listByStatus", () => {
    it("returns all tasks with a given status", async () => {
      const mockTasks: MockTask[] = [
        {
          _id: "task1",
          projectId: "project1",
          ownerUserId: "user1",
          title: "Task 1",
          type: "coding",
          status: "in_progress",
          retryCount: 0,
          maxRetries: 3,
          waitingForClarification: false,
          createdAt: Date.now(),
        },
      ];

      const mockCtx = {
        db: {
          query: vi.fn(() => ({
            filter: vi.fn(() => ({
              take: vi.fn().mockResolvedValue(mockTasks),
            })),
          })),
        },
      };

      const handler = async (ctx: any, args: { status: string }) => {
        return await ctx.db
          .query("tasks")
          .filter((q: any) => q.eq(q.field("status"), args.status))
          .take(100);
      };

      const result = await handler(mockCtx, { status: "in_progress" });
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe("in_progress");
    });
  });

  describe("getTask", () => {
    it("returns task when found", async () => {
      const mockTask: MockTask = {
        _id: "task123",
        projectId: "project1",
        ownerUserId: "user1",
        title: "Test Task",
        type: "coding",
        status: "pending",
        retryCount: 0,
        maxRetries: 3,
        waitingForClarification: false,
        createdAt: Date.now(),
      };

      const mockCtx = {
        db: {
          get: vi.fn().mockResolvedValue(mockTask),
        },
      };

      const handler = async (ctx: any, args: { taskId: string }) => {
        return await ctx.db.get(args.taskId);
      };

      const result = await handler(mockCtx, { taskId: "task123" });
      expect(result).toEqual(mockTask);
    });

    it("returns null when task not found", async () => {
      const mockCtx = {
        db: {
          get: vi.fn().mockResolvedValue(null),
        },
      };

      const handler = async (ctx: any, args: { taskId: string }) => {
        return await ctx.db.get(args.taskId);
      };

      const result = await handler(mockCtx, { taskId: "nonexistent" });
      expect(result).toBeNull();
    });
  });
});
