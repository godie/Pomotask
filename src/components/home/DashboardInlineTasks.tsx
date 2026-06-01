import { useState } from "react";
import type { Task } from "@/types";
import { Check, ChevronDown, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/Dialog";
import { TaskSplitDialog } from "@/components/tasks/TaskSplitDialog";
import { useSplitTask } from "@/hooks/useTasks";

interface DashboardInlineTasksProps {
  tasks: Task[] | undefined;
  projects: { id: string; name: string }[] | undefined;
  activeTaskId: string | null;
  setActiveTask: (id: string | null) => void;
  onToggleComplete: (task: Task) => void;
  onCreateTask: (
    data: Omit<Task, "id" | "createdAt" | "updatedAt">,
  ) => Promise<Task>;
}

export function DashboardInlineTasks({
  tasks,
  projects,
  activeTaskId,
  setActiveTask,
  onToggleComplete,
  onCreateTask,
}: DashboardInlineTasksProps) {
  const [newName, setNewName] = useState("");
  const [estimate, setEstimate] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taskToSplit, setTaskToSplit] = useState<Task | null>(null);
  const [completedOpen, setCompletedOpen] = useState(false);
  const { mutateAsync: splitTask } = useSplitTask();

  const projectMap = new Map(projects?.map((p) => [p.id, p.name]) ?? []);

  const pending =
    tasks
      ?.filter((t) => t.status === "pending")
      .sort((a, b) => a.createdAt - b.createdAt) ?? [];
  const completed =
    tasks?.filter((t) => t.status === "completed").sort((a, b) => {
      const ac = a.completedAt ?? 0;
      const bc = b.completedAt ?? 0;
      return bc - ac;
    }) ?? [];

  const handleAdd = async () => {
    const name = newName.trim();
    if (!name || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const savedEstimate = estimate;
      const taskData: Omit<Task, "id" | "createdAt" | "updatedAt"> = {
        name,
        projectId: null,
        estimatedPomodoros: estimate,
        realPomodoros: 0,
        status: "pending",
      };
      const created = await onCreateTask(taskData);
      setNewName("");
      setEstimate(1);
      if (savedEstimate > 5) {
        setTaskToSplit(created);
      } else {
        setActiveTask(created.id);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full rounded-2xl border border-outline/15 bg-surface_container_high/90 p-4 sm:p-5 shadow-[inset_0_0_24px_rgba(255,45,120,0.04)] flex flex-col min-h-0 max-h-[min(420px,55vh)]">
      <div className="flex items-baseline justify-between gap-2 mb-3 shrink-0">
        <p className="font-label text-[10px] sm:text-xs uppercase tracking-widest text-on_surface_variant">
          Tasks
        </p>
        <p className="font-label text-xs text-secondary tabular-nums">
          {pending.length} pending
        </p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1.5 min-h-[120px] pr-1 -mr-1">
        {pending.length === 0 ? (
          <p className="text-sm text-on_surface_variant/80 py-6 text-center">
            No tasks yet. Add one below.
          </p>
        ) : (
          pending.map((task) => {
            const isActive = task.id === activeTaskId;
            const proj =
              task.projectId != null
                ? (projectMap.get(task.projectId) ?? "Project")
                : null;
            return (
              <div
                key={task.id}
                className={cn(
                  "flex items-stretch gap-2 rounded-xl border transition-colors",
                  isActive
                    ? "border-primary/45 bg-primary/5 shadow-[0_0_16px_rgba(255,45,120,0.12)]"
                    : "border-outline/10 bg-surface/40 hover:border-outline/25",
                )}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleComplete(task);
                  }}
                  className="shrink-0 w-10 flex items-center justify-center rounded-l-xl border-r border-outline/10 text-on_surface_variant hover:text-primary hover:bg-primary/5 transition-colors"
                  aria-label={`Complete ${task.name}`}
                >
                  <Check className="w-4 h-4" strokeWidth={2.5} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTask(task.id);
                  }}
                  className="flex-1 text-left py-3 pr-3 min-w-0"
                >
                  <span
                    className={cn(
                      "font-headline font-semibold block truncate",
                      isActive ? "text-primary" : "text-on_surface",
                    )}
                  >
                    {task.name}
                  </span>
                  <span className="text-[11px] text-on_surface_variant mt-0.5 block">
                    {proj ?? "No project"}
                    <span aria-hidden className="mx-1">
                      ·
                    </span>
                    {task.realPomodoros}/{task.estimatedPomodoros} 🍅
                  </span>
                </button>
              </div>
            );
          })
        )}
      </div>

      {completed.length > 0 ? (
        <div className="mt-3 pt-3 border-t border-outline/10 shrink-0">
          <button
            type="button"
            onClick={() => {
              setCompletedOpen(!completedOpen);
            }}
            className="flex items-center gap-2 text-[10px] font-label uppercase tracking-wider text-on_surface_variant w-full"
          >
            <ChevronDown
              className={cn(
                "w-3.5 h-3.5 transition-transform",
                completedOpen && "rotate-180",
              )}
            />
            Completed ({completed.length})
          </button>
          {completedOpen && (
            <ul className="mt-2 space-y-1 max-h-36 overflow-y-auto">
              {completed.slice(0, 8).map((task) => (
                <li
                  key={task.id}
                  className="flex items-center gap-2 rounded-lg border border-outline/10 bg-surface/30 px-2 py-1.5"
                >
                  <Check
                    className="w-3.5 h-3.5 shrink-0 text-tertiary"
                    aria-hidden
                  />
                  <span className="text-xs text-on_surface_variant flex-1 min-w-0 truncate">
                    {task.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onToggleComplete(task);
                    }}
                    className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-md font-label text-[10px] uppercase tracking-wider text-secondary hover:bg-secondary/10 border border-secondary/20 transition-colors"
                  >
                    <Undo2 className="w-3 h-3" aria-hidden />
                    Undo
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      <form
        className="mt-4 pt-3 border-t border-outline/10 flex flex-col gap-2 shrink-0"
        onSubmit={(e) => {
          e.preventDefault();
          void handleAdd();
        }}
      >
        <label htmlFor="inline-task-name" className="sr-only">
          New task name
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            id="inline-task-name"
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value);
            }}
            placeholder="New task…"
            maxLength={60}
            className="flex-1 min-w-0 bg-surface_variant border-b-2 border-outline/20 px-3 py-2.5 rounded-t-lg outline-none focus:border-secondary font-headline text-sm"
          />
          <div className="flex items-center gap-2 sm:w-auto">
            <label className="sr-only" htmlFor="inline-estimate">
              Pomodoros
            </label>
            <select
              id="inline-estimate"
              value={estimate}
              onChange={(e) => {
                setEstimate(Number(e.target.value));
              }}
              className="bg-surface_variant border border-outline/20 rounded-lg px-2 py-2 text-sm font-label shrink-0"
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} 🍅
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={!newName.trim() || isSubmitting}
              className="px-4 py-2.5 rounded-xl font-label text-xs font-bold uppercase tracking-wider bg-secondary/15 border border-secondary/40 text-secondary hover:bg-secondary/25 transition-colors disabled:opacity-40 shrink-0"
            >
              {isSubmitting ? "…" : "Add"}
            </button>
          </div>
        </div>
      </form>

      <Dialog
        open={!!taskToSplit}
        onOpenChange={() => {
          setTaskToSplit(null);
        }}
      >
        <DialogPortal>
          <DialogOverlay />
          {taskToSplit && (
            <TaskSplitDialog
              task={taskToSplit}
              onConfirm={async () => {
                await splitTask(taskToSplit.id);
                setTaskToSplit(null);
              }}
              onCancel={() => {
                setTaskToSplit(null);
              }}
            />
          )}
        </DialogPortal>
      </Dialog>
    </div>
  );
}
