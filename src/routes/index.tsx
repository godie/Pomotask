import { createFileRoute } from '@tanstack/react-router'
import { useTimerStore } from '@/stores/timerStore'
import { TimerRing } from '@/components/timer/TimerRing'
import { TimerControls } from '@/components/timer/TimerControls'
import { BreakOverlay } from "@/components/timer/BreakOverlay"
import { formatTime, cn } from '@/lib/utils'
import { useState } from 'react'
import { FOCUS_DURATION, SHORT_BREAK, LONG_BREAK } from '@/lib/pomodoro'
import { useAllTasks } from '@/hooks/useTasks'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog'

function IndexPage() {
    const { status, secondsLeft, mode, activeTaskId, setActiveTask, skip } = useTimerStore()
    const { data: tasks } = useAllTasks()
    const [isSelectTaskOpen, setIsSelectTaskOpen] = useState(false)

    const totalDuration = mode === 'focus' ? FOCUS_DURATION : mode === 'short_break' ? SHORT_BREAK : LONG_BREAK
    const progress = secondsLeft / totalDuration

    const modeColors = {
      focus: 'text-primary drop-shadow-[0_0_8px_rgba(255,45,120,0.6)]',
      short_break: 'text-secondary drop-shadow-[0_0_8px_rgba(0,255,204,0.6)]',
      long_break: 'text-tertiary drop-shadow-[0_0_8px_rgba(255,224,74,0.6)]',
    }

    const activeTask = tasks?.find(t => t.id === activeTaskId)
    const pendingTasks = tasks?.filter(t => t.status === 'pending' && t.id !== activeTaskId) || []

    return (
      <div className="flex flex-col items-center justify-center space-y-12 py-10 animate-in fade-in duration-700">
        <div className="relative group">
          <TimerRing progress={progress} mode={mode} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-label text-sm uppercase tracking-widest text-on_surface_variant mb-2">
              {mode.replace('_', ' ')}
            </span>
            <span className={cn("font-headline text-6xl font-bold tracking-tighter tabular-nums", modeColors[mode])}>
              {formatTime(secondsLeft)}
            </span>
          </div>
        </div>

        {status === "idle" && mode !== "focus" && <BreakOverlay mode={mode} onSkip={skip} />}
        <TimerControls />

        <div className="w-full max-w-md bg-surface_container border border-outline/10 p-6 rounded-2xl shadow-xl">
           <div className="flex justify-between items-center mb-4">
              <span className="font-label text-xs text-on_surface_variant uppercase tracking-wider">Active Task</span>
              <button
                onClick={() => { setIsSelectTaskOpen(true); }}
                className="text-xs text-secondary font-bold hover:glow-secondary transition-all"
              >
                Change Task
              </button>
           </div>

           {activeTask ? (
             <div className="flex items-center gap-4 animate-in slide-in-from-left-4 duration-300">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-[0_0_10px_rgba(255,45,120,0.1)]">
                  <span className="text-xl">🍅</span>
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="font-bold text-on_surface font-headline truncate">{activeTask.name}</span>
                  <span className="text-xs text-primary font-bold uppercase tracking-widest">
                    {activeTask.realPomodoros} / {activeTask.estimatedPomodoros} Pomodoros
                  </span>
                </div>
             </div>
           ) : (
             <div className="flex items-center gap-4 text-on_surface_variant/40 italic">
                <div className="w-12 h-12 rounded-xl bg-surface_variant border border-outline/5 flex items-center justify-center grayscale">
                  <span className="text-xl">🍅</span>
                </div>
                <span>Select a task to stay focused...</span>
             </div>
           )}
        </div>

        <Dialog open={isSelectTaskOpen} onOpenChange={setIsSelectTaskOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Select Focus Task</DialogTitle>
              <DialogDescription>Which task are you working on right now?</DialogDescription>
            </DialogHeader>
            <div className="max-h-[300px] overflow-y-auto space-y-2 py-4 px-1">
              {pendingTasks.length > 0 ? (
                pendingTasks.map(task => (
                  <button
                    key={task.id}
                    onClick={() => {
                      setActiveTask(task.id)
                      setIsSelectTaskOpen(false)
                    }}
                    className="w-full text-left bg-surface_variant hover:bg-surface_container_high p-4 rounded-xl border border-outline/5 transition-colors group"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-headline font-bold text-on_surface group-hover:text-primary transition-colors">{task.name}</span>
                      <span className="text-xs font-label text-on_surface_variant">{task.estimatedPomodoros} 🍅</span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-10 text-on_surface_variant italic">No pending tasks found.</div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
}

export const Route = createFileRoute('/')({
  component: IndexPage,
})
