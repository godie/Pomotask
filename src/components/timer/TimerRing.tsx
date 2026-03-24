
import { cn } from '@/lib/utils'

interface TimerRingProps {
  progress: number // 0 to 1
  mode: 'focus' | 'short_break' | 'long_break'
  className?: string
}

export function TimerRing({ progress, mode, className }: TimerRingProps) {
  const radius = 120
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - progress)

  const colors = {
    focus: 'stroke-primary shadow-[0_0_15px_rgba(255,45,120,0.5)]',
    short_break: 'stroke-secondary shadow-[0_0_15px_rgba(0,255,204,0.5)]',
    long_break: 'stroke-tertiary shadow-[0_0_15px_rgba(255,224,74,0.5)]',
  }

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <svg className="w-72 h-72 transform -rotate-90">
        <circle
          cx="144"
          cy="144"
          r={radius}
          className="stroke-surface_variant fill-none"
          strokeWidth="8"
        />
        <circle
          cx="144"
          cy="144"
          r={radius}
          className={cn(
            "fill-none transition-all duration-1000 ease-linear",
            colors[mode]
          )}
          strokeWidth="8"
          strokeDasharray={circumference}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}
