import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Task, Project } from "@/types";

// ── Mock data helpers ──

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: overrides.id ?? "proj-1",
    name: overrides.name ?? "Test Project",
    color: overrides.color ?? "#6366f1",
    createdAt: overrides.createdAt ?? 1700000000000,
    updatedAt: overrides.updatedAt ?? 1700000000000,
  };
}

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: overrides.id ?? "task-1",
    projectId: overrides.projectId ?? "proj-1",
    name: overrides.name ?? "Test Task",
    estimatedPomodoros: overrides.estimatedPomodoros ?? 3,
    realPomodoros: overrides.realPomodoros ?? 0,
    status: overrides.status ?? "pending",
    createdAt: overrides.createdAt ?? 1700000000000,
    updatedAt: overrides.updatedAt ?? 1700000000000,
  };
}

// ── Hoisted mocks (vi.mock factories are hoisted; vi.hoisted() lets us
//    share mutable references safely) ──

const {
  mockMutation,
  mockTransaction,
  mockProjectsToArray,
  mockTasksToArray,
  mockProjectsClear,
  mockTasksClear,
} = vi.hoisted(() => ({
  mockMutation: vi.fn(),
  mockTransaction: vi.fn(),
  mockProjectsToArray: vi.fn(),
  mockTasksToArray: vi.fn(),
  mockProjectsClear: vi.fn(),
  mockTasksClear: vi.fn(),
}));

vi.mock("@/lib/convex", () => ({
  convex: {
    mutation: mockMutation,
  },
}));

vi.mock("@/db/schema", () => ({
  db: {
    projects: {
      toArray: mockProjectsToArray,
      clear: mockProjectsClear,
    },
    tasks: {
      toArray: mockTasksToArray,
      clear: mockTasksClear,
    },
    transaction: mockTransaction,
  },
}));

// Import after mocks are set up
import { migrateLocalDataToConvex } from "@/lib/migration";

describe("migrateLocalDataToConvex", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default: no data in Dexie
    mockProjectsToArray.mockResolvedValue([]);
    mockTasksToArray.mockResolvedValue([]);

    // Default: transaction just runs the callback
    mockTransaction.mockImplementation(
      (_mode: string, _tables: unknown[], callback: () => void) => {
        callback();
      },
    );
  });

  // ── Empty data ──

  it("returns zero counts and does nothing when Dexie is empty", async () => {
    const result = await migrateLocalDataToConvex("user-1");

    expect(result).toEqual({ projects: 0, tasks: 0 });
    expect(mockMutation).not.toHaveBeenCalled();
    expect(mockTransaction).not.toHaveBeenCalled();
    expect(mockProjectsClear).not.toHaveBeenCalled();
    expect(mockTasksClear).not.toHaveBeenCalled();
  });

  // ── Happy path: projects + tasks migrate successfully ──

  it("migrates all projects and tasks, clears Dexie on success", async () => {
    const project1 = makeProject({ id: "proj-1", name: "Alpha" });
    const project2 = makeProject({ id: "proj-2", name: "Beta" });
    const task1 = makeTask({ id: "task-1", projectId: "proj-1", name: "Buy groceries" });
    const task2 = makeTask({ id: "task-2", projectId: "proj-2", name: "Write docs" });

    mockProjectsToArray.mockResolvedValue([project1, project2]);
    mockTasksToArray.mockResolvedValue([task1, task2]);

    // Each Convex mutation returns a new Convex ID
    mockMutation
      .mockResolvedValueOnce("convex-proj-1") // migrateUserProject for Alpha
      .mockResolvedValueOnce("convex-proj-2") // migrateUserProject for Beta
      .mockResolvedValueOnce(undefined)        // migrateUserTask for Buy groceries
      .mockResolvedValueOnce(undefined);       // migrateUserTask for Write docs

    const result = await migrateLocalDataToConvex("user-1");

    expect(result).toEqual({ projects: 2, tasks: 2 });

    // Verify project migrations
    expect(mockMutation).toHaveBeenCalledTimes(4);
    expect(mockMutation).toHaveBeenNthCalledWith(
      1,
      expect.anything(), // api.projects.migrateUserProject
      {
        ownerUserId: "user-1",
        name: "Alpha",
        description: undefined,
        color: "#6366f1",
        createdAt: 1700000000000,
        updatedAt: 1700000000000,
      },
    );
    expect(mockMutation).toHaveBeenNthCalledWith(
      2,
      expect.anything(),
      expect.objectContaining({ name: "Beta" }),
    );

    // Verify task migration — projectId was translated to new Convex ID
    expect(mockMutation).toHaveBeenNthCalledWith(
      3,
      expect.anything(), // api.tasks.migrateUserTask
      expect.objectContaining({
        projectId: "convex-proj-1",
        ownerUserId: "user-1",
        title: "Buy groceries",
      }),
    );
    expect(mockMutation).toHaveBeenNthCalledWith(
      4,
      expect.anything(),
      expect.objectContaining({
        projectId: "convex-proj-2",
        title: "Write docs",
      }),
    );

    // Dexie was cleared
    expect(mockTransaction).toHaveBeenCalledTimes(1);
    expect(mockProjectsClear).toHaveBeenCalledTimes(1);
    expect(mockTasksClear).toHaveBeenCalledTimes(1);
  });

  // ── Tasks with null projectId → assigned to fallback ──

  it("assigns tasks with null projectId to the first migrated project", async () => {
    const project1 = makeProject({ id: "proj-1", name: "Inbox" });
    const task1 = makeTask({ id: "task-1", projectId: "proj-1", name: "With project" });
    const task2 = makeTask({ id: "task-2", projectId: null, name: "No project" });

    mockProjectsToArray.mockResolvedValue([project1]);
    mockTasksToArray.mockResolvedValue([task1, task2]);

    mockMutation
      .mockResolvedValueOnce("convex-proj-1")  // project
      .mockResolvedValueOnce(undefined)         // task1
      .mockResolvedValueOnce(undefined);        // task2 (fallback)

    await migrateLocalDataToConvex("user-1");

    // Task with projectId maps to its project
    expect(mockMutation).toHaveBeenNthCalledWith(
      2,
      expect.anything(),
      expect.objectContaining({
        projectId: "convex-proj-1",
        title: "With project",
      }),
    );

    // Task without projectId gets fallback (first project)
    expect(mockMutation).toHaveBeenNthCalledWith(
      3,
      expect.anything(),
      expect.objectContaining({
        projectId: "convex-proj-1",
        title: "No project",
      }),
    );

    // Dexie was cleared
    expect(mockTransaction).toHaveBeenCalledTimes(1);
    expect(mockProjectsClear).toHaveBeenCalledTimes(1);
    expect(mockTasksClear).toHaveBeenCalledTimes(1);
  });

  // ── Orphaned task guard (no projects, tasks exist) ──

  it("throws when tasks exist but no projects are available to assign them to", async () => {
    const task1 = makeTask({ id: "task-1", projectId: null });

    mockProjectsToArray.mockResolvedValue([]);
    mockTasksToArray.mockResolvedValue([task1]);

    await expect(migrateLocalDataToConvex("user-1")).rejects.toThrow(
      "1 task(s) could not be migrated — no project to assign them to.",
    );

    // Dexie was NOT cleared
    expect(mockTransaction).not.toHaveBeenCalled();
    expect(mockProjectsClear).not.toHaveBeenCalled();
    expect(mockTasksClear).not.toHaveBeenCalled();
  });

  // ── Unmapped-projectId task triggers data-loss guard ──

  it("throws when a task references a project that was not migrated", async () => {
    const project1 = makeProject({ id: "proj-1", name: "Keep" });
    // task1 references proj-1 (migrated) → migratable
    // task2 references proj-2 (not in Dexie → not in projectIdMap) → triggers guard
    const task1 = makeTask({ id: "task-1", projectId: "proj-1", name: "Kept" });
    const task2 = makeTask({ id: "task-2", projectId: "proj-2", name: "Unmapped" });

    mockProjectsToArray.mockResolvedValue([project1]);
    mockTasksToArray.mockResolvedValue([task1, task2]);

    mockMutation
      .mockResolvedValueOnce("convex-proj-1")   // project succeeds
      .mockResolvedValueOnce(undefined);         // task1 succeeds
    // task2 is filtered out → guard fires before any mutation call for it

    await expect(migrateLocalDataToConvex("user-1")).rejects.toThrow(
      "1 task(s) could not be migrated",
    );

    // Only 2 calls: project + task1 (task2 was filtered and guard fired)
    expect(mockMutation).toHaveBeenCalledTimes(2);

    // Dexie was NOT cleared
    expect(mockTransaction).not.toHaveBeenCalled();
    expect(mockProjectsClear).not.toHaveBeenCalled();
    expect(mockTasksClear).not.toHaveBeenCalled();
  });

  // ── Partial project failure ──

  it("throws and does not clear Dexie when a project migration fails", async () => {
    const project1 = makeProject({ id: "proj-1", name: "Alpha" });
    const project2 = makeProject({ id: "proj-2", name: "Beta" });
    const task1 = makeTask({ id: "task-1", projectId: "proj-1" });

    mockProjectsToArray.mockResolvedValue([project1, project2]);
    mockTasksToArray.mockResolvedValue([task1]);

    mockMutation
      .mockResolvedValueOnce("convex-proj-1")            // first project succeeds
      .mockRejectedValueOnce(new Error("Network error")); // second project fails

    await expect(migrateLocalDataToConvex("user-1")).rejects.toThrow(
      "Failed to migrate 1 project(s)",
    );

    // Task migration was never attempted (2 project calls only)
    expect(mockMutation).toHaveBeenCalledTimes(2);

    // Dexie was NOT cleared
    expect(mockTransaction).not.toHaveBeenCalled();
    expect(mockProjectsClear).not.toHaveBeenCalled();
    expect(mockTasksClear).not.toHaveBeenCalled();
  });

  // ── Task migration failure after projects succeed ──

  it("throws and does not clear Dexie when a task migration fails", async () => {
    const project1 = makeProject({ id: "proj-1", name: "Alpha" });
    const task1 = makeTask({ id: "task-1", projectId: "proj-1", name: "Good task" });
    const task2 = makeTask({ id: "task-2", projectId: "proj-1", name: "Bad task" });

    mockProjectsToArray.mockResolvedValue([project1]);
    mockTasksToArray.mockResolvedValue([task1, task2]);

    mockMutation
      .mockResolvedValueOnce("convex-proj-1")                      // project succeeds
      .mockResolvedValueOnce(undefined)                             // first task succeeds
      .mockRejectedValueOnce(new Error("Validation error"));        // second task fails

    await expect(migrateLocalDataToConvex("user-1")).rejects.toThrow(
      "Failed to migrate 1 task(s) after projects succeeded",
    );

    // All 3 calls were made (project + 2 tasks)
    expect(mockMutation).toHaveBeenCalledTimes(3);

    // Dexie was NOT cleared
    expect(mockTransaction).not.toHaveBeenCalled();
    expect(mockProjectsClear).not.toHaveBeenCalled();
    expect(mockTasksClear).not.toHaveBeenCalled();
  });

  // ── Only projects, no tasks ──

  it("migrates projects and returns zero tasks when no tasks exist", async () => {
    const project1 = makeProject({ id: "proj-1" });

    mockProjectsToArray.mockResolvedValue([project1]);
    mockTasksToArray.mockResolvedValue([]);

    mockMutation.mockResolvedValueOnce("convex-proj-1");

    const result = await migrateLocalDataToConvex("user-1");

    expect(result).toEqual({ projects: 1, tasks: 0 });
    expect(mockMutation).toHaveBeenCalledTimes(1); // project only
    expect(mockTransaction).toHaveBeenCalledTimes(1);
    expect(mockProjectsClear).toHaveBeenCalledTimes(1);
    expect(mockTasksClear).toHaveBeenCalledTimes(1);
  });
});
