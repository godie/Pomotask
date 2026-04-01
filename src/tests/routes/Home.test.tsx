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

vi.mock("@/hooks/useFocusStats", () => ({
  useFocusStats: vi.fn(() => ({
    streakDays: 0,
    totalFocusedLabel: "0m",
    isLoading: false,
  })),
}));

vi.mock("@/components/home/DashboardInlineTasks", () => ({
  DashboardInlineTasks: vi.fn(() => (
    <div data-testid="inline-tasks-mock">Inline Tasks Mock</div>
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

  it("renders the inline tasks panel", () => {
    const Index = (Route as any).options.component;
    render(
      <QueryClientProvider client={queryClient}>
        <Index />
      </QueryClientProvider>,
    );

    expect(screen.getByTestId("inline-tasks-mock")).toBeInTheDocument();
  });
});
