import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAllProjects, createProject, deleteProject } from '@/db/projects'
import { queryKeys } from '@/lib/queryKeys'
import type { Project } from '@/types'

export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects.all,
    queryFn: getAllProjects,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all })
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all })
    },
  })
}
