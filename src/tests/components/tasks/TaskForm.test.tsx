import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskForm } from "@/components/tasks/TaskForm";
import { Dialog } from "@/components/ui/Dialog";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

vi.mock("@/hooks/useProjects", () => ({
  useProjects: vi.fn(() => ({
    data: [],
    isLoading: false,
  })),
}));

vi.mock("@/hooks/useTasks", () => ({
  useSplitTask: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue(undefined),
  })),
}));

describe("TaskForm", () => {
  const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
  const mockOnCancel = vi.fn();

  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all form fields", () => {
    render(
      <Dialog open onOpenChange={() => {}}>
        <TaskForm
          title="Add Task"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      </Dialog>,
      { wrapper: createWrapper() },
    );

    expect(screen.getByPlaceholderText(/launch rocket/i)).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByRole("slider")).toBeInTheDocument();
  });

  it("calls onSubmit with form values", async () => {
    const user = userEvent.setup();
    render(
      <Dialog open onOpenChange={() => {}}>
        <TaskForm
          title="Add Task"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      </Dialog>,
      { wrapper: createWrapper() },
    );

    await user.type(screen.getByPlaceholderText(/launch rocket/i), "New Task");
    await user.click(screen.getByRole("button", { name: /add task/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "New Task",
        estimatedPomodoros: 1,
        realPomodoros: 0,
        status: "pending",
      }),
    );
  });

  it("calls onCancel when cancel clicked", async () => {
    const user = userEvent.setup();
    render(
      <Dialog open onOpenChange={() => {}}>
        <TaskForm
          title="Add Task"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      </Dialog>,
      { wrapper: createWrapper() },
    );

    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it("renders pomodoro count display", () => {
    render(
      <Dialog open onOpenChange={() => {}}>
        <TaskForm
          title="Add Task"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      </Dialog>,
      { wrapper: createWrapper() },
    );

    expect(screen.getByText("1 🍅")).toBeInTheDocument();
  });
});
