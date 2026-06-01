import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  computeFocusStreakDays,
  formatTotalFocusedDuration,
  sumFocusDurationSeconds,
} from "@/lib/focusStats";
import type { PomodoroSession } from "@/types";

function session(
  overrides: Partial<PomodoroSession> & Pick<PomodoroSession, "startedAt">,
): PomodoroSession {
  return {
    id: "s1",
    taskId: "t1",
    completedAt: overrides.startedAt,
    type: "focus",
    durationSeconds: 1500,
    ...overrides,
  };
}

describe("focusStats", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-01T12:00:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("sumFocusDurationSeconds sums focus sessions only", () => {
    const sessions: PomodoroSession[] = [
      session({ startedAt: Date.now(), durationSeconds: 100, type: "focus" }),
      session({
        startedAt: Date.now(),
        durationSeconds: 999,
        type: "short_break",
      }),
    ];
    expect(sumFocusDurationSeconds(sessions)).toBe(100);
  });

  it("formatTotalFocusedDuration formats hours and minutes", () => {
    expect(formatTotalFocusedDuration(0)).toBe("0m");
    expect(formatTotalFocusedDuration(45 * 60)).toBe("45m");
    expect(formatTotalFocusedDuration(3600 + 30 * 60)).toBe("1h 30m");
    expect(formatTotalFocusedDuration(7200)).toBe("2h");
  });

  it("computeFocusStreakDays returns 0 when no sessions", () => {
    expect(computeFocusStreakDays([])).toBe(0);
  });

  it("computeFocusStreakDays counts consecutive days ending on latest activity", () => {
    const sessions: PomodoroSession[] = [
      session({ startedAt: new Date("2026-04-01T10:00:00").getTime() }),
      session({ startedAt: new Date("2026-03-31T10:00:00").getTime() }),
      session({ startedAt: new Date("2026-03-30T10:00:00").getTime() }),
    ];
    expect(computeFocusStreakDays(sessions)).toBe(3);
  });

  it("computeFocusStreakDays breaks on gap", () => {
    const sessions: PomodoroSession[] = [
      session({ startedAt: new Date("2026-04-01T10:00:00").getTime() }),
      session({ startedAt: new Date("2026-03-29T10:00:00").getTime() }),
    ];
    expect(computeFocusStreakDays(sessions)).toBe(1);
  });
});
