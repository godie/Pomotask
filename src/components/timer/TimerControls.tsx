
import { useTimerStore } from '@/stores/timerStore'
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react'
import { cn } from '@/lib/utils'

export function TimerControls() {
  const { status, mode, start, pause, resume, reset, skip } = useTimerStore()

  const isRunning = status === 'running'
  const isPaused = status === 'paused'
  const isIdle = status === 'idle'

  const buttonBase = "p-4 rounded-full transition-all duration-300 transform active:scale-95 shadow-lg border-2"

  const colors = {
    focus: 'border-primary/50 text-primary hover:bg-primary/10 shadow-primary/20',
    short_break: 'border-secondary/50 text-secondary hover:bg-secondary/10 shadow-secondary/20',
    long_break: 'border-tertiary/50 text-tertiary hover:bg-tertiary/10 shadow-tertiary/20',
  }

  return (
    <div className="flex gap-6 items-center">
      <button
        onClick={reset}
        className={cn(buttonBase, "border-outline/30 text-outline hover:bg-surface_variant")}
        title="Reset"
      >
        <RotateCcw size={24} />
      </button>

      {isIdle && (
        <button
          onClick={start}
          className={cn(buttonBase, colors[mode], "bg-surface")}
        >
          <Play size={32} fill="currentColor" />
        </button>
      )}

      {isRunning && (
        <button
          onClick={pause}
          className={cn(buttonBase, colors[mode], "bg-surface")}
        >
          <Pause size={32} fill="currentColor" />
        </button>
      )}

      {isPaused && (
        <button
          onClick={resume}
          className={cn(buttonBase, colors[mode], "bg-surface animate-pulse")}
        >
          <Play size={32} fill="currentColor" />
        </button>
      )}

      <button
        onClick={skip}
        className={cn(buttonBase, "border-outline/30 text-outline hover:bg-surface_variant")}
        title="Skip"
      >
        <SkipForward size={24} />
      </button>
    </div>
  )
}
