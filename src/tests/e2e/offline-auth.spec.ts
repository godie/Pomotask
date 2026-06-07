import { test, expect } from "@playwright/test";

test.describe("Offline-first (no Convex URL)", () => {
  test("loads the timer home page without requiring login", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("link", { name: "POMOTASK" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Start timer" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign In" })).not.toBeAttached();
  });

  test("redirects /auth to home when Convex is not configured", async ({
    page,
  }) => {
    await page.goto("/auth");

    await expect(page).toHaveURL("/");
    await expect(page.getByRole("button", { name: "Start timer" })).toBeVisible();
  });

  test("loads without unexpected runtime errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => {
      errors.push(err.message);
    });

    await page.goto("/");
    await expect(page.getByRole("link", { name: "POMOTASK" })).toBeVisible();

    const unexpectedErrors = errors.filter(
      (msg) =>
        !msg.includes("placeholder.pomotask.local") &&
        !msg.includes("WebSocket") &&
        !msg.includes("Failed to fetch"),
    );

    expect(unexpectedErrors).toHaveLength(0);
  });
});

// Auth UI with Convex (Google button, email form) requires a dev server built
// with VITE_CONVEX_URL set. Run manually with E2E_CONVEX_URL when credentials
// are available — OAuth callback flow is not automated.
