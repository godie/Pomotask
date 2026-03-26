import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskSplitDialog } from "@/components/tasks/TaskSplitDialog";
import { Dialog } from "@/components/ui/Dialog";
import type { Task } from "@/types";

describe("TaskSplitDialog", () => {
  const mockTask: Task = {
    id: "1",
    name: "Big Task",
    projectId: null,
    estimatedPomodoros: 8,
    realPomodoros: 0,
    status: "pending",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const renderDialog = (onConfirm: () => void, onCancel: () => void) => {
    return render(
      <Dialog open onOpenChange={() => {}}>
        <TaskSplitDialog
          task={mockTask}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      </Dialog>,
    );
  };

  it("renders Part 1 with correct name and estimate", () => {
    renderDialog(vi.fn(), vi.fn());
    expect(screen.getByText(/Split - Part 1/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Big Task \(Part 1\) \(4 🍅\)/i),
    ).toBeInTheDocument();
  });

  it("renders Part 2 with correct name and estimate", () => {
    renderDialog(vi.fn(), vi.fn());
    expect(screen.getByText(/Split - Part 2/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Big Task \(Part 2\) \(4 🍅\)/i),
    ).toBeInTheDocument();
  });

  it("renders original task crossed out", () => {
    renderDialog(vi.fn(), vi.fn());
    expect(screen.getByText(/Original Task/i)).toBeInTheDocument();
    expect(screen.getByText(/Big Task \(8 🍅\)/i)).toBeInTheDocument();
  });

  it("calls onConfirm when Split button clicked", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    renderDialog(onConfirm, onCancel);
    await user.click(screen.getByRole("button", { name: /split/i }));
    expect(onConfirm).toHaveBeenCalled();
  });

  it("calls onCancel when Keep as one task clicked", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    renderDialog(onConfirm, onCancel);
    await user.click(screen.getByRole("button", { name: /keep as one task/i }));
    expect(onCancel).toHaveBeenCalled();
  });
});
