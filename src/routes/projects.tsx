import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { isProjectDetailPath } from "@/lib/projectRoutes";
import {
  useProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
} from "@/hooks/useProjects";
import { useAllTasks, useCreateTask } from "@/hooks/useTasks";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { TaskForm } from "@/components/tasks/TaskForm";
import { Dialog } from "@/components/ui/Dialog";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import type { Project } from "@/types";

export function ProjectsLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (isProjectDetailPath(pathname)) {
    return <Outlet />;
  }

  return <ProjectsIndexPage />;
}

function ProjectsIndexPage() {
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: tasks, isLoading: tasksLoading } = useAllTasks();
  const { mutateAsync: createProject } = useCreateProject();
  const { mutateAsync: updateProject } = useUpdateProject();
  const { mutateAsync: deleteProject } = useDeleteProject();
  const { mutateAsync: createTask } = useCreateTask();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

  if (projectsLoading || tasksLoading)
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[1, 2, 3].map((i) => (
          <Skeleton
            key={`project-skeleton-${String(i)}`}
            className="h-48 rounded-2xl"
          />
        ))}
      </div>
    );

  const handleAddTask = (projectId: string) => {
    setSelectedProjectId(projectId);
    setIsTaskFormOpen(true);
  };

  const handleEdit = (project: Project) => {
    setProjectToEdit(project);
    setIsEditOpen(true);
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6 sm:mb-10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-headline font-bold text-secondary mb-2">
            Projects
          </h1>
          <p className="text-on_surface_variant text-sm">
            Organize your Pomodoros by project.
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <ProjectForm
            title="Create Project"
            onSubmit={async (data) => {
              await createProject(data);
              setIsCreateOpen(false);
            }}
            onCancel={() => {
              setIsCreateOpen(false);
            }}
          />
        </Dialog>
        <button
          onClick={() => {
            setIsCreateOpen(true);
          }}
          className="bg-secondary text-on_secondary px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl font-headline font-bold uppercase tracking-widest flex items-center gap-2 shadow-[0_0_15px_rgba(0,255,204,0.3)] hover:shadow-[0_0_25px_rgba(0,255,204,0.5)] transition-all active:scale-95"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">New Project</span>
        </button>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <ProjectForm
          title="Edit Project"
          initialData={
            projectToEdit
              ? {
                  name: projectToEdit.name,
                  color: projectToEdit.color,
                  description: projectToEdit.description || "",
                }
              : undefined
          }
          onSubmit={async (data) => {
            if (projectToEdit) {
              await updateProject({ id: projectToEdit.id, data });
            }
            setIsEditOpen(false);
            setProjectToEdit(null);
          }}
          onCancel={() => {
            setIsEditOpen(false);
            setProjectToEdit(null);
          }}
        />
      </Dialog>

      <Dialog open={isTaskFormOpen} onOpenChange={setIsTaskFormOpen}>
        <TaskForm
          title="Add Task"
          initialData={{
            name: "",
            projectId: selectedProjectId,
            estimatedPomodoros: 1,
          }}
          onSubmit={async (data) => {
            const task = await createTask(data);
            setIsTaskFormOpen(false);
            return task;
          }}
          onCancel={() => {
            setIsTaskFormOpen(false);
          }}
        />
      </Dialog>

      {projects?.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-outline/10 rounded-3xl bg-surface_container/30">
          <h3 className="text-xl font-headline font-bold mb-2">
            No projects yet
          </h3>
          <p className="text-on_surface_variant mb-8">
            Create your first project to organize your tasks.
          </p>
          <button
            onClick={() => {
              setIsCreateOpen(true);
            }}
            className="text-secondary font-bold hover:underline"
          >
            Start building now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {projects?.map((project) => {
            const projectTasks =
              tasks?.filter((t) => t.projectId === project.id) || [];
            return (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={deleteProject}
                onEdit={handleEdit}
                onAddTask={handleAddTask}
                taskCount={projectTasks.length}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute("/projects")({
  component: ProjectsLayout,
});
