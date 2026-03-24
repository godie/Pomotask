import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getAllTasks,
  getTasksByProject,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  incrementRealPomodoros
} from '@/db/tasks'
import { db } from '@/db/schema'

describe('tasks db operations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('gets all tasks', async () => {
    const mockTasks = [{ id: '1', name: 'T1' }]
    vi.mocked(db.tasks.toArray).mockResolvedValue(mockTasks as any)

    const tasks = await getAllTasks()
    expect(tasks).toEqual(mockTasks)
    expect(db.tasks.toArray).toHaveBeenCalled()
  })

  it('gets tasks by project', async () => {
    const mockTasks = [{ id: '1', projectId: 'P1', name: 'T1' }]
    vi.mocked(db.tasks.toArray).mockResolvedValue(mockTasks as any)

    const tasks = await getTasksByProject('P1')
    expect(tasks).toEqual(mockTasks)
    expect(db.tasks.where).toHaveBeenCalledWith('projectId')
    expect(db.tasks.equals).toHaveBeenCalledWith('P1')
  })

  it('gets task by id', async () => {
    const mockTask = { id: '1', name: 'T1' }
    vi.mocked(db.tasks.get).mockResolvedValue(mockTask as any)

    const task = await getTaskById('1')
    expect(task).toEqual(mockTask)
    expect(db.tasks.get).toHaveBeenCalledWith('1')
  })

  it('creates a task with timestamps and uuid', async () => {
    const data = {
      name: 'New Task',
      projectId: 'P1',
      estimatedPomodoros: 3,
      realPomodoros: 0,
      status: 'pending' as const
    }
    const task = await createTask(data)

    expect(task.id).toBeDefined()
    expect(task.name).toBe(data.name)
    expect(task.createdAt).toBeDefined()
    expect(task.updatedAt).toBe(task.createdAt)
    expect(db.tasks.add).toHaveBeenCalledWith(task)
  })

  it('updates a task and its updatedAt timestamp', async () => {
    const mockTask = { id: '1', name: 'Original', updatedAt: 0 }
    vi.mocked(db.tasks.get).mockImplementation(async (id) => {
      const updateCall = vi.mocked(db.tasks.update).mock.calls.find(call => call[0] === id)?.[1]
      if (updateCall) {
        return { ...mockTask, ...updateCall } as any
      }
      return mockTask as any
    })

    const updated = await updateTask('1', { name: 'Updated' })
    expect(updated.name).toBe('Updated')
    expect(updated.updatedAt).toBeGreaterThan(0)
    expect(db.tasks.update).toHaveBeenCalled()
  })

  it('deletes a task', async () => {
    await deleteTask('1')
    expect(db.tasks.delete).toHaveBeenCalledWith('1')
  })

  it('increments realPomodoros on a task', async () => {
    const mockTask = { id: '1', realPomodoros: 1, updatedAt: 0 }
    vi.mocked(db.tasks.get).mockImplementation(async (id) => {
      const updateCall = vi.mocked(db.tasks.update).mock.calls.find(call => call[0] === id)?.[1]
      if (updateCall) {
        return { ...mockTask, ...updateCall } as any
      }
      return mockTask as any
    })

    await incrementRealPomodoros('1')
    expect(db.tasks.update).toHaveBeenCalledWith('1', {
      realPomodoros: 2,
      updatedAt: expect.any(Number)
    })
  })
})
