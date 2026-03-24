
import { DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/Dialog'
import { splitTask } from '@/lib/pomodoro'
import type { Task } from '@/types'

interface TaskSplitDialogProps {
  task: Task
  onConfirm: () => void
  onCancel: () => void
}

export function TaskSplitDialog({ task, onConfirm, onCancel }: TaskSplitDialogProps) {
  const [part1, part2] = splitTask(task)

  return (
    <DialogContent className="max-w-md border-primary/30 shadow-[0_0_30px_rgba(255,45,120,0.15)]">
      <DialogHeader>
        <DialogTitle className="text-primary text-2xl flex items-center gap-2">
          <span>🍅</span> Task Too Big
        </DialogTitle>
        <DialogDescription>
          Everything is measured in Pomodoros. Tasks over 5 Pomodoros should be split to maintain focus.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-6">
        <div className="bg-surface_variant/40 p-4 rounded-xl border border-outline/10 opacity-70">
           <span className="font-label text-[10px] uppercase tracking-widest text-on_surface_variant">Original Task</span>
           <h4 className="font-headline font-bold mt-1 text-on_surface_variant line-through">{task.name} ({task.estimatedPomodoros} 🍅)</h4>
        </div>

        <div className="flex flex-col gap-3 relative">
           <div className="bg-surface_container border border-primary/20 p-4 rounded-xl shadow-lg relative z-10">
              <span className="font-label text-[10px] uppercase tracking-widest text-primary">Split - Part 1</span>
              <h4 className="font-headline font-bold mt-1 text-on_surface">{part1.name} ({part1.estimatedPomodoros} 🍅)</h4>
           </div>

           <div className="bg-surface_container border border-primary/20 p-4 rounded-xl shadow-lg relative z-10 translate-x-4">
              <span className="font-label text-[10px] uppercase tracking-widest text-primary">Split - Part 2</span>
              <h4 className="font-headline font-bold mt-1 text-on_surface">{part2.name} ({part2.estimatedPomodoros} 🍅)</h4>
           </div>

           <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-primary/50 to-primary/20 -z-1" />
        </div>
      </div>

      <DialogFooter className="gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-3 rounded-xl font-label text-xs uppercase tracking-widest text-on_surface_variant hover:bg-surface_variant transition-colors"
        >
          Keep as one task
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 bg-primary text-on_primary px-4 py-3 rounded-xl font-headline font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(255,45,120,0.3)] hover:shadow-[0_0_25px_rgba(255,45,120,0.5)] transition-all"
        >
          Split it!
        </button>
      </DialogFooter>
    </DialogContent>
  )
}
