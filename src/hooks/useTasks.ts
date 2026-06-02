import { useQuery as useReactQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useQuery as useConvexQuery, useMutation as useConvexMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id, Doc } from "../../convex/_generated/dataModel";
import {
  getAllTasks,
  getTasksByProject,
  getTaskById,
  createTask,
  splitTaskInDB,
  updateTask,
  deleteTask,
} from "@/db/tasks";
import { queryKeys } from "@/lib/queryKeys";
import { useDataSource, useDataSourceGetter } from "@/hooks/useDataSource";
import { mapConvexTaskToPomotask } from "@/lib/convex-mappers";
import type { Task } from "@/types";

// ─── Query hooks ───

export function useAllTasks() {
  const source = useDataSource();

  // Dexie path (always called, disabled when on Convex)
  const dexie = useReactQuery({
    queryKey: queryKeys.tasks.all,
    queryFn: getAllTasks,
    enabled: source === "dexie",
  });

  // Convex path (always called; returns [] when not authenticated)
  const convexData = useConvexQuery(api.tasks.listAllPomotaskTasks);

  if (source === "convex") {
    return {
      data: convexData?.map(mapConvexTaskToPomotask) ?? [],
      isLoading: convexData === undefined,
      isSuccess: convexData !== undefined,
      isError: false,
      error: null,
    };
  }

  return dexie;
}

export function useTasksByProject(projectId: string) {
  const source = useDataSource();

  const dexie = useReactQuery({
    queryKey: queryKeys.tasks.byProject(projectId),
    queryFn: () => getTasksByProject(projectId),
    enabled: !!projectId && source === "dexie",
  });

  const convexData = useConvexQuery(
    api.tasks.listPomotaskTasksByProject,
    { projectId: projectId || "skip" },
  );

  if (source === "convex") {
    // Convex returns empty when projectId is invalid/skip
    const data = convexData ? convexData.map(mapConvexTaskToPomotask) : undefined;
    return {
      data,
      isLoading: convexData === undefined && !!projectId,
      isSuccess: convexData !== undefined,
      isError: false,
      error: null,
    };
  }

  return dexie;
}

export function useTask(id: string | undefined) {
  const source = useDataSource();

  const dexie = useReactQuery({
    queryKey: id ? queryKeys.tasks.detail(id) : ["tasks", "undefined"],
    queryFn: () => {
      if (!id) throw new Error("useTask requires an id");
      return getTaskById(id);
    },
    enabled: !!id && source === "dexie",
  });

  // useConvexQuery infers a union across all tables; narrow to tasks doc type
  const convexDoc = useConvexQuery(
    api.tasks.getPomotaskTask,
    { taskId: id || "skip" },
  ) as Doc<"tasks"> | null | undefined;

  if (source === "convex") {
    const mapped = convexDoc ? mapConvexTaskToPomotask(convexDoc) : undefined;
    return {
      data: mapped,
      isLoading: convexDoc === undefined && !!id,
      isSuccess: mapped !== undefined,
      isError: convexDoc === null && !!id,
      error: mapped ? null : (convexDoc === null && !!id ? new Error("Task not found") : null),
    };
  }

  return dexie;
}

// ─── Mutation hooks ───
// All mutations use React Query for consistent return types.
// Backend selection (Dexie vs Convex) uses useDataSourceGetter() to
// avoid stale closures while staying hooks-rules compliant.

export function useCreateTask() {
  const queryClient = useQueryClient();
  const getSource = useDataSourceGetter();
  const convexMutate = useConvexMutation(api.tasks.createPomotaskTask);

  return useMutation({
    mutationFn: async (data: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
      if (getSource() === "convex") {
        await convexMutate({
          projectId: (data.projectId ?? "skip") as Id<"projects">,
          title: data.name,
          estimatedPomodoros: data.estimatedPomodoros,
        });
        return undefined;
      }
      return createTask(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  const getSource = useDataSourceGetter();
  const convexMutate = useConvexMutation(api.tasks.updatePomotaskTask);

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Task> }) => {
      if (getSource() === "convex") {
        await convexMutate({
          taskId: id as Id<"tasks">,
          title: data.name,
          estimatedPomodoros: data.estimatedPomodoros,
          realPomodoros: data.realPomodoros,
          status: data.status,
          completedAt: data.completedAt,
        });
        // Return the projectId so onSuccess can invalidate by-project queries
        return data.projectId;
      }
      return updateTask(id, data);
    },
    onSuccess: (taskOrProjectId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      // When Convex path was taken, taskOrProjectId is the projectId string
      // When Dexie path was taken, taskOrProjectId is a Task object
      const projectId = typeof taskOrProjectId === "string"
        ? taskOrProjectId
        : taskOrProjectId?.projectId;
      if (projectId != null) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.tasks.byProject(projectId),
        });
      }
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  const getSource = useDataSourceGetter();
  const convexMutate = useConvexMutation(api.tasks.deletePomotaskTask);

  return useMutation({
    mutationFn: async (id: string) => {
      if (getSource() === "convex") {
        await convexMutate({ taskId: id as Id<"tasks"> });
        return;
      }
      return deleteTask(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
  });
}

export function useSplitTask() {
  const queryClient = useQueryClient();
  const getSource = useDataSourceGetter();
  const convexMutate = useConvexMutation(api.tasks.splitPomotaskTask);

  return useMutation({
    mutationFn: async (id: string) => {
      if (getSource() === "convex") {
        await convexMutate({ taskId: id as Id<"tasks"> });
        return;
      }
      return splitTaskInDB(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
  });
}
