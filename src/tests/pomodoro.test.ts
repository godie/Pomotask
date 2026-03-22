import { describe, it, expect } from 'vitest'
import { shouldSplitTask, splitTask } from '@/lib/pomodoro'

describe('shouldSplitTask', () => {
  it('returns false for tasks with 5 or fewer Pomodoros', () => {
    expect(shouldSplitTask(1)).toBe(false)
    expect(shouldSplitTask(3)).toBe(false)
    expect(shouldSplitTask(5)).toBe(false)
  })

  it('returns true for tasks with more than 5 Pomodoros', () => {
    expect(shouldSplitTask(6)).toBe(true)
    expect(shouldSplitTask(8)).toBe(true)
    expect(shouldSplitTask(10)).toBe(true)
  })
})

describe('splitTask', () => {
  const baseTask = {
    name: 'Big Task',
    projectId: 'proj-1',
    status: 'pending' as const,
    realPomodoros: 0,
  }

  it('returns exactly 2 tasks', () => {
    const result = splitTask({ ...baseTask, estimatedPomodoros: 8 })
    expect(result).toHaveLength(2)
  })

  it('estimates sum to original total', () => {
    const original = 8
    const [part1, part2] = splitTask({ ...baseTask, estimatedPomodoros: original })
    expect(part1.estimatedPomodoros + part2.estimatedPomodoros).toBe(original)
  })

  it('part 1 gets the ceiling for odd estimates', () => {
    const [part1, part2] = splitTask({ ...baseTask, estimatedPomodoros: 7 })
    expect(part1.estimatedPomodoros).toBe(4)
    expect(part2.estimatedPomodoros).toBe(3)
  })

  it('splits evenly for even estimates', () => {
    const [part1, part2] = splitTask({ ...baseTask, estimatedPomodoros: 8 })
    expect(part1.estimatedPomodoros).toBe(4)
    expect(part2.estimatedPomodoros).toBe(4)
  })

  it('appends (Part 1) and (Part 2) to task names', () => {
    const [part1, part2] = splitTask({ ...baseTask, estimatedPomodoros: 8 })
    expect(part1.name).toBe('Big Task (Part 1)')
    expect(part2.name).toBe('Big Task (Part 2)')
  })

  it('assigns same projectId to both parts', () => {
    const [part1, part2] = splitTask({ ...baseTask, estimatedPomodoros: 8 })
    expect(part1.projectId).toBe('proj-1')
    expect(part2.projectId).toBe('proj-1')
  })

  it('both tasks start with 0 real Pomodoros', () => {
    const [part1, part2] = splitTask({ ...baseTask, estimatedPomodoros: 8 })
    expect(part1.realPomodoros).toBe(0)
    expect(part2.realPomodoros).toBe(0)
  })

  it('both tasks start with pending status', () => {
    const [part1, part2] = splitTask({ ...baseTask, estimatedPomodoros: 8 })
    expect(part1.status).toBe('pending')
    expect(part2.status).toBe('pending')
  })

  it('generates unique IDs for both tasks', () => {
    const [part1, part2] = splitTask({ ...baseTask, estimatedPomodoros: 8 })
    expect(part1.id).not.toBe(part2.id)
  })
})
