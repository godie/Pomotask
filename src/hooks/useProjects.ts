import { useQuery as useReactQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useQuery as useConvexQuery, useMutation as useConvexMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id, Doc } from "../../convex/_generated/dataModel";
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from "@/db/projects";
import { queryKeys } from "@/lib/queryKeys";
import { useDataSource, useDataSourceGetter } from "@/hooks/useDataSource";
import { mapConvexProjectToPomotask } from "@/lib/convex-mappers";
import type { Project } from "@/types";

// ─── Query hooks ───

export function useProjects() {
  const source = useDataSource();

  // Dexie path (disabled when on Convex)
  const dexie = useReactQuery({
    queryKey: queryKeys.projects.all,
    queryFn: getAllProjects,
    enabled: source === "dexie",
  });

  // Convex path (returns [] when not authenticated)
  const convexData = useConvexQuery(api.projects.listProjects);

  if (source === "convex") {
    return {
      data: convexData?.map(mapConvexProjectToPomotask) ?? [],
      isLoading: convexData === undefined,
      isSuccess: convexData !== undefined,
      isError: false,
      error: null,
    };
  }

  return dexie;
}

export function useProject(id: string | undefined) {
  const source = useDataSource();

  const dexie = useReactQuery({
    queryKey: id ? queryKeys.projects.detail(id) : ["projects", "undefined"],
    queryFn: () => {
      if (!id) throw new Error("useProject requires an id");
      return getProjectById(id);
    },
    enabled: !!id && source === "dexie",
  });

  // useConvexQuery infers a union across all tables; narrow to projects doc type
  const convexDoc = useConvexQuery(
    api.projects.getProject,
    { projectId: id || "skip" },
  ) as Doc<"projects"> | null | undefined;

  if (source === "convex") {
    const mapped = convexDoc ? mapConvexProjectToPomotask(convexDoc) : undefined;
    return {
      data: mapped,
      isLoading: convexDoc === undefined && !!id,
      isSuccess: mapped !== undefined,
      isError: convexDoc === null && !!id,
      error: mapped ? null : (convexDoc === null && !!id ? new Error("Project not found") : null),
    };
  }

  return dexie;
}

// ─── Mutation hooks ───
// All mutations use React Query for consistent return types.
// Backend selection (Dexie vs Convex) uses useDataSourceGetter() to
// avoid stale closures while staying hooks-rules compliant.

export function useCreateProject() {
  const queryClient = useQueryClient();
  const getSource = useDataSourceGetter();
  const convexMutate = useConvexMutation(api.projects.createProject);

  return useMutation({
    mutationFn: async (data: Omit<Project, "id" | "createdAt" | "updatedAt">) => {
      if (getSource() === "convex") {
        await convexMutate({
          name: data.name,
          description: data.description,
          color: data.color,
        });
        return undefined;
      }
      return createProject(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  const getSource = useDataSourceGetter();
  const convexMutate = useConvexMutation(api.projects.updateProject);

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Project> }) => {
      if (getSource() === "convex") {
        await convexMutate({
          projectId: id as Id<"projects">,
          name: data.name,
          description: data.description,
          color: data.color,
        });
        return undefined;
      }
      return updateProject(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  const getSource = useDataSourceGetter();
  const convexMutate = useConvexMutation(api.projects.deleteProject);

  return useMutation({
    mutationFn: async (id: string) => {
      if (getSource() === "convex") {
        await convexMutate({ projectId: id as Id<"projects"> });
        return;
      }
      return deleteProject(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}
