import Dexie, { type Table } from 'dexie'
import type { Project, Task, PomodoroSession } from '@/types'

export class PomodoroFlowDB extends Dexie {
  projects!: Table<Project>
  tasks!: Table<Task>
  sessions!: Table<PomodoroSession>

  constructor() {
    super('PomodoroFlowDB')
    this.version(1).stores({
      projects: 'id, createdAt',
      tasks: 'id, projectId, status, createdAt',
      sessions: 'id, taskId, startedAt, type',
    })
  }
}

export const db = new PomodoroFlowDB()
