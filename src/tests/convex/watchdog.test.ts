import { describe, it, expect, vi } from "vitest";

describe("Convex watchdog.ts", () => {
  const STUCK_THRESHOLD_MS = 30 * 60 * 1000;
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

    const mockCtx: any = {
      db: {
        query: vi.fn(() => ({
          withIndex: vi.fn(() => ({
            collect: vi.fn().mockResolvedValue([stuckTask]),
          })),
        })),
        patch: patchMock,
        insert: insertMock,
      },
    };

    const { resetStuckTasks } = await import("../../../convex/watchdog");
    // @ts-expect-error - accessing internal handler for testing - accessing internal handler for testing
    await resetStuckTasks.handler(mockCtx, {});

    expect(patchMock).toHaveBeenCalledWith("task1", {
      status: "pending",
      retryCount: 1,
      claimedBy: undefined,
      startedAt: undefined,
    });
    expect(insertMock).toHaveBeenCalledWith("taskLogs", expect.objectContaining({
      level: "warn",
      message: expect.stringContaining("reset to pending"),
    }));
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

    const mockCtx: any = {
      db: {
        query: vi.fn(() => ({
          withIndex: vi.fn(() => ({
            collect: vi.fn().mockResolvedValue([stuckTask]),
          })),
        })),
        patch: patchMock,
        insert: insertMock,
      },
    };

    const { resetStuckTasks } = await import("../../../convex/watchdog");
    // @ts-expect-error - accessing internal handler for testing
    await resetStuckTasks.handler(mockCtx, {});

    expect(patchMock).toHaveBeenCalledWith("task2", {
      status: "failed",
      retryCount: 3,
      endedAt: expect.any(Number),
    });
    expect(insertMock).toHaveBeenCalledWith("taskLogs", expect.objectContaining({
      level: "error",
      message: expect.stringContaining("marked as failed"),
    }));
  });

  it("ignores tasks that are not stuck", async () => {
    const recentTask = {
      _id: "task3",
      status: "in_progress",
      startedAt: now - 1000, // Just started
      retryCount: 0,
      maxRetries: 3,
      waitingForClarification: false,
      claimedBy: "agent1",
    };

    const patchMock = vi.fn();

    const mockCtx: any = {
      db: {
        query: vi.fn(() => ({
          withIndex: vi.fn(() => ({
            collect: vi.fn().mockResolvedValue([recentTask]),
          })),
        })),
        patch: patchMock,
      },
    };

    const { resetStuckTasks } = await import("../../../convex/watchdog");
    // @ts-expect-error - accessing internal handler for testing
    await resetStuckTasks.handler(mockCtx, {});

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

    const mockCtx: any = {
      db: {
        query: vi.fn(() => ({
          withIndex: vi.fn(() => ({
            collect: vi.fn().mockResolvedValue([waitingTask]),
          })),
        })),
        patch: patchMock,
      },
    };

    const { resetStuckTasks } = await import("../../../convex/watchdog");
    // @ts-expect-error - accessing internal handler for testing
    await resetStuckTasks.handler(mockCtx, {});

    expect(patchMock).not.toHaveBeenCalled();
  });
});
