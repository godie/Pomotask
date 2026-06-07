import { test, expect } from "@playwright/test";

/**
 * Playwright starts the dev server with VITE_CONVEX_URL="" (offline-first).
 * MigrationBanner only mounts when isConvexConfigured — skip here; migration
 * flow is covered by useMigration unit tests and manual Convex dev runs.
 */
test.describe.skip("MigrationBanner E2E", () => {
  /**
   * Navigate to the app with the ?e2e=migration query parameter.
   *
   * In dev mode this triggers the useMigration hook to:
   * 1. Seed Dexie with 1 project + 1 task
   * 2. Transition status: idle → migrating → done (after 500ms)
   *
   * The MigrationBanner component renders each state with distinct
   * text and icons, so we assert on visible text content.
   */
  test("shows migrating → done banner transitions when ?e2e=migration is present", async ({
    page,
  }) => {
    // Navigate with the e2e query parameter
    await page.goto("/?e2e=migration");

    // Wait for the app to mount — the nav bar always shows "POMOTASK"
    await expect(page.locator("text=POMOTASK")).toBeVisible({ timeout: 10_000 });

    // ─── State 1: "migrating" banner should be visible ─────────────
    // The banner shows "Migrating your data..." with a spinner + upload icon
    const banner = page.locator('[role="status"]');
    await expect(banner).toBeVisible({ timeout: 5_000 });
    await expect(banner).toContainText("Migrating your data...");

    // ─── State 2: "done" banner replaces it after ~500ms ────────────
    // The spinner disappears and "Migration complete!" text appears
    await expect(banner).toContainText("Migration complete!", { timeout: 3_000 });

    // ─── State 3: banner auto-dismisses after 3s ────────────────────
    // The MigrationBanner returns null (removed from DOM) when dismissed
    await expect(banner).not.toBeAttached({ timeout: 5_000 });
  });

  test("shows no banner when no e2e query param is present", async ({ page }) => {
    await page.goto("/");

    // App still loads
    await expect(page.locator("text=POMOTASK")).toBeVisible({ timeout: 10_000 });

    // No migration banner should appear (status is "idle")
    const banner = page.locator('[role="status"]');
    await expect(banner).not.toBeAttached();
  });

  test("seed data is visible in Dexie before migration clears it", async ({
    page,
  }) => {
    await page.goto("/?e2e=migration");

    // Wait for the app to mount
    await expect(page.locator("text=POMOTASK")).toBeVisible({ timeout: 10_000 });

    // Wait for the migration to complete (banner shows "done")
    const banner = page.locator('[role="status"]');
    await expect(banner).toContainText("Migration complete!", { timeout: 8_000 });

    // After migration, Dexie should be empty (the e2e test mode clears it)
    // Dynamic import resolved by Vite dev server — path uses @ alias.
    const counts = await page.evaluate(async () => {
      // @ts-expect-error - dynamic import path resolved by Vite dev server
      const { db } = await import("/src/db/schema.ts");
      return {
        projects: (await db.projects.toArray()).length,
        tasks: (await db.tasks.toArray()).length,
      };
    });

    expect(counts.projects).toBe(0);
    expect(counts.tasks).toBe(0);
  });

  test("page loads without errors even when Convex is unavailable", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => {
      errors.push(err.message);
    });

    await page.goto("/");

    await expect(page.locator("text=POMOTASK")).toBeVisible({ timeout: 10_000 });

    // Filter out expected placeholder errors (Convex can't connect to placeholder)
    const unexpectedErrors = errors.filter(
      (msg) =>
        !msg.includes("placeholder.pomotask.local") &&
        !msg.includes("WebSocket") &&
        !msg.includes("Failed to fetch"),
    );

    expect(unexpectedErrors).toHaveLength(0);
  });
});
