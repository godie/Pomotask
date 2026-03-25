import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createSession, getSessionsByTask, getTodaySessions } from '@/db/sessions'
import { db } from '@/db/schema'

const { toArrayMock } = vi.hoisted(() => ({
  toArrayMock: vi.fn(),
}))

vi.mock('@/db/schema', () => ({
  db: {
    sessions: {
      add: vi.fn(),
      where: vi.fn().mockImplementation(() => ({
        equals: vi.fn().mockImplementation(() => ({
          toArray: toArrayMock
        })),
        aboveOrEqual: vi.fn().mockImplementation(() => ({
          toArray: toArrayMock
        }))
      })),
    },
  },
}))

describe('db/sessions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    toArrayMock.mockReset()
  })

  it('createSession adds a session with UUID', async () => {
    const sessionData = { taskId: 't1', startedAt: 1000, completedAt: 2000, type: 'focus' as const, durationSeconds: 1000 }
    await createSession(sessionData)
    expect(db.sessions.add).toHaveBeenCalledWith(expect.objectContaining({ taskId: 't1', id: expect.any(String) }))
  })

  it('getSessionsByTask returns sessions for specific task', async () => {
    const mockSessions = [{ id: 's1', taskId: 't1' }]
    toArrayMock.mockResolvedValue(mockSessions)

    const result = await getSessionsByTask('t1')

    expect(db.sessions.where).toHaveBeenCalledWith('taskId')
    expect(result).toEqual(mockSessions)
  })

  it('getTodaySessions filters to todays date', async () => {
    const mockSessions = [{ id: 's1', startedAt: Date.now() }]
    toArrayMock.mockResolvedValue(mockSessions)

    const result = await getTodaySessions()

    expect(db.sessions.where).toHaveBeenCalledWith('startedAt')
    expect(result).toEqual(mockSessions)
  })
})
