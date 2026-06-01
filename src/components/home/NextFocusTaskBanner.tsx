import type { Task } from "@/types";
import { cn } from "@/lib/utils";

interface NextFocusTaskBannerProps {
  task: Task | undefined;
  projectName: string | null;
  /** Nested in sidebar during break — lighter frame */
  compact?: boolean;
}

export function NextFocusTaskBanner({
  task,
  projectName,
  compact = false,
}: NextFocusTaskBannerProps) {
  if (!task) {
    return (
      <p
        className={cn(
          "text-center font-label text-xs uppercase tracking-widest text-on_surface_variant max-w-md px-4",
          compact && "text-left px-0",
        )}
      >
        Pick a task from the list to start your next focus block
      </p>
    );
  }

  const projectLine =
    projectName ?? (task.projectId ? "Project" : "No project");

  return (
    <div
      className={cn(
        "w-full max-w-md rounded-2xl border px-4 py-3 text-left",
        compact
          ? "border-outline/10 bg-surface/50"
          : "border-primary/25 bg-surface_container/90 shadow-[0_0_20px_rgba(255,45,120,0.12)]",
      )}
    >
      <p
        className={cn(
          "font-label text-[10px] uppercase tracking-widest mb-1",
          compact ? "text-on_surface_variant" : "text-primary",
        )}
      >
        Next focus
      </p>
      <p className="font-headline font-bold text-on_surface leading-snug break-words">
        {task.name}
      </p>
      <p className="mt-1 text-xs text-on_surface_variant">
        {projectLine}
        <span aria-hidden className="mx-1.5">
          •
        </span>
        {task.realPomodoros}/{task.estimatedPomodoros} Pomodoros
      </p>
    </div>
  );
}
