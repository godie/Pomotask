import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getAllTasks, incrementRealPomodoros } from '@/db/tasks'
import { db } from '@/db/schema'

vi.mock('@/db/schema', () => ({
  db: {
    tasks: {
      toArray: vi.fn(),
      where: vi.fn().mockReturnThis(),
      equals: vi.fn().mockReturnThis(),
      get: vi.fn(),
      add: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      bulkAdd: vi.fn(),
    },
    transaction: vi.fn((_mode, _tables, callback) => callback()),
  },
}))

describe('db/tasks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getAllTasks calls db.tasks.toArray', async () => {
    const mockTasks = [{ id: '1', name: 'Task 1' }]
    vi.mocked(db.tasks.toArray).mockResolvedValue(mockTasks as any)
    const result = await getAllTasks()
    expect(db.tasks.toArray).toHaveBeenCalled()
    expect(result).toEqual(mockTasks)
  })

  it('incrementRealPomodoros increments count', async () => {
    const mockTask = { id: '1', realPomodoros: 2 }
    vi.mocked(db.tasks.get).mockResolvedValue(mockTask as any)
    await incrementRealPomodoros('1')
    expect(db.tasks.update).toHaveBeenCalledWith('1', expect.objectContaining({
      realPomodoros: 3
    }))
  })
})
