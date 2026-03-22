import { db } from './schema'
import type { PomodoroSession } from '@/types'

export async function createSession(data: Omit<PomodoroSession, 'id'>): Promise<PomodoroSession> {
  const session: PomodoroSession = {
    ...data,
    id: crypto.randomUUID(),
  }
  await db.sessions.add(session)
  return session
}

export async function getSessionsByTask(taskId: string): Promise<PomodoroSession[]> {
  return db.sessions.where('taskId').equals(taskId).toArray()
}

export async function getTodaySessions(): Promise<PomodoroSession[]> {
  const startOfDay = new Date().setHours(0, 0, 0, 0)
  return db.sessions.where('startedAt').aboveOrEqual(startOfDay).toArray()
}
