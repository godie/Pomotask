import { create } from 'zustand'
import {
  FOCUS_DURATION,
  LONG_BREAK,
  POMODOROS_UNTIL_LONG_BREAK,
  SHORT_BREAK,
} from '@/lib/pomodoro'
import { incrementRealPomodoros } from '@/db/tasks'
import { createSession } from '@/db/sessions'

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
  tick: () => void
}

const initialTimerFields = {
  status: 'idle' as const,
  mode: 'focus' as const,
  secondsLeft: FOCUS_DURATION,
  pomodorosCompleted: 0,
  totalPomodorosToday: 0,
  activeTaskId: null as string | null,
}

let timerTimeout: ReturnType<typeof setTimeout> | null = null

const clearTimer = () => {
  if (timerTimeout) {
    clearTimeout(timerTimeout)
    timerTimeout = null
  }
}

const scheduleNextTick = (tick: () => Promise<void>) => {
  clearTimer()
  timerTimeout = setTimeout(async () => {
    await tick()
  }, 1000)
}

export const useTimerStore = create<TimerState>((set, get) => ({
  ...initialTimerFields,
  start: () => {
    if (get().status !== 'idle') return
    set({ status: 'running' })
    scheduleNextTick(get().tick)
  },
  pause: () => {
    if (get().status !== 'running') return
    set({ status: 'paused' })
    clearTimer()
  },
  resume: () => {
    if (get().status !== 'paused') return
    set({ status: 'running' })
    scheduleNextTick(get().tick)
  },
  skip: () => {
    clearTimer()
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
    clearTimer()
    set({
      status: 'idle',
      mode: 'focus',
      secondsLeft: FOCUS_DURATION,
    })
  },
  setActiveTask: (taskId) => {
    set({ activeTaskId: taskId })
  },
  tick: async () => {
    const { status, mode, secondsLeft, activeTaskId, pomodorosCompleted } = get()
    if (status !== 'running' && status !== 'break') return

    if (secondsLeft > 0) {
      set({ secondsLeft: secondsLeft - 1 })
      scheduleNextTick(get().tick)
      return
    }

    // Timer reached zero
    try {
      if (mode === 'focus') {
        if (activeTaskId) {
          await incrementRealPomodoros(activeTaskId)
          await createSession({
            taskId: activeTaskId,
            startedAt: Date.now() - FOCUS_DURATION * 1000,
            completedAt: Date.now(),
            type: 'focus',
            durationSeconds: FOCUS_DURATION,
          })
        }

        const nextCompleted = pomodorosCompleted + 1
        const isLongBreak = nextCompleted > 0 && nextCompleted % POMODOROS_UNTIL_LONG_BREAK === 0

        clearTimer()
        set({
          pomodorosCompleted: nextCompleted,
          status: 'break',
          mode: isLongBreak ? 'long_break' : 'short_break',
          secondsLeft: isLongBreak ? LONG_BREAK : SHORT_BREAK,
        })
      } else {
        // Break finished
        clearTimer()
        set({
          status: 'idle',
          mode: 'focus',
          secondsLeft: FOCUS_DURATION,
        })
      }
    } catch (error) {
      console.error('Failed to complete session:', error)
      // Even if DB fails, we should stop the timer to avoid infinite loops/errors
      clearTimer()
      set({ status: 'idle' })
    }
  },
}))
