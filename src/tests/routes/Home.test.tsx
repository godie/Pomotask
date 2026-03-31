import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Route } from "@/routes/index";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTimerStore } from "@/stores/timerStore";

// Mock the store
vi.mock("@/stores/timerStore");

// Mock the hooks individually
vi.mock("@/hooks/useTasks", () => ({
  useAllTasks: vi.fn(() => ({ data: [], isLoading: false })),
  useCreateTask: vi.fn(() => ({ mutateAsync: vi.fn() })),
  useUpdateTask: vi.fn(() => ({ mutateAsync: vi.fn() })),
  useSplitTask: vi.fn(() => ({ mutateAsync: vi.fn() })),
}));

vi.mock("@/hooks/useProjects", () => ({
  useProjects: vi.fn(() => ({ data: [], isLoading: false })),
}));

// Mock TaskSelector to verify it is being used
vi.mock("@/components/timer/TaskSelector", () => ({
  TaskSelector: vi.fn(() => (
    <div data-testid="task-selector-mock">Task Selector Mock</div>
  )),
}));

describe("Home Page (Index)", () => {
  const queryClient = new QueryClient();

  beforeEach(() => {
    vi.clearAllMocks();
    (useTimerStore as any).mockReturnValue({
      status: "idle",
      secondsLeft: 1500,
      mode: "focus",
      activeTaskId: null,
      setActiveTask: vi.fn(),
      skip: vi.fn(),
    });
  });

  it("renders the TaskSelector component", () => {
    const Index = (Route as any).options.component;
    render(
      <QueryClientProvider client={queryClient}>
        <Index />
      </QueryClientProvider>,
    );

    expect(screen.getByTestId("task-selector-mock")).toBeInTheDocument();
  });
});
