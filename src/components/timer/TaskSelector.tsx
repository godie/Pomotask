import { useState } from "react";
import type { Task } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/Dialog";
import { Plus, ChevronDown, Check } from "lucide-react";

interface TaskSelectorProps {
  tasks: Task[] | undefined;
  activeTaskId: string | null;
  setActiveTask: (taskId: string | null) => void;
  onToggleComplete?: (task: Task) => void;
  onCreateTask?: () => void;
  /** When both are set, the task picker dialog is controlled by the parent (e.g. dashboard overflow menu). */
  taskPickerOpen?: boolean;
  onTaskPickerOpenChange?: (open: boolean) => void;
  /** Only render the picker dialog (no summary card). */
  variant?: "default" | "pickerOnly";
}

export function TaskSelector({
  tasks,
  activeTaskId,
  setActiveTask,
  onToggleComplete,
  onCreateTask,
  taskPickerOpen: controlledPickerOpen,
  onTaskPickerOpenChange,
  variant = "default",
}: TaskSelectorProps) {
  const isPickerControlled =
    controlledPickerOpen !== undefined && onTaskPickerOpenChange !== undefined;
  const [internalPickerOpen, setInternalPickerOpen] = useState(false);
  const isPickerOpen = isPickerControlled
    ? controlledPickerOpen
    : internalPickerOpen;
  const setPickerOpen = isPickerControlled
    ? onTaskPickerOpenChange
    : setInternalPickerOpen;

  const [isCompletedOpen, setIsCompletedOpen] = useState(true);

  const activeTask = tasks?.find((t) => t.id === activeTaskId);
  const pendingTasks =
    tasks?.filter((t) => t.status === "pending" && t.id !== activeTaskId) || [];
  const completedTasks = tasks?.filter((t) => t.status === "completed") || [];
  const displayTasks = pendingTasks.slice(0, 10);

  return (
    <>
      {variant === "default" ? (
        <div className="w-full max-w-md bg-surface_container border border-outline/10 p-6 rounded-2xl shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <span className="font-label text-xs text-on_surface_variant uppercase tracking-wider">
              Tasks
            </span>
            <button
              onClick={() => {
                onCreateTask?.();
              }}
              className="text-xs text-secondary font-bold hover:glow-secondary transition-all flex items-center gap-1"
            >
              <Plus size={14} />
              <span>New</span>
            </button>
          </div>

          {activeTask ? (
            <div className="flex items-center gap-4 animate-in slide-in-from-left-4 duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-[0_0_10px_rgba(255,45,120,0.1)]">
                <span className="text-xl">🍅</span>
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="font-bold text-on_surface font-headline truncate">
                  {activeTask.name}
                </span>
                <span className="text-xs text-primary font-bold uppercase tracking-widest">
                  {activeTask.realPomodoros} / {activeTask.estimatedPomodoros}{" "}
                  Pomodoros
                </span>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                setPickerOpen(true);
              }}
              className="w-full flex items-center gap-4 text-on_surface_variant/40 italic hover:text-on_surface_variant transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-surface_variant border border-outline/5 flex items-center justify-center grayscale">
                <span className="text-xl">🍅</span>
              </div>
              <span>Select a task to stay focused...</span>
            </button>
          )}
        </div>
      ) : null}

      <Dialog open={isPickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle>Tasks</DialogTitle>
              <button
                onClick={() => {
                  setPickerOpen(false);
                  onCreateTask?.();
                }}
                className="text-xs text-secondary font-bold hover:text-secondary/80 transition-colors flex items-center gap-1"
              >
                <Plus size={14} />
                <span>New</span>
              </button>
            </div>
            <DialogDescription>
              Select a task or create a new one
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-2 py-4 px-1">
            {displayTasks.length > 0 ? (
              displayTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 bg-surface_variant hover:bg-surface_container_high p-4 rounded-xl border border-outline/5 transition-colors group"
                >
                  {onToggleComplete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleComplete(task);
                      }}
                      className="w-6 h-6 rounded-full border-2 border-outline/20 flex items-center justify-center hover:border-primary transition-colors flex-shrink-0"
                      aria-label={`Complete ${task.name}`}
                    >
                      <Check
                        size={14}
                        className="text-transparent group-hover:text-primary transition-colors"
                      />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setActiveTask(task.id);
                      setPickerOpen(false);
                    }}
                    className="flex-1 text-left flex justify-between items-center"
                  >
                    <span className="font-headline font-bold text-on_surface group-hover:text-primary transition-colors truncate">
                      {task.name}
                    </span>
                    <span className="text-xs font-label text-on_surface_variant ml-2 flex-shrink-0">
                      {task.realPomodoros}/{task.estimatedPomodoros} 🍅
                    </span>
                  </button>
                </div>
              ))
            ) : tasks?.length === 0 ? (
              <div className="text-center py-10 space-y-4">
                <p className="text-on_surface_variant italic">No tasks yet</p>
                <button
                  onClick={() => {
                    setPickerOpen(false);
                    onCreateTask?.();
                  }}
                  className="text-secondary font-bold hover:underline"
                >
                  Create your first task
                </button>
              </div>
            ) : null}

            {completedTasks.length > 0 && (
              <div className="pt-4 border-t border-outline/10">
                <button
                  onClick={() => {
                    setIsCompletedOpen(!isCompletedOpen);
                  }}
                  className="flex items-center gap-2 text-xs text-on_surface_variant font-label uppercase tracking-wider w-full"
                >
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${isCompletedOpen ? "rotate-180" : ""}`}
                  />
                  <span>Completed ({completedTasks.length})</span>
                </button>

                {isCompletedOpen && (
                  <div className="mt-2 space-y-2">
                    {completedTasks.slice(0, 5).map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 bg-surface_variant/50 p-3 rounded-xl opacity-60"
                      >
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <Check size={12} className="text-primary" />
                        </div>
                        <span className="font-headline text-on_surface_variant truncate text-sm">
                          {task.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
