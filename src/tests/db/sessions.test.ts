import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  createSession,
  getSessionsByTask,
  getTodaySessions
} from '@/db/sessions'
import { db } from '@/db/schema'

describe('sessions db operations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('creates a session with a uuid', async () => {
    const data = {
      taskId: 'T1',
      startedAt: Date.now(),
      completedAt: Date.now(),
      type: 'focus' as const,
      durationSeconds: 1500
    }
    const session = await createSession(data)

    expect(session.id).toBeDefined()
    expect(session.taskId).toBe(data.taskId)
    expect(db.sessions.add).toHaveBeenCalledWith(session)
  })

  it('gets sessions by task', async () => {
    const mockSessions = [{ id: 'S1', taskId: 'T1' }]
    vi.mocked(db.sessions.toArray).mockResolvedValue(mockSessions as any)

    const sessions = await getSessionsByTask('T1')
    expect(sessions).toEqual(mockSessions)
    expect(db.sessions.where).toHaveBeenCalledWith('taskId')
    expect(db.sessions.equals).toHaveBeenCalledWith('T1')
  })

  it('gets today sessions filtered by start of day', async () => {
    const now = new Date('2024-01-01T12:00:00Z').getTime()
    vi.setSystemTime(now)
    const startOfDay = new Date(now).setHours(0, 0, 0, 0)

    const mockSessions = [{ id: 'S1', startedAt: now }]
    vi.mocked(db.sessions.toArray).mockResolvedValue(mockSessions as any)

    const sessions = await getTodaySessions()
    expect(sessions).toEqual(mockSessions)
    expect(db.sessions.where).toHaveBeenCalledWith('startedAt')
    // Dexie mock is tricky, check if aboveOrEqual was called
    const aboveOrEqual = vi.mocked(db.sessions.where('startedAt').aboveOrEqual)
    expect(aboveOrEqual).toHaveBeenCalledWith(startOfDay)
  })
})
