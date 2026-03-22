import { db } from './schema'
import type { Task } from '@/types'

export async function getAllTasks(): Promise<Task[]> {
  return db.tasks.toArray()
}

export async function getTasksByProject(projectId: string): Promise<Task[]> {
  return db.tasks.where('projectId').equals(projectId).toArray()
}

export async function getTaskById(id: string): Promise<Task | undefined> {
  return db.tasks.get(id)
}

export async function createTask(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
  const now = Date.now()
  const task: Task = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  }
  await db.tasks.add(task)
  return task
}

export async function updateTask(id: string, data: Partial<Task>): Promise<Task> {
  const now = Date.now()
  await db.tasks.update(id, { ...data, updatedAt: now })
  const updated = await db.tasks.get(id)
  if (!updated) throw new Error(`Task with id ${id} not found`)
  return updated
}

export async function deleteTask(id: string): Promise<void> {
  await db.tasks.delete(id)
}

export async function incrementRealPomodoros(id: string): Promise<void> {
  const task = await db.tasks.get(id)
  if (task) {
    await db.tasks.update(id, {
      realPomodoros: task.realPomodoros + 1,
      updatedAt: Date.now()
    })
  }
}
