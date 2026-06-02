import { convex } from "@/lib/convex";
import { api } from "../../convex/_generated/api";
import { db } from "@/db/schema";
import type { Id } from "../../convex/_generated/dataModel";

export interface MigrationResult {
  projects: number;
  tasks: number;
}

interface ErrorEntry {
  index: number;
  reason: unknown;
}

/**
 * Migrates all local Dexie data (projects + tasks) to Convex.
 *
 * Strategy:
 * 1. Read all projects & tasks from Dexie
 * 2. Insert projects into Convex via migrateUserProject, building a
 *    mapping of old UUID → new Convex ID
 * 3. Insert tasks into Convex via migrateUserTask, translating each
 *    task's `projectId` from the old Dexie UUID to the new Convex ID
 * 4. Only if all inserts succeed → clear Dexie tables
 * 5. If anything fails → Dexie is left untouched, error propagated
 *
 * @param ownerUserId - The Convex user ID (from identity.subject) of the
 *   newly signed-up user
 * @returns { projects, tasks } counts of migrated items
 */
export async function migrateLocalDataToConvex(
  ownerUserId: string,
): Promise<MigrationResult> {
  // 1) Gather Dexie data
  const [dexieProjects, dexieTasks] = await Promise.all([
    db.projects.toArray(),
    db.tasks.toArray(),
  ]);

  if (dexieProjects.length === 0 && dexieTasks.length === 0) {
    return { projects: 0, tasks: 0 };
  }

  // 2) Migrate projects — build ID map
  const projectIdMap = new Map<string, Id<"projects">>();

  const projectResults = await Promise.allSettled(
    dexieProjects.map((p) =>
      convex.mutation(api.projects.migrateUserProject, {
        ownerUserId: ownerUserId as Id<"users">,
        name: p.name,
        description: p.description,
        color: p.color,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }),
    ),
  );

  // Check for failures
  const projectErrors: ErrorEntry[] = [];
  for (let i = 0; i < projectResults.length; i++) {
    const r = projectResults[i];
    if (r.status === "rejected") {
      projectErrors.push({ index: i, reason: r.reason });
    }
  }

  if (projectErrors.length > 0) {
    const reasons = projectErrors.map((e) => String(e.reason)).join("; ");
    throw new Error(
      `Failed to migrate ${String(projectErrors.length)} project(s): ${reasons}`,
    );
  }

  // Build ID map (only if all succeeded)
  projectResults.forEach((r, i) => {
    if (r.status === "fulfilled") {
      projectIdMap.set(dexieProjects[i].id, r.value as Id<"projects">);
    }
  });

  // 3) Migrate tasks — translate projectId
  // Tasks without a mapped projectId are assigned to the first migrated project as a fallback.
  const fallbackProjectId: Id<"projects"> | undefined = projectIdMap.values().next().value;

  const tasksToMigrate = dexieTasks.filter((t) => {
    if (t.projectId) {
      // Keep tasks whose project was successfully migrated
      return projectIdMap.has(t.projectId);
    }
    // Keep unassigned tasks only if we have a fallback project to assign them to
    return fallbackProjectId !== undefined;
  });

  const taskResults = await Promise.allSettled(
    tasksToMigrate.map((t) => {
      const mappedId = t.projectId ? projectIdMap.get(t.projectId) : undefined;
      const convexProjectId = (mappedId ?? fallbackProjectId) as Id<"projects">;

      return convex.mutation(api.tasks.migrateUserTask, {
        projectId: convexProjectId,
        ownerUserId: ownerUserId as Id<"users">,
        title: t.name,
        estimatedPomodoros: t.estimatedPomodoros,
        realPomodoros: t.realPomodoros,
        status: t.status,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        completedAt: t.completedAt,
      });
    }),
  );

  const taskErrors: ErrorEntry[] = [];
  for (let i = 0; i < taskResults.length; i++) {
    const r = taskResults[i];
    if (r.status === "rejected") {
      taskErrors.push({ index: i, reason: r.reason });
    }
  }

  if (taskErrors.length > 0) {
    const reasons = taskErrors.map((e) => String(e.reason)).join("; ");
    throw new Error(
      `Failed to migrate ${String(taskErrors.length)} task(s) after projects succeeded: ${reasons}`,
    );
  }

  // 4) Guard against data loss: abort if tasks were skipped because they
  //    couldn't be assigned to a project (defensive — shouldn't happen in
  //    practice since projects are always migrated first).
  if (tasksToMigrate.length < dexieTasks.length) {
    throw new Error(
      `${String(dexieTasks.length - tasksToMigrate.length)} task(s) could not be migrated — no project to assign them to.`,
    );
  }

  // 5) Clear Dexie
  await db.transaction("rw", [db.projects, db.tasks], async () => {
    await db.projects.clear();
    await db.tasks.clear();
  });

  return {
    projects: dexieProjects.length,
    tasks: tasksToMigrate.length,
  };
}
