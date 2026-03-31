import { createFileRoute } from "@tanstack/react-router";
import { useTimerStore } from "@/stores/timerStore";
import { TimerRing } from "@/components/timer/TimerRing";
import { TimerControls } from "@/components/timer/TimerControls";
import { BreakOverlay } from "@/components/timer/BreakOverlay";
import { TaskSelector } from "@/components/timer/TaskSelector";
import { TaskForm } from "@/components/tasks/TaskForm";
import { Dialog } from "@/components/ui/Dialog";
import { formatTime, cn } from "@/lib/utils";
import { FOCUS_DURATION, SHORT_BREAK, LONG_BREAK } from "@/lib/pomodoro";
import { useAllTasks, useCreateTask, useUpdateTask } from "@/hooks/useTasks";
import { useState } from "react";

function IndexPage() {
  const { status, secondsLeft, mode, activeTaskId, setActiveTask, skip } =
    useTimerStore();
  const { data: tasks } = useAllTasks();
  const { mutateAsync: createTask } = useCreateTask();
  const { mutateAsync: updateTask } = useUpdateTask();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const totalDuration =
    mode === "focus"
      ? FOCUS_DURATION
      : mode === "short_break"
        ? SHORT_BREAK
        : LONG_BREAK;
  const progress = secondsLeft / totalDuration;

  const modeColors = {
    focus: "text-primary drop-shadow-[0_0_8px_rgba(255,45,120,0.6)]",
    short_break: "text-secondary drop-shadow-[0_0_8px_rgba(0,255,204,0.6)]",
    long_break: "text-tertiary drop-shadow-[0_0_8px_rgba(255,224,74,0.6)]",
  };

  const handleToggleComplete = async (task: { id: string; status: string }) => {
    await updateTask({
      id: task.id,
      data: {
        status: task.status === "completed" ? "pending" : "completed",
        completedAt: task.status === "completed" ? undefined : Date.now(),
      },
    });
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8 sm:space-y-12 py-6 sm:py-10 animate-in fade-in duration-700">
      <div className="relative group">
        <TimerRing progress={progress} mode={mode} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-label text-sm uppercase tracking-widest text-on_surface_variant mb-2">
            {mode.replace("_", " ")}
          </span>
          <span
            className={cn(
              "font-headline text-5xl sm:text-6xl font-bold tracking-tighter tabular-nums",
              modeColors[mode],
            )}
          >
            {formatTime(secondsLeft)}
          </span>
        </div>
      </div>

      {status === "idle" && mode !== "focus" && (
        <BreakOverlay mode={mode} onSkip={skip} />
      )}
      <TimerControls />

      <TaskSelector
        tasks={tasks}
        activeTaskId={activeTaskId}
        setActiveTask={setActiveTask}
        onToggleComplete={handleToggleComplete}
        onCreateTask={() => {
          setIsCreateOpen(true);
        }}
      />

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <TaskForm
          title="Add Task"
          onSubmit={async (data) => {
            const task = await createTask(data);
            setIsCreateOpen(false);
            return task;
          }}
          onCancel={() => {
            setIsCreateOpen(false);
          }}
        />
      </Dialog>
    </div>
  );
}

export const Route = createFileRoute("/")({
  component: IndexPage,
});
