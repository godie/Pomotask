import type { Page } from "@playwright/test";

/** Parse the main timer display (mm:ss) into total seconds. */
export async function getMainTimerSeconds(page: Page): Promise<number> {
  const el = page.getByRole("main").locator("span.tabular-nums");
  const text = await el.textContent();
  if (!text) throw new Error("Timer display not found");
  const [mins, secs] = text.trim().split(":").map(Number);
  return mins * 60 + secs;
}

/** Reset persisted timer state so each test starts from idle 25:00. */
export async function resetTimerStorage(page: Page): Promise<void> {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.removeItem("pomotask-timer");
  });
  await page.reload();
  await page.getByRole("link", { name: "POMOTASK" }).waitFor({ state: "visible" });
}
