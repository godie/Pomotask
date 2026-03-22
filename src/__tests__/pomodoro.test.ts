import { describe, it, expect, vi } from 'vitest'
import { shouldSplitTask, splitTask } from '../lib/pomodoro'

describe('pomodoro logic', () => {
  it('should split task if estimated > 5', () => {
    expect(shouldSplitTask(6)).toBe(true)
    expect(shouldSplitTask(5)).toBe(false)
  })

  it('should split task correctly', () => {
    const task = {
      name: 'Big Task',
      estimatedPomodoros: 7,
      projectId: 'p1',
    }

    // Mock crypto.randomUUID
    const mockUuid = 'test-uuid'
    vi.stubGlobal('crypto', { randomUUID: () => mockUuid })

    const [t1, t2] = splitTask(task as any)

    expect(t1.name).toBe('Big Task (Part 1)')
    expect(t1.estimatedPomodoros).toBe(4)
    expect(t2.name).toBe('Big Task (Part 2)')
    expect(t2.estimatedPomodoros).toBe(3)

    vi.unstubAllGlobals()
  })
})
