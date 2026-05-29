import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useProject } from "@/hooks/useProjects";
import { useTasksByProject, useDeleteTask, useUpdateTask, useCreateTask, useSplitTask } from "@/hooks/useTasks";
import { useProjects } from "@/hooks/useProjects";

// Mock the hooks
vi.mock("@/hooks/useProjects");
vi.mock("@/hooks/useTasks");

// Mock TaskList to verify it is being used
vi.mock("@/components/tasks/TaskList", () => ({
  TaskList: vi.fn(() => <div data-testid="task-list-mock">Task List Mock</div>),
}));

// Import component after mocks
import { Route } from "@/routes/projects/$projectId.lazy";

// Mock Route and Link
vi.mock("@tanstack/react-router", async () => {
  const actual = await vi.importActual("@tanstack/react-router");
  return {
    ...actual,
    createFileRoute: vi.fn(() => {
        const routeMock = (options: any) => ({ options, useParams: vi.fn(() => ({ projectId: "project-1" })) });
        routeMock.useParams = vi.fn(() => ({ projectId: "project-1" }));
        return routeMock;
    }),
    createLazyFileRoute: vi.fn(() => {
        const routeMock = (options: any) => ({ options, useParams: vi.fn(() => ({ projectId: "project-1" })) });
        routeMock.useParams = vi.fn(() => ({ projectId: "project-1" }));
        return routeMock;
    }),
    Link: vi.fn(({ children }) => <a>{children}</a>),
  };
});

describe("Project Detail Page", () => {
  const queryClient = new QueryClient();

  beforeEach(() => {
    vi.clearAllMocks();
    (useProject as any).mockReturnValue({
      data: { id: "project-1", name: "Test Project", color: "#ff2d78" },
      isLoading: false,
    });
    (useTasksByProject as any).mockReturnValue({
      data: [],
      isLoading: false,
    });
    (useDeleteTask as any).mockReturnValue({ mutateAsync: vi.fn() });
    (useUpdateTask as any).mockReturnValue({ mutateAsync: vi.fn() });
    (useCreateTask as any).mockReturnValue({ mutateAsync: vi.fn() });
    (useSplitTask as any).mockReturnValue({ mutateAsync: vi.fn() });
    (useProjects as any).mockReturnValue({ data: [], isLoading: false });
  });

  it("renders the TaskList component", () => {
    // Access the component from the mocked Route
    const ProjectDetail = (Route as any).options.component;
    render(
      <QueryClientProvider client={queryClient}>
        <ProjectDetail />
      </QueryClientProvider>
    );

    expect(screen.getByTestId("task-list-mock")).toBeInTheDocument();
  });
});
