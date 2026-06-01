import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTasksByProject,
  getTaskById,
  createTask,
  splitTaskInDB,
  updateTask,
  deleteTask,
  getAllTasks,
} from "@/db/tasks";
import { queryKeys } from "@/lib/queryKeys";
import type { Task } from "@/types";

export function useAllTasks() {
  return useQuery({
    queryKey: queryKeys.tasks.all,
    queryFn: getAllTasks,
  });
}

export function useTasksByProject(projectId: string) {
  return useQuery({
    queryKey: queryKeys.tasks.byProject(projectId),
    queryFn: () => getTasksByProject(projectId),
    enabled: !!projectId,
  });
}

export function useTask(id: string | undefined) {
  return useQuery({
    queryKey: id ? queryKeys.tasks.detail(id) : ["tasks", "undefined"],
    queryFn: () => {
      if (!id) throw new Error("useTask requires an id");
      return getTaskById(id);
    },
    enabled: !!id,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Task, "id" | "createdAt" | "updatedAt">) =>
      createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) =>
      updateTask(id, data),
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      if (task.projectId != null) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.tasks.byProject(task.projectId),
        });
      }
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
  });
}

export function useSplitTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => splitTaskInDB(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
  });
}
