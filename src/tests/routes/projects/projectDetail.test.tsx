import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as useProjects from "@/hooks/useProjects";
import * as useTasks from "@/hooks/useTasks";
import type { Project, Task } from "@/types";
import { ProjectDetailPage } from "@/routes/projects/$projectId";

vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual = await importOriginal();
  const router = actual as any;
  return {
    ...router,
    Link: ({
      children,
      to,
      ...props
    }: {
      children: React.ReactNode;
      to: string;
      [key: string]: any;
    }) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
  };
});

const mockProject: Project = {
  id: "proj-1",
  name: "Test Project",
  description: "A test project",
  color: "#FF5733",
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const mockTasks: Task[] = [
  {
    id: "task-1",
    projectId: "proj-1",
    name: "Task 1",
    estimatedPomodoros: 2,
    realPomodoros: 1,
    status: "pending",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "task-2",
    projectId: "proj-1",
    name: "Task 2",
    estimatedPomodoros: 3,
    realPomodoros: 0,
    status: "in_progress",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "task-3",
    projectId: "proj-1",
    name: "Task 3",
    estimatedPomodoros: 1,
    realPomodoros: 1,
    status: "completed",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <div>{children}</div>
    </QueryClientProvider>
  );
};

vi.mock("@/hooks/useProjects", async () => {
  const actual = await vi.importActual("@/hooks/useProjects");
  return {
    ...actual,
    useProject: vi.fn(),
    useDeleteProject: vi.fn(() => ({ mutateAsync: vi.fn() })),
    useUpdateProject: vi.fn(() => ({ mutateAsync: vi.fn() })),
  };
});

vi.mock("@/hooks/useTasks", async () => {
  const actual = await vi.importActual("@/hooks/useTasks");
  return {
    ...actual,
    useTasksByProject: vi.fn(),
    useUpdateTask: vi.fn(() => ({ mutateAsync: vi.fn() })),
    useDeleteTask: vi.fn(() => ({ mutateAsync: vi.fn() })),
  };
});

describe("ProjectDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading skeleton when project is loading", () => {
    vi.mocked(useProjects.useProject).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);
    vi.mocked(useTasks.useTasksByProject).mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
    } as any);

    const { container } = render(<ProjectDetailPage projectId="proj-1" />, {
      wrapper: createWrapper(),
    });
    expect(container.querySelector(".animate-in")).toBeInTheDocument();
  });

  it("shows project not found when project does not exist", () => {
    vi.mocked(useProjects.useProject).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("Project not found"),
    } as any);
    vi.mocked(useTasks.useTasksByProject).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);

    render(<ProjectDetailPage projectId="proj-1" />, {
      wrapper: createWrapper(),
    });
    expect(screen.getByText(/not found/i)).toBeInTheDocument();
  });

  it("shows project tasks when project and tasks are loaded", () => {
    vi.mocked(useProjects.useProject).mockReturnValue({
      data: mockProject,
      isLoading: false,
      error: null,
    } as any);
    vi.mocked(useTasks.useTasksByProject).mockReturnValue({
      data: mockTasks,
      isLoading: false,
      error: null,
    } as any);

    render(<ProjectDetailPage projectId="proj-1" />, {
      wrapper: createWrapper(),
    });
    expect(screen.getByText("Test Project")).toBeInTheDocument();
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
  });

  it("shows pomodoro progress totals in the overview hero", () => {
    vi.mocked(useProjects.useProject).mockReturnValue({
      data: mockProject,
      isLoading: false,
      error: null,
    } as any);
    vi.mocked(useTasks.useTasksByProject).mockReturnValue({
      data: mockTasks,
      isLoading: false,
      error: null,
    } as any);

    render(<ProjectDetailPage projectId="proj-1" />, {
      wrapper: createWrapper(),
    });
    expect(screen.getByText(/2 \/ 6/)).toBeInTheDocument();
    expect(
      screen.getByRole("progressbar", { name: /estimated pomodoros completed/i }),
    ).toBeInTheDocument();
  });

  it("shows empty state when no tasks exist for project", () => {
    vi.mocked(useProjects.useProject).mockReturnValue({
      data: mockProject,
      isLoading: false,
      error: null,
    } as any);
    vi.mocked(useTasks.useTasksByProject).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);

    render(<ProjectDetailPage projectId="proj-1" />, {
      wrapper: createWrapper(),
    });
    expect(screen.getByText(/no tasks/i)).toBeInTheDocument();
  });

  it("renders task list grouped by status", () => {
    vi.mocked(useProjects.useProject).mockReturnValue({
      data: mockProject,
      isLoading: false,
      error: null,
    } as any);
    vi.mocked(useTasks.useTasksByProject).mockReturnValue({
      data: mockTasks,
      isLoading: false,
      error: null,
    } as any);

    render(<ProjectDetailPage projectId="proj-1" />, {
      wrapper: createWrapper(),
    });
    expect(screen.getByText(/in progress/i)).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: /pending tasks/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/completed/i)).toBeInTheDocument();
  });

  it("shows back link to projects", () => {
    vi.mocked(useProjects.useProject).mockReturnValue({
      data: mockProject,
      isLoading: false,
      error: null,
    } as any);
    vi.mocked(useTasks.useTasksByProject).mockReturnValue({
      data: mockTasks,
      isLoading: false,
      error: null,
    } as any);

    const { container } = render(<ProjectDetailPage projectId="proj-1" />, {
      wrapper: createWrapper(),
    });
    const link = container.querySelector('a[href="/projects"]');
    expect(link).toBeInTheDocument();
    expect(link?.textContent).toContain("Projects");
  });

  it("renders task pomodoro counts correctly", () => {
    vi.mocked(useProjects.useProject).mockReturnValue({
      data: mockProject,
      isLoading: false,
      error: null,
    } as any);
    vi.mocked(useTasks.useTasksByProject).mockReturnValue({
      data: [mockTasks[0]],
      isLoading: false,
      error: null,
    } as any);

    render(<ProjectDetailPage projectId="proj-1" />, {
      wrapper: createWrapper(),
    });
    expect(screen.getAllByText(/1 \/ 2/i).length).toBeGreaterThanOrEqual(1);
  });
});
