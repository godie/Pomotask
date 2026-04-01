import { describe, it, expect } from "vitest";
import { isProjectDetailPath } from "@/lib/projectRoutes";

describe("isProjectDetailPath", () => {
  it("returns false for projects index", () => {
    expect(isProjectDetailPath("/projects")).toBe(false);
    expect(isProjectDetailPath("/projects/")).toBe(false);
  });

  it("returns true for a project id segment", () => {
    expect(isProjectDetailPath("/projects/abc-123")).toBe(true);
  });

  it("returns false for nested paths under a project", () => {
    expect(isProjectDetailPath("/projects/abc/extra")).toBe(false);
  });
});
