import { useEffect, useRef, useState } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { migrateLocalDataToConvex } from "@/lib/migration";
import { db } from "@/db/schema";

export type MigrationStatus = "idle" | "migrating" | "done" | "error";

export interface MigrationState {
  status: MigrationStatus;
  error: string | null;
}

/**
 * E2E test mode (dev only). When the URL contains ?e2e=migration the hook
 * seeds Dexie with test data, simulates auth, and steps through
 * idle → migrating → done with deterministic timings.
 *
 * No real Convex calls are made — the migration is entirely simulated.
 */
function isE2EMigrationTest(): boolean {
  if (!import.meta.env.DEV) return false;
  return new URLSearchParams(window.location.search).get("e2e") === "migration";
}

/**
 * Seeds Dexie with 1 project + 1 task so the migration has something to
 * process. Returns the project id so the task can reference it.
 */
async function seedE2ETestData(): Promise<string> {
  const projectId = "e2e-proj-1";
  const now = Date.now();

  // Clear any stale data from previous runs first
  await db.projects.clear();
  await db.tasks.clear();

  await db.projects.put({
    id: projectId,
    name: "E2E Test Project",
    color: "#ff2d78",
    createdAt: now,
    updatedAt: now,
  });

  await db.tasks.put({
    id: "e2e-task-1",
    projectId,
    name: "E2E Test Task",
    estimatedPomodoros: 3,
    realPomodoros: 0,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  });

  return projectId;
}

/**
 * Watches for the first authentication event and migrates local Dexie data
 * to Convex. Runs exactly once per mount — if the user signs out and back in
 * on the same mount, the migration won't repeat (Dexie is already cleared
 * after a successful migration, so a re-run would be a no-op anyway).
 *
 * Returns a MigrationState with the current status so the UI can show
 * a progress indicator.
 *
 * Must be rendered inside a ConvexAuthProvider and ConvexProvider.
 */
export function useMigration(): MigrationState {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const userId = useQuery(api.users.getCurrentUserId);
  const hasMigrated = useRef(false);
  const [state, setState] = useState<MigrationState>({
    status: "idle",
    error: null,
  });

  useEffect(() => {
    // ─── E2E test mode: simulate full migration flow ───────────────
    // When ?e2e=migration is present (dev only), we bypass real
    // Convex auth and simulate the state transitions so Playwright
    // can verify the MigrationBanner UI. The actual
    // migrateLocalDataToConvex function is unit-tested separately.
    if (isE2EMigrationTest()) {
      if (hasMigrated.current) return;
      // Wait until Convex auth state is settled (prevents double-run
      // when useConvexAuth() briefly returns isLoading: true on mount)
      if (isLoading) return;

      hasMigrated.current = true;

      void seedE2ETestData().then(() => {
        // Step 1: idle → migrating
        setState({ status: "migrating", error: null });

        // Step 2: migrating → done (after a visible delay so the test
        //         can assert the intermediate state)
        setTimeout(() => {
          setState({ status: "done", error: null });
        }, 500);
      });
      return;
    }

    // ─── Production path ───────────────────────────────────────────
    // Already ran this session
    if (hasMigrated.current) return;
    // Still loading auth state or Convex query
    if (isLoading) return;
    // Not authenticated yet
    if (!isAuthenticated) return;
    // User ID not available yet (shouldn't happen when authenticated, but defensive)
    if (!userId) return;

    hasMigrated.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- optimistic state before async
    setState({ status: "migrating", error: null });

    migrateLocalDataToConvex(userId)
      .then(() => {
        setState({ status: "done", error: null });
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        console.error("Dexie → Convex migration failed:", err);
        setState({ status: "error", error: message });
      });
  }, [isAuthenticated, isLoading, userId]);

  return state;
}
