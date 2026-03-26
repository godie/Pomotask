import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskCard } from "@/components/tasks/TaskCard";

vi.mock("@/stores/timerStore", () => ({
  useTimerStore: vi.fn(() => ({
    activeTaskId: null,
    setActiveTask: vi.fn(),
    start: vi.fn(),
  })),
}));

import { useTimerStore } from "@/stores/timerStore";

describe("TaskCard", () => {
  const mockTask = {
    id: "1",
    name: "Test Task",
    estimatedPomodoros: 3,
    realPomodoros: 1,
    status: "pending" as const,
    projectId: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const mockOnDelete = vi.fn();
  const mockOnToggleComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useTimerStore).mockImplementation(() => ({
      activeTaskId: null,
      setActiveTask: vi.fn(),
      start: vi.fn(),
    }));
  });

  it("renders task name", () => {
    render(
      <TaskCard
        task={mockTask}
        onDelete={mockOnDelete}
        onToggleComplete={mockOnToggleComplete}
      />,
    );
    expect(screen.getByText("Test Task")).toBeInTheDocument();
  });

  it("renders pomodoro count", () => {
    render(
      <TaskCard
        task={mockTask}
        onDelete={mockOnDelete}
        onToggleComplete={mockOnToggleComplete}
      />,
    );
    expect(screen.getByText(/1 \/ 3/)).toBeInTheDocument();
  });

  it("renders Start button when task is not active and not completed", () => {
    render(
      <TaskCard
        task={mockTask}
        onDelete={mockOnDelete}
        onToggleComplete={mockOnToggleComplete}
      />,
    );
    expect(
      screen.getByRole("button", { name: /start timer/i }),
    ).toBeInTheDocument();
  });

  it("does not render Start button when task is completed", () => {
    const completedTask = { ...mockTask, status: "completed" as const };
    render(
      <TaskCard
        task={completedTask}
        onDelete={mockOnDelete}
        onToggleComplete={mockOnToggleComplete}
      />,
    );
    expect(
      screen.queryByRole("button", { name: /start timer/i }),
    ).not.toBeInTheDocument();
  });

  it("does not render Start button when task is active", () => {
    vi.mocked(useTimerStore).mockImplementation(() => ({
      activeTaskId: "1",
      setActiveTask: vi.fn(),
      start: vi.fn(),
    }));
    render(
      <TaskCard
        task={mockTask}
        onDelete={mockOnDelete}
        onToggleComplete={mockOnToggleComplete}
      />,
    );
    expect(
      screen.queryByRole("button", { name: /start timer/i }),
    ).not.toBeInTheDocument();
  });

  it("calls onToggleComplete when checkbox clicked", async () => {
    const user = userEvent.setup();
    render(
      <TaskCard
        task={mockTask}
        onDelete={mockOnDelete}
        onToggleComplete={mockOnToggleComplete}
      />,
    );
    const checkbox = screen.getByRole("button", { name: /toggle complete/i });
    await user.click(checkbox);
    expect(mockOnToggleComplete).toHaveBeenCalledWith(mockTask);
  });

  it("calls onDelete when delete button clicked", async () => {
    const user = userEvent.setup();
    render(
      <TaskCard
        task={mockTask}
        onDelete={mockOnDelete}
        onToggleComplete={mockOnToggleComplete}
      />,
    );
    await user.click(screen.getByRole("button", { name: /delete/i }));
    expect(mockOnDelete).toHaveBeenCalledWith("1");
  });

  it("calls setActiveTask and start when Start clicked", async () => {
    const user = userEvent.setup();
    const mockSetActiveTask = vi.fn();
    const mockStart = vi.fn();
    vi.mocked(useTimerStore).mockImplementation(() => ({
      activeTaskId: null,
      setActiveTask: mockSetActiveTask,
      start: mockStart,
    }));
    render(
      <TaskCard
        task={mockTask}
        onDelete={mockOnDelete}
        onToggleComplete={mockOnToggleComplete}
      />,
    );
    await user.click(screen.getByRole("button", { name: /start timer/i }));
    expect(mockSetActiveTask).toHaveBeenCalledWith("1");
    expect(mockStart).toHaveBeenCalled();
  });

  it("shows completed styling when task is completed", () => {
    const completedTask = { ...mockTask, status: "completed" as const };
    render(
      <TaskCard
        task={completedTask}
        onDelete={mockOnDelete}
        onToggleComplete={mockOnToggleComplete}
      />,
    );
    expect(screen.getByText("Test Task")).toHaveClass("line-through");
  });
});
