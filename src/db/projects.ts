import { db } from './schema'
import type { Project } from '@/types'

export async function getAllProjects(): Promise<Project[]> {
  return db.projects.toArray()
}

export async function getProjectById(id: string): Promise<Project | undefined> {
  return db.projects.get(id)
}

export async function createProject(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
  const now = Date.now()
  const project: Project = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  }
  await db.projects.add(project)
  return project
}

export async function updateProject(id: string, data: Partial<Project>): Promise<Project> {
  const now = Date.now()
  await db.projects.update(id, { ...data, updatedAt: now })
  const updated = await db.projects.get(id)
  if (!updated) throw new Error(`Project with id ${id} not found`)
  return updated
}

export async function deleteProject(id: string): Promise<void> {
  await db.projects.delete(id)
}
