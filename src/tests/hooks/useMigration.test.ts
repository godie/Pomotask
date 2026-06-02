import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useConvexAuth, useQuery } from "convex/react";
import { migrateLocalDataToConvex } from "@/lib/migration";
import { useMigration } from "@/hooks/useMigration";

vi.mock("@/lib/migration", () => ({
  migrateLocalDataToConvex: vi.fn(),
}));

describe("useMigration", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default: unauthenticated, no active queries
    vi.mocked(useConvexAuth).mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
    });
    // useQuery already returns undefined after clearAllMocks()
    vi.mocked(migrateLocalDataToConvex).mockResolvedValue({ projects: 0, tasks: 0 });
  });

  // ── Status type assertions ──

  it("returns idle status when the user is not authenticated", () => {
    const { result } = renderHook(() => useMigration());
    expect(result.current.status).toBe("idle");
    expect(result.current.error).toBeNull();
    expect(migrateLocalDataToConvex).not.toHaveBeenCalled();
  });

  it("returns idle status while auth is still loading", () => {
    vi.mocked(useConvexAuth).mockReturnValue({
      isLoading: true,
      isAuthenticated: false,
    });

    const { result } = renderHook(() => useMigration());
    expect(result.current.status).toBe("idle");
    expect(migrateLocalDataToConvex).not.toHaveBeenCalled();
  });

  // ── Happy path: idle → migrating → done ──

  it("transitions from idle → migrating → done on successful migration", async () => {
    vi.mocked(useConvexAuth).mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
    });
    vi.mocked(useQuery).mockReturnValue("user-abc-123");

    const { result } = renderHook(() => useMigration());

    // Immediately after render: status is "migrating" (setState before the promise)
    expect(result.current.status).toBe("migrating");
    expect(result.current.error).toBeNull();
    expect(migrateLocalDataToConvex).toHaveBeenCalledTimes(1);
    expect(migrateLocalDataToConvex).toHaveBeenCalledWith("user-abc-123");

    // Wait for the promise .then() to update state to "done"
    await waitFor(() => {
      expect(result.current.status).toBe("done");
    });
    expect(result.current.error).toBeNull();
  });

  // ── Idempotence (double-call guard) ──

  it("does not call migration again on subsequent re-renders", async () => {
    vi.mocked(useConvexAuth).mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
    });
    vi.mocked(useQuery).mockReturnValue("user-abc-123");

    const { rerender, result } = renderHook(() => useMigration());

    expect(result.current.status).toBe("migrating");
    expect(migrateLocalDataToConvex).toHaveBeenCalledTimes(1);

    // Wait for done
    await waitFor(() => {
      expect(result.current.status).toBe("done");
    });

    // Simulate re-render with same auth state — status stays done, no re-call
    rerender();

    expect(result.current.status).toBe("done");
    expect(migrateLocalDataToConvex).toHaveBeenCalledTimes(1);
  });

  // ── Waiting for userId query ──

  it("waits for the userId query to resolve before calling migration", async () => {
    vi.mocked(useConvexAuth).mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
    });
    // userId query still loading (returns undefined)
    vi.mocked(useQuery).mockReturnValue(undefined);

    const { rerender, result } = renderHook(() => useMigration());

    expect(result.current.status).toBe("idle");
    expect(migrateLocalDataToConvex).not.toHaveBeenCalled();

    // userId query resolves
    vi.mocked(useQuery).mockReturnValue("user-def-456");
    rerender();

    expect(result.current.status).toBe("migrating");
    expect(migrateLocalDataToConvex).toHaveBeenCalledTimes(1);
    expect(migrateLocalDataToConvex).toHaveBeenCalledWith("user-def-456");

    // Wait for done
    await waitFor(() => {
      expect(result.current.status).toBe("done");
    });
  });

  // ── Null userId edge case ──

  it("stays idle when authenticated but userId query returns null", () => {
    vi.mocked(useConvexAuth).mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
    });
    vi.mocked(useQuery).mockReturnValue(null);

    const { result } = renderHook(() => useMigration());

    expect(result.current.status).toBe("idle");
    expect(migrateLocalDataToConvex).not.toHaveBeenCalled();
  });

  // ── Error handling ──

  it("transitions to error status when migration fails", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(useConvexAuth).mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
    });
    vi.mocked(useQuery).mockReturnValue("user-xyz-789");
    vi.mocked(migrateLocalDataToConvex).mockRejectedValue(new Error("Network failure"));

    const { result } = renderHook(() => useMigration());

    // Immediately: migrating
    expect(result.current.status).toBe("migrating");

    // Wait for .catch() to set error status
    await waitFor(() => {
      expect(result.current.status).toBe("error");
    });
    expect(result.current.error).toBe("Network failure");

    consoleSpy.mockRestore();
  });

  it("converts non-Error migration rejections to string messages", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(useConvexAuth).mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
    });
    vi.mocked(useQuery).mockReturnValue("user-xyz-789");
    vi.mocked(migrateLocalDataToConvex).mockRejectedValue("Unexpected rejection");

    const { result } = renderHook(() => useMigration());

    await waitFor(() => {
      expect(result.current.status).toBe("error");
    });
    expect(result.current.error).toBe("Unexpected rejection");

    consoleSpy.mockRestore();
  });
});
