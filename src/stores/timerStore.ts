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
  skip: () => Promise<void>
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

let timerInterval: ReturnType<typeof setInterval> | null = null

const playBeep = () => {
  try {
    const context = new window.AudioContext()
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.type = 'sine'
    oscillator.frequency.value = 880
    gain.gain.setValueAtTime(0.1, context.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5)
    oscillator.start()
    oscillator.stop(context.currentTime + 0.5)
  } catch (e) {
    console.warn('Audio play failed', e)
  }
}

const sendNotification = (title: string, body: string) => {
  if (Notification.permission === 'granted') {
    void new Notification(title, { body, icon: '/icons/icon-192.png' })
  } else if (Notification.permission !== 'denied') {
    void Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        void new Notification(title, { body, icon: '/icons/icon-192.png' })
      }
    })
  }
}

export const useTimerStore = create<TimerState>((set, get) => ({
  ...initialTimerFields,
  start: () => {
    if (get().status !== 'idle') return
    set({ status: 'running' })
    if (!timerInterval) {
      timerInterval = setInterval(() => { get().tick(); }, 1000)
    }
  },
  pause: () => {
    if (get().status !== 'running') return
    set({ status: 'paused' })
  },
  resume: () => {
    if (get().status !== 'paused') return
    set({ status: 'running' })
  },
  tick: () => {
    const { status, secondsLeft } = get()
    if (status !== 'running') return

    if (secondsLeft <= 1) {
      void get().skip()
    } else {
      set({ secondsLeft: secondsLeft - 1 })
    }
  },
  skip: async () => {
    const { mode, pomodorosCompleted, activeTaskId, secondsLeft } = get()

    playBeep()

    if (mode === 'focus') {
      sendNotification('Focus Complete!', 'Time for a break.')
      if (activeTaskId) {
        await incrementRealPomodoros(activeTaskId)
        await createSession({
          taskId: activeTaskId,
          startedAt: Date.now() - (FOCUS_DURATION - secondsLeft) * 1000,
          completedAt: Date.now(),
          type: 'focus',
          durationSeconds: FOCUS_DURATION - secondsLeft
        })
      }

      const nextCompleted = pomodorosCompleted + 1
      const isLongBreak = nextCompleted > 0 && nextCompleted % POMODOROS_UNTIL_LONG_BREAK === 0
      set({
        pomodorosCompleted: nextCompleted,
        totalPomodorosToday: get().totalPomodorosToday + 1,
        mode: isLongBreak ? 'long_break' : 'short_break',
        secondsLeft: isLongBreak ? LONG_BREAK : SHORT_BREAK,
        status: 'idle',
      })
    } else {
      sendNotification('Break Over!', 'Ready to focus again?')
      set({
        mode: 'focus',
        secondsLeft: FOCUS_DURATION,
        status: 'idle',
      })
    }
  },
  reset: () => {
    set({
      status: 'idle',
      mode: 'focus',
      secondsLeft: FOCUS_DURATION,
    })
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  },
  setActiveTask: (taskId) => {
    set({ activeTaskId: taskId })
  },
}))
