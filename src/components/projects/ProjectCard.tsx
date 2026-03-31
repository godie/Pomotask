import { Link } from "@tanstack/react-router";
import type { Project } from "@/types";
import { Folder, Trash2, Edit, Plus } from "lucide-react";

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string) => void;
  onEdit: (project: Project) => void;
  onAddTask: (projectId: string) => void;
  taskCount: number;
}

export function ProjectCard({
  project,
  onDelete,
  onEdit,
  onAddTask,
  taskCount,
}: ProjectCardProps) {
  return (
    <div className="bg-surface_container border border-outline/10 p-5 sm:p-6 rounded-2xl shadow-xl transition-all duration-300 hover:border-secondary/40 hover:shadow-secondary/5 group relative">
      <div className="flex justify-between items-start mb-6">
        <Link
          to="/projects/$projectId"
          params={{ projectId: project.id }}
          className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
          style={{
            backgroundColor: `${project.color}20`,
            border: `1px solid ${project.color}40`,
          }}
        >
          <Folder size={24} style={{ color: project.color }} />
        </Link>
        <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit(project);
            }}
            aria-label="Edit Project"
            className="p-2 rounded-lg bg-surface_variant text-on_surface_variant hover:text-secondary hover:bg-secondary/10 transition-colors"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(project.id);
            }}
            aria-label="Delete Project"
            className="p-2 rounded-lg bg-surface_variant text-on_surface_variant hover:text-error hover:bg-error/10 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <Link
        to="/projects/$projectId"
        params={{ projectId: project.id }}
        className="block"
      >
        <h3 className="text-xl font-headline font-bold text-on_surface mb-1 truncate hover:text-secondary transition-colors">
          {project.name}
        </h3>
        {project.description && (
          <p className="text-sm text-on_surface_variant line-clamp-2 mb-2 h-10">
            {project.description}
          </p>
        )}
      </Link>

      <button
        onClick={() => {
          onAddTask(project.id);
        }}
        className="w-full mt-4 py-2.5 rounded-xl bg-secondary/10 text-secondary border border-secondary/20 hover:bg-secondary/20 transition-colors font-label text-xs uppercase tracking-widest flex items-center justify-center gap-2"
      >
        <Plus size={16} />
        <span>Add Task</span>
      </button>

      <div className="flex justify-between items-center pt-4 border-t border-outline/5 font-label text-xs uppercase tracking-widest text-on_surface_variant mt-4">
        <span className="hover:text-secondary transition-colors">
          {taskCount} {taskCount === 1 ? "Task" : "Tasks"}
        </span>
        <div className="flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: project.color }}
          />
          <span>Active</span>
        </div>
      </div>
    </div>
  );
}
