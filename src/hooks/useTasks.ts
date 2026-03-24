import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTasksByProject, createTask, splitTaskInDB, updateTask, deleteTask, getAllTasks } from '@/db/tasks'
import { queryKeys } from '@/lib/queryKeys'
import type { Task } from '@/types'

export function useAllTasks() {
  return useQuery({
    queryKey: queryKeys.tasks.all,
    queryFn: getAllTasks,
  })
}

export function useTasksByProject(projectId: string) {
  return useQuery({
    queryKey: queryKeys.tasks.byProject(projectId),
    queryFn: () => getTasksByProject(projectId),
    enabled: !!projectId,
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all })
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Task> }) => updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all })
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all })
    },
  })
}

export function useSplitTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => splitTaskInDB(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all })
    },
  })
}
