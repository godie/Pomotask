import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { createRouter, RouterProvider, createRootRoute, createRoute, Outlet, createMemoryHistory } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("@/hooks/useProjects", () => ({
  useProject: vi.fn(),
  useProjects: vi.fn(() => ({ data: [] })),
  useUpdateProject: vi.fn(),
  useCreateProject: vi.fn(),
  useDeleteProject: vi.fn(),
}));

vi.mock("@/hooks/useTasks", () => ({
  useAllTasks: vi.fn(() => ({ data: [] })),
  useTasksByProject: vi.fn(),
  useDeleteTask: vi.fn(() => ({ mutateAsync: vi.fn() })),
  useUpdateTask: vi.fn(() => ({ mutateAsync: vi.fn() })),
  useCreateTask: vi.fn(() => ({ mutateAsync: vi.fn() })),
  useSplitTask: vi.fn(() => ({ mutateAsync: vi.fn() })),
}));

import { useProject } from "@/hooks/useProjects";
import { useTasksByProject } from "@/hooks/useTasks";
import { Route as ProjectDetailRoute } from "@/routes/projects/$projectId";

describe("ProjectDetail Page", () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const createMockRouter = (projectId: string) => {
    const rootRoute = createRootRoute({
        component: () => <Outlet />
    });

    const projectRoute = createRoute({
        getParentRoute: () => rootRoute,
        path: '/projects/$projectId',
        component: ProjectDetailRoute.options.component
    });

    const routeTree = rootRoute.addChildren([projectRoute]);

    return createRouter({
        routeTree,
        context: { queryClient },
        history: createMemoryHistory({
          initialEntries: [`/projects/${projectId}`],
        }),
    });
  };

  it("renders project name and tasks", async () => {
    (useProject as any).mockReturnValue({
      data: { id: "p1", name: "Project One", color: "#ff0000" },
      isLoading: false,
    });
    (useTasksByProject as any).mockReturnValue({
      data: [
        { id: "t1", name: "Task 1", status: "pending", estimatedPomodoros: 2, realPomodoros: 0, projectId: "p1" }
      ],
      isLoading: false,
    });

    const router = createMockRouter("p1");
    render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Project One")).toBeInTheDocument();
      expect(screen.getByText("Task 1")).toBeInTheDocument();
    });
  });

  it("shows project stats", async () => {
    (useProject as any).mockReturnValue({
      data: { id: "p1", name: "Project One", color: "#ff0000" },
      isLoading: false,
    });
    (useTasksByProject as any).mockReturnValue({
      data: [
        { id: "t1", name: "Task 1", status: "pending", estimatedPomodoros: 2, realPomodoros: 1, projectId: "p1" },
        { id: "t2", name: "Task 2", status: "completed", estimatedPomodoros: 3, realPomodoros: 3, projectId: "p1" }
      ],
      isLoading: false,
    });

    const router = createMockRouter("p1");
    render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/4 \/ 5/)).toBeInTheDocument();
    });
  });
});
