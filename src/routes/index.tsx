import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useTimerStore } from "@/stores/timerStore";
import { TimerRing } from "@/components/timer/TimerRing";
import { LabelledTimerControls } from "@/components/timer/LabelledTimerControls";
import { BreakTimerPanel } from "@/components/timer/BreakTimerPanel";
import { formatTime, cn } from "@/lib/utils";
import {
  FOCUS_DURATION,
  SHORT_BREAK,
  LONG_BREAK,
  POMODOROS_UNTIL_LONG_BREAK,
} from "@/lib/pomodoro";
import { useAllTasks, useCreateTask, useUpdateTask } from "@/hooks/useTasks";
import { useProjects } from "@/hooks/useProjects";
import { useFocusStats } from "@/hooks/useFocusStats";
import { DashboardFocusStats } from "@/components/home/DashboardFocusStats";
import { DashboardInlineTasks } from "@/components/home/DashboardInlineTasks";
import { NextFocusTaskBanner } from "@/components/home/NextFocusTaskBanner";
import type { Task } from "@/types";

function modeLabel(mode: "focus" | "short_break" | "long_break"): string {
  if (mode === "focus") return "Focus mode";
  if (mode === "short_break") return "Short break";
  return "Long break";
}

function IndexPage() {
  const {
    secondsLeft,
    mode,
    activeTaskId,
    pomodorosCompleted,
    setActiveTask,
  } = useTimerStore();
  const { data: tasks } = useAllTasks();
  const { data: projects } = useProjects();
  const { mutateAsync: createTask } = useCreateTask();
  const { mutateAsync: updateTask } = useUpdateTask();
  const { streakDays, totalFocusedLabel } = useFocusStats();

  const isBreak = mode !== "focus";

  const totalDuration =
    mode === "focus"
      ? FOCUS_DURATION
      : mode === "short_break"
        ? SHORT_BREAK
        : LONG_BREAK;
  const progress = secondsLeft / totalDuration;

  const modeColors = {
    focus: "text-primary drop-shadow-[0_0_10px_rgba(255,45,120,0.55)]",
    short_break: "text-secondary drop-shadow-[0_0_10px_rgba(0,255,204,0.5)]",
    long_break: "text-tertiary drop-shadow-[0_0_10px_rgba(255,224,74,0.45)]",
  };

  const activeTask = tasks?.find((t) => t.id === activeTaskId);
  const projectMap = useMemo(() => {
    const m = new Map<string, string>();
    projects?.forEach((p) => {
      m.set(p.id, p.name);
    });
    return m;
  }, [projects]);

  const activeProjectName =
    activeTask?.projectId != null
      ? (projectMap.get(activeTask.projectId) ?? null)
      : null;

  const cycleSlot =
    (pomodorosCompleted % POMODOROS_UNTIL_LONG_BREAK) + 1;

  const handleToggleComplete = async (task: Task) => {
    await updateTask({
      id: task.id,
      data: {
        status: task.status === "completed" ? "pending" : "completed",
        completedAt: task.status === "completed" ? undefined : Date.now(),
      },
    });
  };

  const handleCreateTask = async (
    data: Omit<Task, "id" | "createdAt" | "updatedAt">,
  ) => {
    return createTask(data);
  };

  return (
    <div
      className={cn(
        "max-w-6xl mx-auto w-full animate-in fade-in duration-700",
        "bg-[linear-gradient(rgba(255,45,120,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,45,120,0.03)_1px,transparent_1px)] bg-[size:48px_48px]",
      )}
    >
      <div className="grid gap-8 lg:gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(320px,380px)] items-start">
        <section className="flex flex-col items-center text-center space-y-5 sm:space-y-7 pt-2 pb-4">
          <p className="font-label text-[10px] sm:text-xs uppercase tracking-[0.35em] text-on_surface_variant">
            {modeLabel(mode)}
          </p>

          {isBreak ? <BreakTimerPanel mode={mode} /> : null}

          <div className="relative">
            <TimerRing progress={progress} mode={mode} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span
                className={cn(
                  "font-headline text-5xl sm:text-6xl md:text-7xl font-bold tracking-tighter tabular-nums",
                  modeColors[mode],
                )}
              >
                {formatTime(secondsLeft)}
              </span>
            </div>
          </div>

          {!isBreak ? (
            <NextFocusTaskBanner
              task={activeTask}
              projectName={activeProjectName}
            />
          ) : null}

          <LabelledTimerControls hideReset={isBreak} />
        </section>

        <aside className="flex flex-col gap-4 sm:gap-5 w-full lg:pt-10">
          <DashboardFocusStats
            streakDays={streakDays}
            totalFocusedLabel={totalFocusedLabel}
          />

          {isBreak ? (
            <div className="rounded-2xl border border-outline/15 bg-surface_container/60 px-4 py-3">
              <p className="font-label text-[10px] uppercase tracking-widest text-on_surface_variant mb-2">
                After this break
              </p>
              <NextFocusTaskBanner
                task={activeTask}
                projectName={activeProjectName}
                compact
              />
            </div>
          ) : null}

          <DashboardInlineTasks
            tasks={tasks}
            projects={projects}
            activeTaskId={activeTaskId}
            setActiveTask={setActiveTask}
            onToggleComplete={handleToggleComplete}
            onCreateTask={handleCreateTask}
          />

          {!isBreak && activeTask ? (
            <p className="text-center lg:text-left font-label text-[10px] uppercase tracking-widest text-on_surface_variant px-1">
              Cycle {cycleSlot} / {POMODOROS_UNTIL_LONG_BREAK} — long break
              after every {POMODOROS_UNTIL_LONG_BREAK} focus blocks
            </p>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/")({
  component: IndexPage,
});
