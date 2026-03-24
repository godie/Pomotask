
import type { Project } from '@/types'
import { Folder, Trash2, Edit } from 'lucide-react'

interface ProjectCardProps {
  project: Project
  onDelete: (id: string) => void
  onEdit: (project: Project) => void
}

export function ProjectCard({ project, onDelete, onEdit }: ProjectCardProps) {
  return (
    <div className="bg-surface_container border border-outline/10 p-6 rounded-2xl shadow-xl transition-all duration-300 hover:border-secondary/40 hover:shadow-secondary/5 group">
      <div className="flex justify-between items-start mb-6">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
          style={{ backgroundColor: `${project.color}20`, border: `1px solid ${project.color}40` }}
        >
          <Folder size={24} style={{ color: project.color }} />
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => { onEdit(project); }}
            className="p-2 rounded-lg bg-surface_variant text-on_surface_variant hover:text-secondary hover:bg-secondary/10 transition-colors"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => { onDelete(project.id); }}
            className="p-2 rounded-lg bg-surface_variant text-on_surface_variant hover:text-error hover:bg-error/10 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <h3 className="text-xl font-headline font-bold text-on_surface mb-1 truncate">{project.name}</h3>
      {project.description && (
        <p className="text-sm text-on_surface_variant line-clamp-2 mb-4 h-10">{project.description}</p>
      )}

      <div className="flex justify-between items-center pt-4 border-t border-outline/5 font-label text-xs uppercase tracking-widest text-on_surface_variant">
        <span>0 Tasks</span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: project.color }} />
          <span>Active</span>
        </div>
      </div>
    </div>
  )
}
