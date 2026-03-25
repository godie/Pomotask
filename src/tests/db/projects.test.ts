import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getAllProjects, createProject, getProjectById, updateProject, deleteProject } from '@/db/projects'
import { db } from '@/db/schema'

vi.mock('@/db/schema', () => ({
  db: {
    projects: {
      toArray: vi.fn(),
      get: vi.fn(),
      add: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

describe('db/projects', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getAllProjects calls db.projects.toArray', async () => {
    const mockProjects = [{ id: '1', name: 'Test' }]
    vi.mocked(db.projects.toArray).mockResolvedValue(mockProjects as any)
    const result = await getAllProjects()
    expect(db.projects.toArray).toHaveBeenCalled()
    expect(result).toEqual(mockProjects)
  })

  it('createProject adds a project with generated fields', async () => {
    const projectData = { name: 'New Project', color: '#ff0000' }
    const result = await createProject(projectData)
    expect(db.projects.add).toHaveBeenCalledWith(expect.objectContaining({
      name: 'New Project',
      id: expect.any(String),
    }))
    expect(result.name).toBe('New Project')
  })

  it('getProjectById returns correct project', async () => {
    const mockProject = { id: '1', name: 'Test Project' }
    vi.mocked(db.projects.get).mockResolvedValue(mockProject as any)
    const result = await getProjectById('1')
    expect(db.projects.get).toHaveBeenCalledWith('1')
    expect(result).toEqual(mockProject)
  })

  it('updateProject updates and returns updated project', async () => {
    const updateData = { name: 'Updated Name' }
    const mockUpdatedProject = { id: '1', name: 'Updated Name', color: '#ff0000' }
    vi.mocked(db.projects.get).mockResolvedValue(mockUpdatedProject as any)

    const result = await updateProject('1', updateData)

    expect(db.projects.update).toHaveBeenCalledWith('1', expect.objectContaining({
      name: 'Updated Name',
      updatedAt: expect.any(Number)
    }))
    expect(result).toEqual(mockUpdatedProject)
  })

  it('updateProject throws error when project not found', async () => {
    vi.mocked(db.projects.get).mockResolvedValue(undefined)
    await expect(updateProject('999', { name: 'Fail' })).rejects.toThrow('Project with id 999 not found')
  })

  it('deleteProject calls db.projects.delete', async () => {
    await deleteProject('1')
    expect(db.projects.delete).toHaveBeenCalledWith('1')
  })
})
