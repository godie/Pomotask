export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'divided'

export interface Project {
  id: string                  // uuid
  name: string
  color: string               // hex color e.g. "#ef4444"
  description?: string
  createdAt: number           // timestamp ms
  updatedAt: number
}

export interface Task {
  id: string                  // uuid
  projectId: string | null    // nullable: task can be unassigned
  name: string
  estimatedPomodoros: number  // 1–10
  realPomodoros: number       // auto-incremented, starts at 0
  status: TaskStatus
  createdAt: number
  updatedAt: number
  completedAt?: number
}

export interface PomodoroSession {
  id: string
  taskId: string
  startedAt: number
  completedAt: number         // only set if fully completed
  type: 'focus' | 'short_break' | 'long_break'
  durationSeconds: number
}
