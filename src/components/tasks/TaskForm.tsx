import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, Dialog } from '@/components/ui/Dialog'
import { cn } from '@/lib/utils'
import { useProjects } from '@/hooks/useProjects'
import { TaskSplitDialog } from './TaskSplitDialog'
import { useSplitTask } from '@/hooks/useTasks'
import type { Task } from '@/types'

interface TaskFormProps {
  onSubmit: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Task | undefined>
  onCancel: () => void
  initialData?: { name: string, projectId: string | null, estimatedPomodoros: number }
  title: string
}

export function TaskForm({ onSubmit, onCancel, initialData, title }: TaskFormProps) {
  const { data: projects } = useProjects()
  const [taskToSplit, setTaskToSplit] = useState<Task | null>(null)
  const { mutateAsync: splitTask } = useSplitTask()

  const form = useForm({
    defaultValues: initialData || {
      name: '',
      projectId: null as string | null,
      estimatedPomodoros: 1,
    },
    onSubmit: async ({ value }) => {
      const taskData = { ...value, realPomodoros: 0, status: 'pending' as const }

      if (value.estimatedPomodoros > 5) {
         const createdTask = await onSubmit(taskData)
         if (createdTask) setTaskToSplit(createdTask)
      } else {
         void onSubmit(taskData)
      }
    },
  })

  return (
    <>
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>Add a task and estimate its size in Pomodoros.</DialogDescription>
      </DialogHeader>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          void form.handleSubmit()
        }}
        className="space-y-6 py-4"
      >
        <form.Field
          name="name"
          children={(field) => (
            <div className="space-y-2">
              <label htmlFor={field.name} className="font-label text-[10px] uppercase tracking-wider text-on_surface_variant">
                Task Name
              </label>
              <input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => { field.handleChange(e.target.value); }}
                required
                className={cn(
                  "w-full bg-surface_variant border-b-2 border-outline/20 p-3 outline-none transition-all focus:border-tertiary font-headline",
                )}
                placeholder="Launch rocket..."
              />
            </div>
          )}
        />

        <form.Field
          name="projectId"
          children={(field) => (
            <div className="space-y-2">
              <label htmlFor={field.name} className="font-label text-[10px] uppercase tracking-wider text-on_surface_variant">
                Project (Optional)
              </label>
              <select
                id={field.name}
                name={field.name}
                value={field.state.value || ''}
                onBlur={field.handleBlur}
                onChange={(e) => { field.handleChange(e.target.value || null); }}
                className="w-full bg-surface_variant border-b-2 border-outline/20 p-3 outline-none transition-all focus:border-secondary"
              >
                <option value="">No Project</option>
                {projects?.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}
        />

        <form.Field
          name="estimatedPomodoros"
          children={(field) => (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="font-label text-[10px] uppercase tracking-wider text-on_surface_variant">
                  Estimation (Pomodoros)
                </label>
                <span className={cn(
                  "font-headline font-bold text-lg",
                  field.state.value > 5 ? "text-primary" : "text-tertiary"
                )}>
                  {field.state.value} 🍅
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={field.state.value}
                onChange={(e) => { field.handleChange(parseInt(e.target.value)); }}
                className="w-full accent-tertiary"
              />
            </div>
          )}
        />

        <DialogFooter className="pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 rounded-xl font-label text-xs uppercase tracking-widest text-on_surface_variant hover:bg-surface_variant transition-colors"
          >
            Cancel
          </button>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="bg-tertiary text-on_tertiary px-8 py-2.5 rounded-xl font-headline font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(255,224,74,0.3)] hover:shadow-[0_0_25px_rgba(255,224,74,0.5)] transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Adding...' : 'Add Task'}
              </button>
            )}
          />
        </DialogFooter>
      </form>
    </DialogContent>

    <Dialog open={!!taskToSplit} onOpenChange={() => { setTaskToSplit(null); }}>
       {taskToSplit && (
         <TaskSplitDialog
           task={taskToSplit}
           onConfirm={async () => {
              await splitTask(taskToSplit.id)
              setTaskToSplit(null)
              onCancel()
           }}
           onCancel={() => {
              setTaskToSplit(null)
              onCancel()
           }}
         />
       )}
    </Dialog>
    </>
  )
}
