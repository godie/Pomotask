import { createFileRoute, Link } from "@tanstack/react-router";
import { useProject } from "@/hooks/useProjects";
import { useTasksByProject, useDeleteTask, useUpdateTask } from "@/hooks/useTasks";
import { TaskList } from "@/components/tasks/TaskList";
import { ProjectOverviewHero } from "@/components/projects/ProjectOverviewHero";
import { Skeleton } from "@/components/ui/Skeleton";
import { ArrowLeft, Plus } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogTrigger } from "@/components/ui/Dialog";
import { TaskForm } from "@/components/tasks/TaskForm";
import { useCreateTask } from "@/hooks/useTasks";
export function ProjectDetailPage({ projectId }: { projectId: string }) {
  const {
    data: project,
    isLoading: projectLoading,
  } = useProject(projectId);
  const { data: tasks, isLoading: tasksLoading } = useTasksByProject(projectId);
  const { mutateAsync: deleteTask } = useDeleteTask();
  const { mutateAsync: updateTask } = useUpdateTask();
  const { mutateAsync: createTask } = useCreateTask();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  if (projectLoading || tasksLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 rounded-3xl" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={String(i)} className="h-20 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!project) return <div>Project not found</div>;

  const list = tasks ?? [];
  const totalEstimated = list.reduce((acc, t) => acc + t.estimatedPomodoros, 0);
  const totalReal = list.reduce((acc, t) => acc + t.realPomodoros, 0);
  const pendingCount = list.filter(
    (t) => t.status === "pending" || t.status === "in_progress",
  ).length;
  const completedCount = list.filter((t) => t.status === "completed").length;

  return (
    <div className="animate-in fade-in duration-500">
      <Link
        to="/projects"
        className="inline-flex items-center gap-2 text-on_surface_variant hover:text-primary transition-colors mb-6 group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span className="font-label text-xs uppercase tracking-widest">Back to Projects</span>
      </Link>

      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
        <div className="flex-1 min-w-0">
          <ProjectOverviewHero
            project={project}
            pendingCount={pendingCount}
            completedCount={completedCount}
            totalEstimated={totalEstimated}
            totalReal={totalReal}
          />
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <button className="shrink-0 w-full lg:w-auto bg-surface border-2 border-tertiary/50 text-tertiary px-6 py-3 rounded-xl font-headline font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:border-tertiary hover:shadow-[0_0_20px_rgba(255,224,74,0.3)] transition-all active:scale-95 [text-shadow:0_0_8px_rgba(255,224,74,0.5)]">
              <Plus size={20} />
              <span>Add Task</span>
            </button>
          </DialogTrigger>
          <TaskForm
            title="Add Task to Project"
            initialData={{ name: '', projectId: project.id, estimatedPomodoros: 1 }}
            onSubmit={async (data) => {
              const created = await createTask({ ...data, projectId: project.id });
              if (data.estimatedPomodoros <= 5) setIsCreateOpen(false);
              return created;
            }}
            onCancel={() => {
              setIsCreateOpen(false);
            }}
          />
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <section>
          <h2 className="font-label text-xs uppercase tracking-[0.2em] text-on_surface_variant mb-4">
            Tasks
          </h2>
          <TaskList
            tasks={list}
            projectId={project.id}
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
        </section>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/projects/$projectId")({
  component: function ProjectDetailRoute() {
    const { projectId } = Route.useParams();
    return <ProjectDetailPage projectId={projectId} />;
  },
});
