import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useTimerStore } from '@/stores/timerStore'
import {
  FOCUS_DURATION,
  SHORT_BREAK,
  LONG_BREAK,
  POMODOROS_UNTIL_LONG_BREAK,
} from '@/lib/pomodoro'
import { incrementRealPomodoros } from '@/db/tasks'
import { createSession } from '@/db/sessions'

vi.mock('@/db/tasks', () => ({
  incrementRealPomodoros: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/db/sessions', () => ({
  createSession: vi.fn().mockResolvedValue({}),
}))

// Reset Zustand store between tests
beforeEach(() => {
  useTimerStore.setState({
    status: 'idle',
    mode: 'focus',
    secondsLeft: FOCUS_DURATION,
    pomodorosCompleted: 0,
    totalPomodorosToday: 0,
    activeTaskId: null,
  })
  vi.useFakeTimers()
  vi.clearAllMocks()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('timerStore — initial state', () => {
  it('starts idle with full focus duration', () => {
    const { result } = renderHook(() => useTimerStore())
    expect(result.current.status).toBe('idle')
    expect(result.current.mode).toBe('focus')
    expect(result.current.secondsLeft).toBe(FOCUS_DURATION)
    expect(result.current.activeTaskId).toBeNull()
  })
})

describe('timerStore — start / pause / resume', () => {
  it('transitions from idle to running on start', () => {
    const { result } = renderHook(() => useTimerStore())
    act(() => {
      result.current.start()
    })
    expect(result.current.status).toBe('running')
  })

  it('pauses when running', () => {
    const { result } = renderHook(() => useTimerStore())
    act(() => {
      result.current.start()
    })
    act(() => {
      result.current.pause()
    })
    expect(result.current.status).toBe('paused')
  })

  it('resumes from paused', () => {
    const { result } = renderHook(() => useTimerStore())
    act(() => {
      result.current.start()
    })
    act(() => {
      result.current.pause()
    })
    act(() => {
      result.current.resume()
    })
    expect(result.current.status).toBe('running')
  })
})

describe('timerStore — reset', () => {
  it('resets to initial focus state', () => {
    const { result } = renderHook(() => useTimerStore())
    act(() => {
      result.current.start()
    })
    act(() => {
      result.current.reset()
    })
    expect(result.current.status).toBe('idle')
    expect(result.current.secondsLeft).toBe(FOCUS_DURATION)
    expect(result.current.mode).toBe('focus')
  })
})

describe('timerStore — setActiveTask', () => {
  it('sets the active task id', () => {
    const { result } = renderHook(() => useTimerStore())
    act(() => {
      result.current.setActiveTask('task-123')
    })
    expect(result.current.activeTaskId).toBe('task-123')
  })

  it('clears the active task with null', () => {
    const { result } = renderHook(() => useTimerStore())
    act(() => {
      result.current.setActiveTask('task-123')
    })
    act(() => {
      result.current.setActiveTask(null)
    })
    expect(result.current.activeTaskId).toBeNull()
  })
})

describe('timerStore — break transitions', () => {
  it('transitions to short break after first Pomodoro', () => {
    const { result } = renderHook(() => useTimerStore())
    act(() => {
      useTimerStore.setState({ pomodorosCompleted: 1, status: 'idle', mode: 'focus' })
      result.current.skip() // simulate completing focus
    })
    // After 1 pomodoro, should go to short break
    expect(result.current.mode).toBe('short_break')
    expect(result.current.secondsLeft).toBe(SHORT_BREAK)
  })

  it('transitions to long break after 4 Pomodoros', () => {
    const { result } = renderHook(() => useTimerStore())
    act(() => {
      useTimerStore.setState({
        pomodorosCompleted: POMODOROS_UNTIL_LONG_BREAK - 1,
        status: 'running',
        mode: 'focus',
      })
      result.current.skip()
    })
    expect(result.current.mode).toBe('long_break')
    expect(result.current.secondsLeft).toBe(LONG_BREAK)
  })

  it('transitions from break to focus when break ends', async () => {
    const { result } = renderHook(() => useTimerStore())
    await act(async () => {
      useTimerStore.setState({
        status: 'break',
        mode: 'short_break',
        secondsLeft: 0,
      })
      await result.current.tick()
    })

    expect(result.current.status).toBe('idle')
    expect(result.current.mode).toBe('focus')
    expect(result.current.secondsLeft).toBe(FOCUS_DURATION)
  })
})

describe('timerStore — tick', () => {
  it('decrements secondsLeft on tick', async () => {
    const { result } = renderHook(() => useTimerStore())
    await act(async () => {
      result.current.start()
      await result.current.tick()
    })
    expect(result.current.secondsLeft).toBe(FOCUS_DURATION - 1)
  })

  it('does not decrement when paused or idle', async () => {
    const { result } = renderHook(() => useTimerStore())
    const initial = result.current.secondsLeft
    await act(async () => {
      await result.current.tick()
    })
    expect(result.current.secondsLeft).toBe(initial)
  })
})

describe('timerStore — focus completion', () => {
  it('calls incrementRealPomodoros and createSession when focus completes', async () => {
    const { result } = renderHook(() => useTimerStore())
    await act(async () => {
      useTimerStore.setState({
        status: 'running',
        mode: 'focus',
        secondsLeft: 0,
        activeTaskId: 'task-1',
      })
      await result.current.tick()
    })

    expect(incrementRealPomodoros).toHaveBeenCalledWith('task-1')
    expect(createSession).toHaveBeenCalledWith(expect.objectContaining({
      taskId: 'task-1',
      type: 'focus'
    }))
    expect(result.current.pomodorosCompleted).toBe(1)
  })

  it('transitions to short break after focus completes', async () => {
    const { result } = renderHook(() => useTimerStore())
    await act(async () => {
      useTimerStore.setState({
        status: 'running',
        mode: 'focus',
        secondsLeft: 0,
        pomodorosCompleted: 0,
      })
      await result.current.tick()
    })

    expect(result.current.mode).toBe('short_break')
    expect(result.current.secondsLeft).toBe(SHORT_BREAK)
  })

  it('transitions to long break after 4th focus completes', async () => {
    const { result } = renderHook(() => useTimerStore())
    await act(async () => {
      useTimerStore.setState({
        status: 'running',
        mode: 'focus',
        secondsLeft: 0,
        pomodorosCompleted: 3,
      })
      await result.current.tick()
    })

    expect(result.current.mode).toBe('long_break')
    expect(result.current.secondsLeft).toBe(LONG_BREAK)
  })
})

describe('timerStore — interval management', () => {
  it('runs tick every second when running', () => {
    const { result } = renderHook(() => useTimerStore())
    act(() => {
      result.current.start()
    })

    // Initial state after start
    expect(result.current.secondsLeft).toBe(FOCUS_DURATION)

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(result.current.secondsLeft).toBe(FOCUS_DURATION - 1)

    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(result.current.secondsLeft).toBe(FOCUS_DURATION - 3)
  })

  it('stops ticking when paused', () => {
    const { result } = renderHook(() => useTimerStore())
    act(() => {
      result.current.start()
      vi.advanceTimersByTime(1000)
      result.current.pause()
    })

    const pausedSeconds = result.current.secondsLeft
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(result.current.secondsLeft).toBe(pausedSeconds)
  })

  it('stops ticking when reset', () => {
    const { result } = renderHook(() => useTimerStore())
    act(() => {
      result.current.start()
      vi.advanceTimersByTime(1000)
      result.current.reset()
    })

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(result.current.secondsLeft).toBe(FOCUS_DURATION)
  })
})
