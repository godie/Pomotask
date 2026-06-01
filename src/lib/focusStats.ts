import type { PomodoroSession } from "@/types";

function toLocalDayKey(ts: number): string {
  const d = new Date(ts);
  const y = String(d.getFullYear());
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Consecutive calendar days with ≥1 focus session, anchored on the most recent day with activity. */
export function computeFocusStreakDays(sessions: PomodoroSession[]): number {
  const days = new Set(
    sessions.filter((s) => s.type === "focus").map((s) => toLocalDayKey(s.startedAt)),
  );
  if (days.size === 0) return 0;

  const sorted = [...days].sort();
  const latestKey =
    sorted.length > 0 ? sorted[sorted.length - 1] : undefined;
  if (latestKey === undefined) return 0;
  const parts = latestKey.split("-");
  if (parts.length !== 3) return 0;
  const y = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if (!Number.isFinite(y) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return 0;
  }
  const cursor = new Date(y, month - 1, day);
  let streak = 0;
  while (days.has(toLocalDayKey(cursor.getTime()))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function sumFocusDurationSeconds(sessions: PomodoroSession[]): number {
  return sessions
    .filter((s) => s.type === "focus")
    .reduce((acc, s) => acc + s.durationSeconds, 0);
}

export function formatTotalFocusedDuration(totalSeconds: number): string {
  if (totalSeconds <= 0) return "0m";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h === 0) return `${String(m)}m`;
  return m > 0 ? `${String(h)}h ${String(m)}m` : `${String(h)}h`;
}
