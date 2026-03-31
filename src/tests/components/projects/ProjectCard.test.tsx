import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProjectCard } from "@/components/projects/ProjectCard";
import type { Project } from "@/types";

const mockProject: Project = {
  id: "1",
  name: "Test Project",
  description: "Test Description",
  color: "#ff2d78",
  createdAt: 1000,
  updatedAt: 1000,
};

describe("ProjectCard", () => {
  it("renders project name", () => {
    render(
      <ProjectCard
        project={mockProject}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onAddTask={vi.fn()}
        taskCount={5}
      />,
    );
    expect(screen.getByText("Test Project")).toBeInTheDocument();
  });

  it("renders project description when provided", () => {
    render(
      <ProjectCard
        project={mockProject}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onAddTask={vi.fn()}
        taskCount={5}
      />,
    );
    expect(screen.getByText("Test Description")).toBeInTheDocument();
  });

  it("renders project color indicator", () => {
    render(
      <ProjectCard
        project={mockProject}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onAddTask={vi.fn()}
        taskCount={5}
      />,
    );
    const indicator = screen.getByText("Active").previousElementSibling;
    expect(indicator).toHaveStyle({ backgroundColor: mockProject.color });
  });

  it("calls onDelete when delete button clicked", () => {
    const onDelete = vi.fn();
    render(
      <ProjectCard
        project={mockProject}
        onDelete={onDelete}
        onEdit={vi.fn()}
        onAddTask={vi.fn()}
        taskCount={5}
      />,
    );
    const deleteButton = screen.getByRole("button", {
      name: /delete project/i,
    });
    fireEvent.click(deleteButton);
    expect(onDelete).toHaveBeenCalledWith("1");
  });

  it("calls onEdit when edit button clicked", () => {
    const onEdit = vi.fn();
    render(
      <ProjectCard
        project={mockProject}
        onDelete={vi.fn()}
        onEdit={onEdit}
        onAddTask={vi.fn()}
        taskCount={5}
      />,
    );
    const editButton = screen.getByRole("button", { name: /edit project/i });
    fireEvent.click(editButton);
    expect(onEdit).toHaveBeenCalledWith(mockProject);
  });

  it("renders actual task count", () => {
    render(
      <ProjectCard
        project={mockProject}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onAddTask={vi.fn()}
        taskCount={12}
      />,
    );
    expect(screen.getByText("12 Tasks")).toBeInTheDocument();
  });

  it("calls onAddTask with project id when Add Task button is clicked", () => {
    const onAddTask = vi.fn();
    render(
      <ProjectCard
        project={mockProject}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onAddTask={onAddTask}
        taskCount={0}
      />,
    );
    const addButton = screen.getByRole("button", { name: /add task/i });
    fireEvent.click(addButton);
    expect(onAddTask).toHaveBeenCalledWith("1");
  });

  it("renders Add Task button", () => {
    render(
      <ProjectCard
        project={mockProject}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onAddTask={vi.fn()}
        taskCount={0}
      />,
    );
    expect(
      screen.getByRole("button", { name: /add task/i }),
    ).toBeInTheDocument();
  });
});
