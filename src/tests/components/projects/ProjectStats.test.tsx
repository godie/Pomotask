import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProjectStats } from "@/components/projects/ProjectStats";

describe("ProjectStats", () => {
  it("renders estimated and real pomodoro counts", () => {
    render(<ProjectStats estimated={10} real={5} />);
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("renders Total Estimated label", () => {
    render(<ProjectStats estimated={10} real={5} />);
    expect(screen.getByText("Total Estimated")).toBeInTheDocument();
  });

  it("renders Total Realized label", () => {
    render(<ProjectStats estimated={10} real={5} />);
    expect(screen.getByText("Total Realized")).toBeInTheDocument();
  });

  it("renders in a grid layout", () => {
    const { container } = render(<ProjectStats estimated={10} real={5} />);
    expect(container.querySelector(".grid")).toBeInTheDocument();
  });

  it("renders estimated value with tertiary color", () => {
    render(<ProjectStats estimated={10} real={5} />);
    const estimated = screen.getByText("10");
    expect(estimated).toHaveClass("text-tertiary");
  });

  it("renders real value with primary color", () => {
    render(<ProjectStats estimated={10} real={5} />);
    const real = screen.getByText("5");
    expect(real).toHaveClass("text-primary");
  });

  it("renders both stat containers", () => {
    const { container } = render(<ProjectStats estimated={10} real={5} />);
    const statContainers = container.querySelectorAll(".flex.flex-col");
    expect(statContainers).toHaveLength(2);
  });

  it("handles zero values", () => {
    render(<ProjectStats estimated={0} real={0} />);
    expect(screen.getAllByText("0")).toHaveLength(2);
  });

  it("handles large values", () => {
    render(<ProjectStats estimated={9999} real={8888} />);
    expect(screen.getByText("9999")).toBeInTheDocument();
    expect(screen.getByText("8888")).toBeInTheDocument();
  });
});
