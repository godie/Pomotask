import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getAllProjects, createProject } from '@/db/projects'
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
})
