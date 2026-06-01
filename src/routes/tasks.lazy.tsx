import { createLazyFileRoute } from "@tanstack/react-router";
import {
  useAllTasks,
  useCreateTask,
  useDeleteTask,
  useUpdateTask,
} from "@/hooks/useTasks";
import { TaskList } from "@/components/tasks/TaskList";
import { LazyTaskForm } from "@/components/tasks/LazyTaskForm";
import { Dialog, DialogTrigger } from "@/components/ui/Dialog";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

export function TasksPage() {
  const { data: tasks, isLoading } = useAllTasks();
  const { mutateAsync: createTask } = useCreateTask();
  const { mutateAsync: deleteTask } = useDeleteTask();
  const { mutateAsync: updateTask } = useUpdateTask();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  if (isLoading)
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton
            key={`task-skeleton-${String(i)}`}
            className="h-20 rounded-2xl"
          />
        ))}
      </div>
    );

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6 sm:mb-10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-headline font-bold text-on_surface mb-2">
            Tasks
          </h1>
          <p className="text-on_surface_variant text-sm">
            Focus on one neon step at a time.
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <button className="bg-surface border-2 border-tertiary/50 text-tertiary px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl font-headline font-bold uppercase tracking-widest flex items-center gap-2 hover:border-tertiary hover:shadow-[0_0_20px_rgba(255,224,74,0.3)] transition-all active:scale-95 [text-shadow:0_0_8px_rgba(255,224,74,0.5)]">
              <Plus size={20} />
              <span className="hidden sm:inline">New Task</span>
            </button>
          </DialogTrigger>
          <LazyTaskForm
            title="Add New Task"
            onSubmit={async (data) => {
              const created = await createTask(data);
              if (data.estimatedPomodoros <= 5) setIsCreateOpen(false);
              return created;
            }}
            onCancel={() => {
              setIsCreateOpen(false);
            }}
          />
        </Dialog>
      </div>

      <TaskList
        tasks={tasks || []}
        onDelete={deleteTask}
        onToggleComplete={(task) =>
          updateTask({
            id: task.id,
            data: {
              status: task.status === "completed" ? "pending" : "completed",
              completedAt: task.status === "completed" ? undefined : Date.now(),
            },
          })
        }
      />
    </div>
  );
}

export const Route = createLazyFileRoute("/tasks")({
  component: TasksPage,
});
