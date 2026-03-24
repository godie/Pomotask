import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
} from '@/db/projects'
import { db } from '@/db/schema'

describe('projects db operations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('gets all projects', async () => {
    const mockProjects = [{ id: '1', name: 'P1' }]
    vi.mocked(db.projects.toArray).mockResolvedValue(mockProjects as any)

    const projects = await getAllProjects()
    expect(projects).toEqual(mockProjects)
    expect(db.projects.toArray).toHaveBeenCalled()
  })

  it('gets project by id', async () => {
    const mockProject = { id: '1', name: 'P1' }
    vi.mocked(db.projects.get).mockResolvedValue(mockProject as any)

    const project = await getProjectById('1')
    expect(project).toEqual(mockProject)
    expect(db.projects.get).toHaveBeenCalledWith('1')
  })

  it('creates a project with timestamps and uuid', async () => {
    const data = { name: 'New Project', color: '#ff0000' }
    const project = await createProject(data)

    expect(project.id).toBeDefined()
    expect(project.name).toBe(data.name)
    expect(project.createdAt).toBeDefined()
    expect(project.updatedAt).toBe(project.createdAt)
    expect(db.projects.add).toHaveBeenCalledWith(project)
  })

  it('updates a project and its updatedAt timestamp', async () => {
    const mockProject = { id: '1', name: 'Original', updatedAt: 0 }
    vi.mocked(db.projects.get).mockImplementation(async (id) => {
      const updateCall = vi.mocked(db.projects.update).mock.calls.find(call => call[0] === id)?.[1]
      if (updateCall) {
        return { ...mockProject, ...updateCall } as any
      }
      return mockProject as any
    })

    const updated = await updateProject('1', { name: 'Updated' })
    expect(updated.name).toBe('Updated')
    expect(updated.updatedAt).toBeGreaterThan(0)
    expect(db.projects.update).toHaveBeenCalled()
  })

  it('deletes a project', async () => {
    await deleteProject('1')
    expect(db.projects.delete).toHaveBeenCalledWith('1')
  })
})
