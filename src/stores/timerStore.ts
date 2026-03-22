import { create } from 'zustand'
import {
  FOCUS_DURATION,
  LONG_BREAK,
  POMODOROS_UNTIL_LONG_BREAK,
  SHORT_BREAK,
} from '@/lib/pomodoro'

export type TimerMode = 'focus' | 'short_break' | 'long_break'
export type TimerStatus = 'idle' | 'running' | 'paused' | 'break'

interface TimerState {
  status: TimerStatus
  mode: TimerMode
  secondsLeft: number
  pomodorosCompleted: number
  totalPomodorosToday: number
  activeTaskId: string | null
  start: () => void
  pause: () => void
  resume: () => void
  skip: () => void
  reset: () => void
  setActiveTask: (taskId: string | null) => void
}

const initialTimerFields = {
  status: 'idle' as const,
  mode: 'focus' as const,
  secondsLeft: FOCUS_DURATION,
  pomodorosCompleted: 0,
  totalPomodorosToday: 0,
  activeTaskId: null as string | null,
}

export const useTimerStore = create<TimerState>((set, get) => ({
  ...initialTimerFields,
  start: () => {
    if (get().status !== 'idle') return
    set({ status: 'running' })
  },
  pause: () => {
    if (get().status !== 'running') return
    set({ status: 'paused' })
  },
  resume: () => {
    if (get().status !== 'paused') return
    set({ status: 'running' })
  },
  skip: () => {
    if (get().mode !== 'focus') return
    const nextCompleted = get().pomodorosCompleted + 1
    const isLongBreak =
      nextCompleted > 0 && nextCompleted % POMODOROS_UNTIL_LONG_BREAK === 0
    set({
      pomodorosCompleted: nextCompleted,
      mode: isLongBreak ? 'long_break' : 'short_break',
      secondsLeft: isLongBreak ? LONG_BREAK : SHORT_BREAK,
      status: 'idle',
    })
  },
  reset: () => {
    set({
      status: 'idle',
      mode: 'focus',
      secondsLeft: FOCUS_DURATION,
    })
  },
  setActiveTask: (taskId) => {
    set({ activeTaskId: taskId })
  },
}))
