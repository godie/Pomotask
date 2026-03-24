import { describe, it, expect, vi } from 'vitest'
import { createSession } from '@/db/sessions'
import { db } from '@/db/schema'

vi.mock('@/db/schema', () => ({
  db: {
    sessions: {
      add: vi.fn(),
      where: vi.fn().mockReturnThis(),
      equals: vi.fn().mockReturnThis(),
      aboveOrEqual: vi.fn().mockReturnThis(),
      toArray: vi.fn(),
    },
  },
}))

describe('db/sessions', () => {
  it('createSession adds a session with UUID', async () => {
    const sessionData = { taskId: 't1', startedAt: 1000, completedAt: 2000, type: 'focus' as const, durationSeconds: 1000 }
    await createSession(sessionData)
    expect(db.sessions.add).toHaveBeenCalledWith(expect.objectContaining({ taskId: 't1', id: expect.any(String) }))
  })
})
