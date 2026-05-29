import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Route } from "@/routes/tasks.lazy";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAllTasks, useCreateTask, useDeleteTask, useUpdateTask, useSplitTask } from "@/hooks/useTasks";
import { useProjects } from "@/hooks/useProjects";

// Mock the hooks
vi.mock("@/hooks/useTasks");
vi.mock("@/hooks/useProjects");

// Mock TaskList to verify it is being used
vi.mock("@/components/tasks/TaskList", () => ({
  TaskList: vi.fn(() => <div data-testid="task-list-mock">Task List Mock</div>),
}));

describe("Tasks Page", () => {
  const queryClient = new QueryClient();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAllTasks as any).mockReturnValue({
      data: [],
      isLoading: false,
    });
    (useCreateTask as any).mockReturnValue({ mutateAsync: vi.fn() });
    (useDeleteTask as any).mockReturnValue({ mutateAsync: vi.fn() });
    (useUpdateTask as any).mockReturnValue({ mutateAsync: vi.fn() });
    (useSplitTask as any).mockReturnValue({ mutateAsync: vi.fn() });
    (useProjects as any).mockReturnValue({ data: [], isLoading: false });
  });

  it("renders the TaskList component", () => {
    const Tasks = (Route as any).options.component;
    render(
      <QueryClientProvider client={queryClient}>
        <Tasks />
      </QueryClientProvider>
    );

    expect(screen.getByTestId("task-list-mock")).toBeInTheDocument();
  });
});
