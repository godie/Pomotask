import { createFileRoute } from '@tanstack/react-router'
import { useAllTasks, useCreateTask, useDeleteTask, useUpdateTask } from '@/hooks/useTasks'
import { TaskCard } from '@/components/tasks/TaskCard'
import { TaskForm } from '@/components/tasks/TaskForm'
import { Dialog, DialogTrigger } from '@/components/ui/Dialog'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Skeleton } from '@/components/ui/Skeleton'

function TasksPage() {
    const { data: tasks, isLoading } = useAllTasks()
    const { mutateAsync: createTask } = useCreateTask()
    const { mutateAsync: deleteTask } = useDeleteTask()
    const { mutateAsync: updateTask } = useUpdateTask()
    const [isCreateOpen, setIsCreateOpen] = useState(false)

    if (isLoading) return (
      <div className="space-y-4">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}
      </div>
    )

    const pendingTasks = tasks?.filter(t => t.status === 'pending') || []
    const completedTasks = tasks?.filter(t => t.status === 'completed') || []

    return (
      <div className="animate-in fade-in duration-500">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-headline font-bold text-tertiary mb-2">Tasks</h1>
            <p className="text-on_surface_variant text-sm">Focus on one neon step at a time.</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <button className="bg-tertiary text-on_tertiary px-6 py-3 rounded-xl font-headline font-bold uppercase tracking-widest flex items-center gap-2 shadow-[0_0_15px_rgba(255,224,74,0.3)] hover:shadow-[0_0_25px_rgba(255,224,74,0.5)] transition-all active:scale-95">
                <Plus size={20} />
                <span className="hidden sm:inline">New Task</span>
              </button>
            </DialogTrigger>
            <TaskForm
              title="Add New Task"
              onSubmit={async (data) => {
                const created = await createTask(data)
                if (data.estimatedPomodoros <= 5) setIsCreateOpen(false)
                return created
              }}
              onCancel={() => { setIsCreateOpen(false); }}
            />
          </Dialog>
        </div>

        <div className="space-y-12">
           {pendingTasks.length > 0 && (
              <section>
                 <h2 className="font-label text-xs uppercase tracking-[0.2em] text-on_surface_variant mb-4 flex items-center gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
                   Pending ({pendingTasks.length})
                 </h2>
                 <div className="flex flex-col gap-3">
                   {pendingTasks.map(task => (
                     <TaskCard
                        key={task.id}
                        task={task}
                        onDelete={deleteTask}
                        onToggleComplete={() => updateTask({ id: task.id, data: { status: 'completed', completedAt: Date.now() } })}
                     />
                   ))}
                 </div>
              </section>
           )}

           {completedTasks.length > 0 && (
              <section>
                 <h2 className="font-label text-xs uppercase tracking-[0.2em] text-on_surface_variant mb-4 flex items-center gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-surface_variant" />
                   Completed ({completedTasks.length})
                 </h2>
                 <div className="flex flex-col gap-3">
                   {completedTasks.map(task => (
                     <TaskCard
                        key={task.id}
                        task={task}
                        onDelete={deleteTask}
                        onToggleComplete={() => updateTask({ id: task.id, data: { status: 'pending' } })}
                     />
                   ))}
                 </div>
              </section>
           )}

           {tasks?.length === 0 && (
             <div className="text-center py-20 border-2 border-dashed border-outline/10 rounded-3xl bg-surface_container/30">
               <h3 className="text-xl font-headline font-bold mb-2 text-on_surface_variant">Empty focus</h3>
               <p className="text-sm text-on_surface_variant/60">Your todo list is currently clear.</p>
             </div>
           )}
        </div>
      </div>
    )
}

export const Route = createFileRoute('/tasks')({
  component: TasksPage,
})
