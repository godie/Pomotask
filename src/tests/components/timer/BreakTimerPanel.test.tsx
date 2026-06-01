import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BreakTimerPanel } from "@/components/timer/BreakTimerPanel";

describe("BreakTimerPanel", () => {
  it("renders short break title", () => {
    render(<BreakTimerPanel mode="short_break" />);
    expect(screen.getByRole("heading", { name: /short break/i })).toBeInTheDocument();
  });

  it("renders long break title", () => {
    render(<BreakTimerPanel mode="long_break" />);
    expect(screen.getByRole("heading", { name: /long break/i })).toBeInTheDocument();
  });
});
