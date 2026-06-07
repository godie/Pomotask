import { test, expect } from "@playwright/test";
import { getMainTimerSeconds, resetTimerStorage } from "./helpers/timer";

const FOCUS_DURATION = 25 * 60;

test.describe("Timer happy paths", () => {
  test.beforeEach(async ({ page }) => {
    await resetTimerStorage(page);
  });

  test("starts and counts down", async ({ page }) => {
    const initial = await getMainTimerSeconds(page);
    expect(initial).toBe(FOCUS_DURATION);

    await page.getByRole("button", { name: "Start timer" }).click();
    await expect(page.getByRole("button", { name: "Pause timer" })).toBeVisible();

    await expect
      .poll(async () => getMainTimerSeconds(page), { timeout: 5_000 })
      .toBeLessThan(initial);
  });

  test("supports start, pause, resume, and reset", async ({ page }) => {
    await page.getByRole("button", { name: "Start timer" }).click();
    await expect(page.getByRole("button", { name: "Pause timer" })).toBeVisible();

    await expect
      .poll(async () => getMainTimerSeconds(page), { timeout: 5_000 })
      .toBeLessThan(FOCUS_DURATION);

    const runningSeconds = await getMainTimerSeconds(page);

    await page.getByRole("button", { name: "Pause timer" }).click();
    await expect(page.getByRole("button", { name: "Resume timer" })).toBeVisible();

    await page.waitForTimeout(1_500);
    expect(await getMainTimerSeconds(page)).toBe(runningSeconds);

    await page.getByRole("button", { name: "Resume timer" }).click();
    await expect(page.getByRole("button", { name: "Pause timer" })).toBeVisible();

    await expect
      .poll(async () => getMainTimerSeconds(page), { timeout: 5_000 })
      .toBeLessThan(runningSeconds);

    await page.getByTitle("Reset").click();
    await expect(page.getByRole("button", { name: "Start timer" })).toBeVisible();
    expect(await getMainTimerSeconds(page)).toBe(FOCUS_DURATION);
  });

  test("continues ticking after page refresh while running", async ({ page }) => {
    await page.getByRole("button", { name: "Start timer" }).click();
    await expect(page.getByRole("button", { name: "Pause timer" })).toBeVisible();

    await expect
      .poll(async () => getMainTimerSeconds(page), { timeout: 10_000 })
      .toBeLessThanOrEqual(FOCUS_DURATION - 4);

    const beforeReload = await getMainTimerSeconds(page);

    await page.reload();

    await expect(page.getByRole("button", { name: "Pause timer" })).toBeVisible({
      timeout: 10_000,
    });

    const afterReload = await getMainTimerSeconds(page);
    expect(afterReload).toBeLessThan(FOCUS_DURATION);
    expect(afterReload).toBeLessThanOrEqual(beforeReload);

    await expect
      .poll(async () => getMainTimerSeconds(page), {
        timeout: 8_000,
        intervals: [500, 1000],
      })
      .toBeLessThan(afterReload);
  });
});
