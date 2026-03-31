import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TaskSelector } from "@/components/timer/TaskSelector";
import type { Task } from "@/types";

const mockTasks: Task[] = [
  {
    id: "1",
    name: "Task 1",
    projectId: null,
    estimatedPomodoros: 2,
    realPomodoros: 0,
    status: "pending",
    createdAt: 1000,
    updatedAt: 1000,
  },
  {
    id: "2",
    name: "Task 2",
    projectId: null,
    estimatedPomodoros: 3,
    realPomodoros: 1,
    status: "pending",
    createdAt: 2000,
    updatedAt: 2000,
  },
  {
    id: "3",
    name: "Task 3",
    projectId: null,
    estimatedPomodoros: 1,
    realPomodoros: 1,
    status: "completed",
    createdAt: 3000,
    updatedAt: 3000,
    completedAt: 4000,
  },
];

describe("TaskSelector", () => {
  it("shows header with Tasks title", () => {
    render(
      <TaskSelector
        tasks={mockTasks}
        activeTaskId={null}
        setActiveTask={vi.fn()}
        onToggleComplete={vi.fn()}
        onCreateTask={vi.fn()}
      />,
    );

    expect(screen.getByText("Tasks")).toBeInTheDocument();
  });

  it("shows + New button in header", () => {
    render(
      <TaskSelector
        tasks={mockTasks}
        activeTaskId={null}
        setActiveTask={vi.fn()}
        onToggleComplete={vi.fn()}
        onCreateTask={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /new/i })).toBeInTheDocument();
  });

  it("calls onCreateTask when + New button is clicked", () => {
    const onCreateTask = vi.fn();
    render(
      <TaskSelector
        tasks={mockTasks}
        activeTaskId={null}
        setActiveTask={vi.fn()}
        onToggleComplete={vi.fn()}
        onCreateTask={onCreateTask}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /new/i }));

    expect(onCreateTask).toHaveBeenCalled();
  });

  it("shows active task name and pomodoros", () => {
    render(
      <TaskSelector
        tasks={mockTasks}
        activeTaskId="1"
        setActiveTask={vi.fn()}
        onToggleComplete={vi.fn()}
        onCreateTask={vi.fn()}
      />,
    );

    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("0 / 2 Pomodoros")).toBeInTheDocument();
  });

  it("shows placeholder when no active task", () => {
    render(
      <TaskSelector
        tasks={mockTasks}
        activeTaskId={null}
        setActiveTask={vi.fn()}
        onToggleComplete={vi.fn()}
        onCreateTask={vi.fn()}
      />,
    );

    expect(screen.getByText(/select a task/i)).toBeInTheDocument();
  });

  it("shows clickable placeholder to open task selector", () => {
    render(
      <TaskSelector
        tasks={mockTasks}
        activeTaskId={null}
        setActiveTask={vi.fn()}
        onToggleComplete={vi.fn()}
        onCreateTask={vi.fn()}
      />,
    );

    const placeholder = screen.getByText(/select a task/i);
    expect(placeholder.closest("button")).toBeInTheDocument();
  });

  it("renders without crashing with empty tasks", () => {
    render(
      <TaskSelector
        tasks={[]}
        activeTaskId={null}
        setActiveTask={vi.fn()}
        onToggleComplete={vi.fn()}
        onCreateTask={vi.fn()}
      />,
    );

    expect(screen.getByText("Tasks")).toBeInTheDocument();
  });

  it("renders without crashing with undefined tasks", () => {
    render(
      <TaskSelector
        tasks={undefined}
        activeTaskId={null}
        setActiveTask={vi.fn()}
        onToggleComplete={vi.fn()}
        onCreateTask={vi.fn()}
      />,
    );

    expect(screen.getByText("Tasks")).toBeInTheDocument();
  });
});
