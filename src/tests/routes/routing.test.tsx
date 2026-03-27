import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { createRouter, RouterProvider, createRootRoute, createRoute, Outlet, createMemoryHistory } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from 'react';

vi.mock("@/stores/timerStore", () => ({
  useTimerStore: vi.fn(() => ({
    status: "idle",
    secondsLeft: 1500,
    mode: "focus",
    activeTaskId: null,
    setActiveTask: vi.fn(),
  })),
}));

vi.mock("@/hooks/useTasks", () => ({
  useAllTasks: vi.fn(() => ({ data: [], isLoading: false })),
  useCreateTask: vi.fn(() => ({ mutateAsync: vi.fn() })),
  useDeleteTask: vi.fn(() => ({ mutateAsync: vi.fn() })),
  useUpdateTask: vi.fn(() => ({ mutateAsync: vi.fn() })),
}));

vi.mock("@/hooks/useProjects", () => ({
  useProjects: vi.fn(() => ({ data: [], isLoading: false })),
  useCreateProject: vi.fn(() => ({ mutateAsync: vi.fn() })),
  useDeleteProject: vi.fn(() => ({ mutateAsync: vi.fn() })),
}));

import { NotFound } from "@/components/ui/NotFound";

const IndexPage = () => <h1>Timer Page</h1>
const ProjectsPage = () => <h1>Projects Page</h1>
const TasksPage = () => <h1>Tasks Page</h1>

describe("Routing", () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const createMockRouter = (withNotFound = false, initialPath = '/') => {
    const rootRoute = createRootRoute({
        component: () => <React.Fragment><div data-testid="nav">Nav</div><Outlet /></React.Fragment>,
        notFoundComponent: withNotFound ? NotFound : undefined,
    });

    const indexRoute = createRoute({
        getParentRoute: () => rootRoute,
        path: '/',
        component: IndexPage
    });

    const projectsRoute = createRoute({
        getParentRoute: () => rootRoute,
        path: '/projects',
        component: ProjectsPage
    });

    const tasksRoute = createRoute({
        getParentRoute: () => rootRoute,
        path: '/tasks',
        component: TasksPage
    });

    const routeTree = rootRoute.addChildren([
      indexRoute,
      projectsRoute,
      tasksRoute,
    ]);

    return createRouter({
        routeTree,
        context: { queryClient },
        history: createMemoryHistory({
          initialEntries: [initialPath],
        }),
    });
  };

  it("navigating to /projects renders Projects page", async () => {
    const router = createMockRouter();

    render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    );

    await act(async () => {
        await router.navigate({ to: "/projects" });
    })

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Projects Page/i })).toBeInTheDocument();
    });
  });

  it("navigating to /tasks renders Tasks page", async () => {
    const router = createMockRouter();

    render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    );

    await act(async () => {
        await router.navigate({ to: "/tasks" });
    })

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Tasks Page/i })).toBeInTheDocument();
    });
  });

  it("navigating to unknown route renders 404 page", async () => {
    const router = createMockRouter(true, '/non-existent');

    render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("404 Not Found")).toBeInTheDocument();
    }, { timeout: 2000 });
  });
});
