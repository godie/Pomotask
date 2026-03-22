import type { Task, TaskStatus } from '@/types'

export const FOCUS_DURATION = 25 * 60
export const SHORT_BREAK = 5 * 60
export const LONG_BREAK = 15 * 60
export const POMODOROS_UNTIL_LONG_BREAK = 4

export function shouldSplitTask(estimatedPomodoros: number): boolean {
  return estimatedPomodoros > 5
}

export function splitTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): [Task, Task] {
  const half = Math.ceil(task.estimatedPomodoros / 2)
  const remainder = task.estimatedPomodoros - half

  const base = { projectId: task.projectId, status: 'pending' as TaskStatus, realPomodoros: 0 }
  const now = Date.now()

  return [
    {
      ...base,
      id: crypto.randomUUID(),
      name: `${task.name} (Part 1)`,
      estimatedPomodoros: half,
      createdAt: now,
      updatedAt: now
    },
    {
      ...base,
      id: crypto.randomUUID(),
      name: `${task.name} (Part 2)`,
      estimatedPomodoros: remainder,
      createdAt: now,
      updatedAt: now
    },
  ]
}
