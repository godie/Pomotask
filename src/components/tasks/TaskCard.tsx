
import type { Task } from '@/types'
import { Play, CheckCircle, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTimerStore } from '@/stores/timerStore'

interface TaskCardProps {
  task: Task
  onDelete: (id: string) => void
  onToggleComplete: (task: Task) => void
}

export function TaskCard({ task, onDelete, onToggleComplete }: TaskCardProps) {
  const { activeTaskId, setActiveTask, start } = useTimerStore()
  const isActive = activeTaskId === task.id
  const isCompleted = task.status === 'completed'

  const handleStart = () => {
    setActiveTask(task.id)
    start()
  }

  return (
    <div className={cn(
      "bg-surface_container border border-outline/10 p-5 rounded-2xl shadow-lg transition-all duration-300 flex items-center gap-4",
      isActive && "border-primary/40 shadow-primary/5 ring-1 ring-primary/20",
      isCompleted && "opacity-60"
    )}>
      <button
        onClick={() => { onToggleComplete(task); }}
        className={cn(
          "w-6 h-6 rounded-full border-2 transition-colors flex items-center justify-center",
          isCompleted ? "bg-tertiary border-tertiary text-on_tertiary" : "border-outline/30 hover:border-tertiary"
        )}
      >
        {isCompleted && <CheckCircle size={14} />}
      </button>

      <div className="flex-1 min-w-0">
        <h4 className={cn(
          "font-headline font-bold text-on_surface transition-all truncate",
          isCompleted && "line-through text-on_surface_variant"
        )}>
          {task.name}
        </h4>
        <div className="flex items-center gap-3 mt-1 font-label text-[10px] uppercase tracking-wider text-on_surface_variant">
          <span className="flex items-center gap-1 text-primary font-bold">
            <span className="text-xs">🍅</span> {task.realPomodoros} / {task.estimatedPomodoros}
          </span>
          {task.projectId && <span className="bg-surface_variant px-2 py-0.5 rounded">Project</span>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!isCompleted && !isActive && (
          <button
            onClick={handleStart}
            className="p-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all shadow-[0_0_10px_rgba(255,45,120,0.1)] active:scale-90"
            title="Start Timer"
          >
            <Play size={18} fill="currentColor" />
          </button>
        )}
        <button
          onClick={() => { onDelete(task.id); }}
          className="p-2.5 rounded-xl text-on_surface_variant hover:text-error hover:bg-error/10 transition-colors"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  )
}
