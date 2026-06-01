export const queryKeys = {
  projects: {
    all: ['projects'] as const,
    detail: (id: string) => ['projects', id] as const,
    tasks: (id: string) => ['projects', id, 'tasks'] as const,
  },
  tasks: {
    all: ['tasks'] as const,
    byProject: (projectId: string) => ['tasks', { projectId }] as const,
    detail: (id: string) => ['tasks', id] as const,
  },
  sessions: {
    all: ['sessions', 'all'] as const,
    byTask: (taskId: string) => ['sessions', { taskId }] as const,
    today: ['sessions', 'today'] as const,
  },
};
