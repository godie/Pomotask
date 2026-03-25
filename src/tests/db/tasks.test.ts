import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getAllTasks, incrementRealPomodoros, getTasksByProject, getTaskById, createTask, updateTask, deleteTask, splitTaskInDB } from '@/db/tasks'
import { db } from '@/db/schema'

const { toArrayMock } = vi.hoisted(() => ({
  toArrayMock: vi.fn(),
}))

vi.mock('@/db/schema', () => ({
  db: {
    tasks: {
      toArray: vi.fn(),
      where: vi.fn().mockImplementation(() => ({
        equals: vi.fn().mockImplementation(() => ({
          toArray: toArrayMock
        }))
      })),
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
    toArrayMock.mockReset()
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

  it('getTasksByProject filters by projectId', async () => {
    const mockTasks = [{ id: '1', projectId: 'p1' }]
    toArrayMock.mockResolvedValue(mockTasks)

    const result = await getTasksByProject('p1')

    expect(db.tasks.where).toHaveBeenCalledWith('projectId')
    expect(result).toEqual(mockTasks)
  })

  it('getTaskById returns correct task', async () => {
    const mockTask = { id: '1', name: 'Task 1' }
    vi.mocked(db.tasks.get).mockResolvedValue(mockTask as any)
    const result = await getTaskById('1')
    expect(db.tasks.get).toHaveBeenCalledWith('1')
    expect(result).toEqual(mockTask)
  })

  it('createTask adds a task with generated fields', async () => {
    const taskData = { name: 'New Task', projectId: null, estimatedPomodoros: 3, realPomodoros: 0, status: 'pending' as const }
    const result = await createTask(taskData)
    expect(db.tasks.add).toHaveBeenCalledWith(expect.objectContaining({
      name: 'New Task',
      id: expect.any(String),
      createdAt: expect.any(Number),
      updatedAt: expect.any(Number),
    }))
    expect(result.name).toBe('New Task')
  })

  it('updateTask updates specified fields', async () => {
    const updateData = { name: 'Updated Task' }
    const mockUpdatedTask = { id: '1', name: 'Updated Task' }
    vi.mocked(db.tasks.get).mockResolvedValue(mockUpdatedTask as any)

    const result = await updateTask('1', updateData)

    expect(db.tasks.update).toHaveBeenCalledWith('1', expect.objectContaining({
      name: 'Updated Task',
      updatedAt: expect.any(Number)
    }))
    expect(result).toEqual(mockUpdatedTask)
  })

  it('deleteTask removes task from DB', async () => {
    await deleteTask('1')
    expect(db.tasks.delete).toHaveBeenCalledWith('1')
  })

  it('splitTaskInDB marks original as divided and creates subtasks', async () => {
    const mockTask = { id: '1', name: 'Big Task', estimatedPomodoros: 6, status: 'pending' }
    vi.mocked(db.tasks.get).mockResolvedValue(mockTask as any)

    const result = await splitTaskInDB('1')

    expect(db.tasks.update).toHaveBeenCalledWith('1', expect.objectContaining({
      status: 'divided',
      updatedAt: expect.any(Number)
    }))
    expect(db.tasks.bulkAdd).toHaveBeenCalled()
    expect(result.length).toBe(2)
    expect(result[0].name).toContain('Part 1')
  })
})
