import Dexie, { type Table } from 'dexie'
import type { Project, Task, PomodoroSession } from '@/types'
import type { SyncOperation } from '@/lib/syncService'

export class PomotaskDB extends Dexie {
  projects!: Table<Project>
  tasks!: Table<Task>
  sessions!: Table<PomodoroSession>
  syncOperations!: Table<SyncOperation>

  constructor() {
    super('PomotaskDB')
    this.version(2).stores({
      projects: 'id, createdAt',
      tasks: 'id, projectId, status, createdAt',
      sessions: 'id, taskId, startedAt, type',
      syncOperations: 'id, synced, timestamp, entity',
    })
  }
}

export const db = new PomotaskDB()
