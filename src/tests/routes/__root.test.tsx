import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { createRoute, createRouter, RouterProvider } from "@tanstack/react-router";
import { Route as RootRoute } from "@/routes/__root";
import { useTimerStore } from "@/stores/timerStore";

vi.mock("@/stores/timerStore", () => ({
  useTimerStore: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: null,
}));

// Mock router devtools to avoid issues in tests
vi.mock("@/components/ui/ErrorBoundary", () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@tanstack/router-devtools", () => ({
  TanStackRouterDevtools: () => null,
}));

describe("RootLayout", () => {
  const createMockRouter = () => {
    const rootRoute = RootRoute;
    const indexRoute = createRoute({
        getParentRoute: () => rootRoute,
        path: '/',
        component: () => <div>Home</div>
    })
    const routeTree = rootRoute.addChildren([indexRoute]);
    return createRouter({ routeTree });
  };

  it("renders nav with Timer, Projects, Tasks links", async () => {
    (useTimerStore as any).mockReturnValue({
      status: "idle",
      secondsLeft: 1500,
      mode: "focus",
    });

    const router = createMockRouter();
    render(<RouterProvider router={router} />);

    await waitFor(() => {
        expect(screen.getAllByText(/Timer/i)[0]).toBeInTheDocument();
    });

    expect(screen.getAllByText(/Projects/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Tasks/i)[0]).toBeInTheDocument();

    // Check mobile links (footer)
    expect(screen.getAllByText(/Timer/i)).toHaveLength(2);
    expect(screen.getAllByText(/Projects/i)).toHaveLength(2);
    expect(screen.getAllByText(/Tasks/i)).toHaveLength(2);
  });

  it("renders mini-timer bar when timer is running", async () => {
    (useTimerStore as any).mockReturnValue({
      status: "running",
      secondsLeft: 1200,
      mode: "focus",
    });

    const router = createMockRouter();
    render(<RouterProvider router={router} />);

    await waitFor(() => {
        expect(screen.getByText(/FOCUS: 20:00/i)).toBeInTheDocument();
    });
  });

  it("does not render mini-timer bar when timer is idle", async () => {
    (useTimerStore as any).mockReturnValue({
      status: "idle",
      secondsLeft: 1500,
      mode: "focus",
    });

    const router = createMockRouter();
    render(<RouterProvider router={router} />);

    // Wait a bit to ensure it doesn't appear
    await new Promise(r => setTimeout(r, 100));
    expect(screen.queryByText(/FOCUS: 25:00/i)).not.toBeInTheDocument();
  });
});
