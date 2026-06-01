import { Flame, CalendarClock } from "lucide-react";

interface DashboardFocusStatsProps {
  streakDays: number;
  totalFocusedLabel: string;
}

export function DashboardFocusStats({
  streakDays,
  totalFocusedLabel,
}: DashboardFocusStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full">
      <div className="rounded-2xl border border-primary/20 bg-surface_container/80 p-4 sm:p-5 shadow-[inset_0_0_20px_rgba(255,45,120,0.06)]">
        <div className="flex items-center gap-2 text-primary mb-2">
          <Flame className="w-5 h-5 shrink-0" aria-hidden />
          <span className="font-label text-[10px] sm:text-xs uppercase tracking-widest text-on_surface_variant">
            Current streak
          </span>
        </div>
        <p className="font-headline text-2xl sm:text-3xl font-bold text-on_surface tabular-nums">
          {streakDays}{" "}
          <span className="text-base sm:text-lg font-semibold text-on_surface_variant">
            {streakDays === 1 ? "day" : "days"}
          </span>
        </p>
      </div>
      <div className="rounded-2xl border border-secondary/20 bg-surface_container/80 p-4 sm:p-5 shadow-[inset_0_0_20px_rgba(0,255,204,0.05)]">
        <div className="flex items-center gap-2 text-secondary mb-2">
          <CalendarClock className="w-5 h-5 shrink-0" aria-hidden />
          <span className="font-label text-[10px] sm:text-xs uppercase tracking-widest text-on_surface_variant">
            Total focused
          </span>
        </div>
        <p className="font-headline text-2xl sm:text-3xl font-bold text-on_surface tabular-nums">
          {totalFocusedLabel}
        </p>
      </div>
    </div>
  );
}
