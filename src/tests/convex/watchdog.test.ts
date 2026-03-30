import { describe, it, expect, vi } from "vitest";

const STUCK_THRESHOLD_MS = 30 * 60 * 1000;

interface Task {
  _id: string;
  status: string;
  startedAt: number | undefined;
  retryCount: number;
  maxRetries: number;
  waitingForClarification: boolean;
  claimedBy: string | undefined;
}

type QueryBuilder = {
  withIndex: (
    indexName: string,
    indexFn: (q: { eq: (field: string, value: string) => unknown }) => unknown,
  ) => {
    collect: () => Promise<unknown[]>;
  };
};

interface MockCtx {
  db: {
    query: (table: string) => QueryBuilder;
    patch: (id: string, data: Record<string, unknown>) => Promise<unknown>;
    insert: (table: string, data: Record<string, unknown>) => Promise<unknown>;
  };
}

async function resetStuckTasksHandler(ctx: MockCtx) {
  const now = Date.now();

  const inProgressTasks = (await ctx.db
    .query("tasks")
    .withIndex("by_status_type", (q) => q.eq("status", "in_progress"))
    .collect()) as Task[];

  for (const task of inProgressTasks) {
    if (task.waitingForClarification) continue;

    if (task.startedAt && now - task.startedAt > STUCK_THRESHOLD_MS) {
      const newRetryCount = task.retryCount + 1;
      const shouldFail = newRetryCount >= task.maxRetries;

      if (shouldFail) {
        await ctx.db.patch(task._id, {
          status: "failed",
          retryCount: newRetryCount,
          endedAt: now,
        });

        await ctx.db.insert("taskLogs", {
          taskId: task._id,
          agentId: task.claimedBy ?? "unknown",
          message:
            "Task marked as failed due to timeout (stuck for > 30 min). Retries: " +
            String(newRetryCount) +
            "/" +
            String(task.maxRetries),
          level: "error",
          timestamp: now,
        });
      } else {
        await ctx.db.patch(task._id, {
          status: "pending",
          retryCount: newRetryCount,
          claimedBy: undefined,
          startedAt: undefined,
        });

        await ctx.db.insert("taskLogs", {
          taskId: task._id,
          agentId: task.claimedBy ?? "unknown",
          message:
            "Task reset to pending due to timeout (stuck for > 30 min). Retries: " +
            String(newRetryCount) +
            "/" +
            String(task.maxRetries),
          level: "warn",
          timestamp: now,
        });
      }
    }
  }
}

describe("Convex watchdog.ts - resetStuckTasks handler", () => {
  const now = Date.now();

  it("resets a stuck task to pending if retryCount < maxRetries", async () => {
    const stuckTask = {
      _id: "task1",
      status: "in_progress",
      startedAt: now - STUCK_THRESHOLD_MS - 1000,
      retryCount: 0,
      maxRetries: 3,
      waitingForClarification: false,
      claimedBy: "agent1",
    };

    const patchMock = vi.fn();
    const insertMock = vi.fn();

    const mockCtx: MockCtx = {
      db: {
        query: vi.fn(() => ({
          withIndex: vi.fn(() => ({
            collect: vi.fn().mockResolvedValue([stuckTask]),
          })),
        })) as unknown as (table: string) => QueryBuilder,
        patch: patchMock as unknown as (
          id: string,
          data: Record<string, unknown>,
        ) => Promise<unknown>,
        insert: insertMock as unknown as (
          table: string,
          data: Record<string, unknown>,
        ) => Promise<unknown>,
      },
    };

    await resetStuckTasksHandler(mockCtx);

    expect(patchMock).toHaveBeenCalledWith("task1", {
      status: "pending",
      retryCount: 1,
      claimedBy: undefined,
      startedAt: undefined,
    });
    expect(insertMock).toHaveBeenCalledWith(
      "taskLogs",
      expect.objectContaining({
        level: "warn",
        message: expect.stringContaining("reset to pending"),
      }),
    );
  });

  it("marks a stuck task as failed if retryCount reaches maxRetries", async () => {
    const stuckTask = {
      _id: "task2",
      status: "in_progress",
      startedAt: now - STUCK_THRESHOLD_MS - 1000,
      retryCount: 2,
      maxRetries: 3,
      waitingForClarification: false,
      claimedBy: "agent1",
    };

    const patchMock = vi.fn();
    const insertMock = vi.fn();

    const mockCtx: MockCtx = {
      db: {
        query: vi.fn(() => ({
          withIndex: vi.fn(() => ({
            collect: vi.fn().mockResolvedValue([stuckTask]),
          })),
        })) as unknown as (table: string) => QueryBuilder,
        patch: patchMock as unknown as (
          id: string,
          data: Record<string, unknown>,
        ) => Promise<unknown>,
        insert: insertMock as unknown as (
          table: string,
          data: Record<string, unknown>,
        ) => Promise<unknown>,
      },
    };

    await resetStuckTasksHandler(mockCtx);

    expect(patchMock).toHaveBeenCalledWith("task2", {
      status: "failed",
      retryCount: 3,
      endedAt: expect.any(Number),
    });
    expect(insertMock).toHaveBeenCalledWith(
      "taskLogs",
      expect.objectContaining({
        level: "error",
        message: expect.stringContaining("marked as failed"),
      }),
    );
  });

  it("ignores tasks that are not stuck", async () => {
    const recentTask = {
      _id: "task3",
      status: "in_progress",
      startedAt: now - 1000,
      retryCount: 0,
      maxRetries: 3,
      waitingForClarification: false,
      claimedBy: "agent1",
    };

    const patchMock = vi.fn();

    const mockCtx: MockCtx = {
      db: {
        query: vi.fn(() => ({
          withIndex: vi.fn(() => ({
            collect: vi.fn().mockResolvedValue([recentTask]),
          })),
        })) as unknown as (table: string) => QueryBuilder,
        patch: patchMock as unknown as (
          id: string,
          data: Record<string, unknown>,
        ) => Promise<unknown>,
        insert: vi.fn() as unknown as (
          table: string,
          data: Record<string, unknown>,
        ) => Promise<unknown>,
      },
    };

    await resetStuckTasksHandler(mockCtx);

    expect(patchMock).not.toHaveBeenCalled();
  });

  it("ignores tasks waiting for clarification", async () => {
    const waitingTask = {
      _id: "task4",
      status: "in_progress",
      startedAt: now - STUCK_THRESHOLD_MS - 1000,
      retryCount: 0,
      maxRetries: 3,
      waitingForClarification: true,
      claimedBy: "agent1",
    };

    const patchMock = vi.fn();

    const mockCtx: MockCtx = {
      db: {
        query: vi.fn(() => ({
          withIndex: vi.fn(() => ({
            collect: vi.fn().mockResolvedValue([waitingTask]),
          })),
        })) as unknown as (table: string) => QueryBuilder,
        patch: patchMock as unknown as (
          id: string,
          data: Record<string, unknown>,
        ) => Promise<unknown>,
        insert: vi.fn() as unknown as (
          table: string,
          data: Record<string, unknown>,
        ) => Promise<unknown>,
      },
    };

    await resetStuckTasksHandler(mockCtx);

    expect(patchMock).not.toHaveBeenCalled();
  });
});
