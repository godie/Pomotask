import type { Project } from "@/types";
import { Folder } from "lucide-react";

interface ProjectOverviewHeroProps {
  project: Project;
  pendingCount: number;
  completedCount: number;
  totalEstimated: number;
  totalReal: number;
}

export function ProjectOverviewHero({
  project,
  pendingCount,
  completedCount,
  totalEstimated,
  totalReal,
}: ProjectOverviewHeroProps) {
  const progress =
    totalEstimated > 0
      ? Math.min(100, Math.round((totalReal / totalEstimated) * 100))
      : 0;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-outline/15 bg-surface_container_high/80 shadow-[inset_0_0_40px_rgba(255,45,120,0.06)]">
      <div
        className="absolute inset-x-0 top-0 h-1 opacity-90"
        style={{
          background: `linear-gradient(90deg, ${project.color}, transparent)`,
        }}
        aria-hidden
      />
      <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-start gap-6">
        <div
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center shrink-0 border"
          style={{
            backgroundColor: `${project.color}18`,
            borderColor: `${project.color}55`,
            boxShadow: `0 0 24px ${project.color}33`,
          }}
        >
          <Folder className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: project.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-4xl font-headline font-bold text-on_surface tracking-tight break-words">
            {project.name}
          </h1>
          {project.description ? (
            <p className="mt-2 text-on_surface_variant text-sm sm:text-base max-w-2xl leading-relaxed">
              {project.description}
            </p>
          ) : (
            <p className="mt-2 text-on_surface_variant/70 text-sm font-label uppercase tracking-widest">
              No description
            </p>
          )}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="rounded-2xl bg-surface/60 border border-outline/10 px-4 py-3">
              <p className="font-label text-[10px] uppercase tracking-widest text-on_surface_variant">
                Pending
              </p>
              <p className="text-2xl font-headline font-bold text-tertiary tabular-nums">
                {pendingCount}
              </p>
            </div>
            <div className="rounded-2xl bg-surface/60 border border-outline/10 px-4 py-3">
              <p className="font-label text-[10px] uppercase tracking-widest text-on_surface_variant">
                Done
              </p>
              <p className="text-2xl font-headline font-bold text-on_surface_variant tabular-nums">
                {completedCount}
              </p>
            </div>
            <div className="rounded-2xl bg-surface/60 border border-outline/10 px-4 py-3 col-span-2 sm:col-span-2">
              <div className="flex justify-between items-baseline gap-2 mb-2">
                <p className="font-label text-[10px] uppercase tracking-widest text-on_surface_variant">
                  Pomodoro progress
                </p>
                <p className="text-sm font-headline font-bold text-primary tabular-nums">
                  {totalReal} / {totalEstimated} 🍅
                </p>
              </div>
              <div
                className="h-2 rounded-full bg-surface_variant overflow-hidden border border-outline/10"
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Estimated pomodoros completed"
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${String(progress)}%`,
                    backgroundColor: project.color,
                    boxShadow: `0 0 12px ${project.color}88`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
