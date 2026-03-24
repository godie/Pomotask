import { createFileRoute } from '@tanstack/react-router'
import { useProjects, useCreateProject, useDeleteProject } from '@/hooks/useProjects'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { ProjectForm } from '@/components/projects/ProjectForm'
import { Dialog, DialogTrigger } from '@/components/ui/Dialog'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Skeleton } from '@/components/ui/Skeleton'

function ProjectsPage() {
    const { data: projects, isLoading } = useProjects()
    const { mutateAsync: createProject } = useCreateProject()
    const { mutateAsync: deleteProject } = useDeleteProject()
    const [isCreateOpen, setIsCreateOpen] = useState(false)

    if (isLoading) return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1,2,3].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}
      </div>
    )

    return (
      <div className="animate-in fade-in duration-500">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-headline font-bold text-secondary mb-2">Projects</h1>
            <p className="text-on_surface_variant text-sm">Organize your Pomodoros by project.</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <button className="bg-secondary text-on_secondary px-6 py-3 rounded-xl font-headline font-bold uppercase tracking-widest flex items-center gap-2 shadow-[0_0_15px_rgba(0,255,204,0.3)] hover:shadow-[0_0_25px_rgba(0,255,204,0.5)] transition-all active:scale-95">
                <Plus size={20} />
                <span className="hidden sm:inline">New Project</span>
              </button>
            </DialogTrigger>
            <ProjectForm
              title="Create Project"
              onSubmit={async (data) => {
                await createProject(data)
                setIsCreateOpen(false)
              }}
              onCancel={() => { setIsCreateOpen(false); }}
            />
          </Dialog>
        </div>

        {projects?.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-outline/10 rounded-3xl bg-surface_container/30">
            <h3 className="text-xl font-headline font-bold mb-2">No projects yet</h3>
            <p className="text-on_surface_variant mb-8">Create your first project to organize your tasks.</p>
            <button
               onClick={() => { setIsCreateOpen(true); }}
               className="text-secondary font-bold hover:underline"
            >
              Start building now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects?.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={deleteProject}
                onEdit={() => {}}
              />
            ))}
          </div>
        )}
      </div>
    )
}

export const Route = createFileRoute('/projects')({
  component: ProjectsPage,
})
