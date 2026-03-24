# ⚙️ Technical Specs — Pomotask

> Detailed technical specification for agents and developers.
> Follow these conventions strictly for consistency across the codebase.

---

## 🧱 Stack

| Concern            | Library/Tool             | Version                                                                       |
| ------------------ | ------------------------ | ----------------------------------------------------------------------------- |
| UI Framework       | React                    | 18                                                                            |
| Build Tool         | Vite                     | 5                                                                             |
| Package Manager    | pnpm                     | 9                                                                             |
| Routing            | TanStack Router          | latest                                                                        |
| Server/Async State | TanStack Query           | v5                                                                            |
| Forms              | TanStack Form            | latest                                                                        |
| Tables             | TanStack Table           | v8                                                                            |
| Local DB           | Dexie.js (IndexedDB)     | v4                                                                            |
| Global UI State    | Zustand                  | v4                                                                            |
| Auth + Remote DB   | Supabase                 | v2 (optional)                                                                 |
| Styling            | Tailwind CSS             | v4 (`@tailwindcss/vite`; no separate `tailwind.config.ts` unless you add one) |
| Components         | shadcn/ui                | latest                                                                        |
| Icons              | Lucide React             | latest                                                                        |
| Unit tests         | Vitest + Testing Library | 3                                                                             |
| Language           | TypeScript               | strict mode                                                                   |

---

## 📂 File & Folder Structure

**Target layout** (full UI/routing arrives per [ROADMAP.md](./ROADMAP.md)). **In the repo today:** `src/db/*`, `src/lib/*`, `src/stores/timerStore.ts`, `src/types/`, `src/tests/`, `App.tsx`, `main.tsx`; no `routes/`, `components/`, or `hooks/` yet.

Repository: [github.com/godie/Pomotask](https://github.com/godie/Pomotask/). **npm package name:** `pomo-task` (folder after `git clone` is often `Pomotask`).

```
Pomotask/   # or your clone folder name
├── public/
│   ├── manifest.json         # PWA manifest
│   ├── icons/                # PWA icons (see manifest)
│   └── sw.js                 # Service worker — planned (Phase 9); not in repo yet
├── src/
│   ├── main.tsx              # App entry point
│   ├── App.tsx               # Root shell (RouterProvider when routing lands)
│   ├── routes/
│   │   ├── __root.tsx        # Root layout (nav, timer bar)
│   │   ├── index.tsx         # / → Timer + active task
│   │   ├── projects/
│   │   │   ├── index.tsx     # /projects → list
│   │   │   └── $projectId.tsx # /projects/:id → detail
│   │   └── tasks/
│   │       └── index.tsx     # /tasks → all tasks
│   ├── components/
│   │   ├── timer/
│   │   │   ├── PomodoroTimer.tsx
│   │   │   ├── TimerControls.tsx
│   │   │   ├── TimerRing.tsx        # SVG circular progress
│   │   │   └── BreakOverlay.tsx
│   │   ├── tasks/
│   │   │   ├── TaskCard.tsx
│   │   │   ├── TaskForm.tsx
│   │   │   ├── TaskList.tsx
│   │   │   └── TaskSplitDialog.tsx
│   │   ├── projects/
│   │   │   ├── ProjectCard.tsx
│   │   │   ├── ProjectForm.tsx
│   │   │   └── ProjectStats.tsx
│   │   └── ui/               # shadcn/ui generated components
│   ├── hooks/
│   │   ├── useTimer.ts       # Timer state machine
│   │   ├── useTasks.ts       # TanStack Query: tasks CRUD
│   │   └── useProjects.ts    # TanStack Query: projects CRUD
│   ├── db/
│   │   ├── schema.ts         # Dexie DB class + schema
│   │   ├── tasks.ts          # Task DB operations
│   │   ├── projects.ts       # Project DB operations
│   │   ├── sessions.ts       # PomodoroSession records
│   │   └── sync.ts           # Supabase sync (optional, conditional — not yet)
│   ├── tests/                # Vitest: setup.ts + *.test.ts
│   ├── stores/
│   │   └── timerStore.ts     # Zustand: active timer + active task
│   ├── lib/
│   │   ├── pomodoro.ts       # Business logic (split rule, calc)
│   │   ├── supabase.ts       # Supabase client (lazy init)
│   │   └── utils.ts          # cn(), formatTime(), etc.
│   └── types/
│       └── index.ts          # All shared TypeScript types
├── .env.example
├── .github/
│   └── workflows/
│       └── ci.yml            # lint, typecheck, test, build, Cloudflare deploy
├── vite.config.ts            # Vite build / dev
├── vitest.config.ts          # Vitest (extends Vite config via mergeConfig)
├── tsconfig.json
└── package.json              # name: pomo-task
```

---

## 🗄️ Data Models

### TypeScript Types (`src/types/index.ts`)

```typescript
export type TaskStatus = "pending" | "in_progress" | "completed";

export interface Project {
  id: string; // uuid
  name: string;
  color: string; // hex color e.g. "#ef4444"
  description?: string;
  createdAt: number; // timestamp ms
  updatedAt: number;
}

export interface Task {
  id: string; // uuid
  projectId: string | null; // nullable: task can be unassigned
  name: string;
  estimatedPomodoros: number; // 1–10
  realPomodoros: number; // auto-incremented, starts at 0
  status: TaskStatus;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
}

export interface PomodoroSession {
  id: string;
  taskId: string;
  startedAt: number;
  completedAt: number; // only set if fully completed
  type: "focus" | "short_break" | "long_break";
  durationSeconds: number;
}
```

### Dexie Schema (`src/db/schema.ts`)

```typescript
import Dexie, { type Table } from "dexie";
import type { Project, Task, PomodoroSession } from "@/types";

export class PomotaskDB extends Dexie {
  projects!: Table<Project>;
  tasks!: Table<Task>;
  sessions!: Table<PomodoroSession>;

  constructor() {
    super("PomotaskDB");
    this.version(1).stores({
      projects: "id, createdAt",
      tasks: "id, projectId, status, createdAt",
      sessions: "id, taskId, startedAt, type",
    });
  }
}

export const db = new PomotaskDB();
```

---

## ⏱️ Timer State Machine

The timer has the following states managed in Zustand (`timerStore.ts`):

```
IDLE → FOCUS_RUNNING → FOCUS_PAUSED → FOCUS_RUNNING (resume)
                     ↓ (completes)
              SHORT_BREAK / LONG_BREAK
                     ↓ (completes or skip)
                    IDLE or next FOCUS
```

```typescript
export type TimerMode = "focus" | "short_break" | "long_break";
export type TimerStatus = "idle" | "running" | "paused" | "break";

interface TimerStore {
  status: TimerStatus;
  mode: TimerMode;
  secondsLeft: number;
  pomodorosCompleted: number; // in current session (resets on long break)
  totalPomodorosToday: number;
  activeTaskId: string | null;

  start: () => void;
  pause: () => void;
  resume: () => void;
  skip: () => void;
  reset: () => void;
  setActiveTask: (taskId: string | null) => void;
  tick: () => void; // called every second by setInterval
}
```

**Timer constants:**

```typescript
export const FOCUS_DURATION = 25 * 60; // 1500 seconds
export const SHORT_BREAK = 5 * 60; // 300 seconds
export const LONG_BREAK = 15 * 60; // 900 seconds
export const POMODOROS_UNTIL_LONG_BREAK = 4;
```

**On focus session complete:**

The `tick()` function (async) handles focus session completion when `secondsLeft` reaches 0:
1. Increment `realPomodoros` on active task in IndexedDB.
2. Increment `pomodorosCompleted` in store.
3. Create a `PomodoroSession` record in DB with `type: "focus"`.
4. Clear the current timer timeout.
5. If `pomodorosCompleted % 4 === 0` → set mode to `long_break` and `secondsLeft` to `LONG_BREAK`.
6. Else → set mode to `short_break` and `secondsLeft` to `SHORT_BREAK`.
7. Set status to `break`.

**On break session complete:**

When `secondsLeft` reaches 0 in `short_break` or `long_break` mode:
1. Clear the current timer timeout.
2. Reset `mode` to `focus`.
3. Reset `secondsLeft` to `FOCUS_DURATION`.
4. Set `status` to `idle`.

**Timer Loop Implementation Details:**
The timer uses a recursive `setTimeout` pattern to ensure each `tick()` (which is asynchronous due to database operations) completes fully before the next tick is scheduled. This avoids race conditions and overlapping execution.

---

## 🔀 Task Split Logic (`src/lib/pomodoro.ts`)

```typescript
export function shouldSplitTask(estimatedPomodoros: number): boolean {
  return estimatedPomodoros > 5;
}

export function splitTask(
  task: Omit<Task, "id" | "createdAt" | "updatedAt">,
): [Task, Task] {
  const half = Math.ceil(task.estimatedPomodoros / 2);
  const remainder = task.estimatedPomodoros - half;

  const base = {
    projectId: task.projectId,
    status: "pending" as TaskStatus,
    realPomodoros: 0,
  };
  const now = Date.now();

  return [
    {
      ...base,
      id: crypto.randomUUID(),
      name: `${task.name} (Part 1)`,
      estimatedPomodoros: half,
      createdAt: now,
      updatedAt: now,
    },
    {
      ...base,
      id: crypto.randomUUID(),
      name: `${task.name} (Part 2)`,
      estimatedPomodoros: remainder,
      createdAt: now,
      updatedAt: now,
    },
  ];
}
```

---

## 🔄 TanStack Query — Query Keys

```typescript
export const queryKeys = {
  projects: {
    all: ["projects"] as const,
    detail: (id: string) => ["projects", id] as const,
    tasks: (id: string) => ["projects", id, "tasks"] as const,
  },
  tasks: {
    all: ["tasks"] as const,
    byProject: (projectId: string) => ["tasks", { projectId }] as const,
    detail: (id: string) => ["tasks", id] as const,
  },
  sessions: {
    byTask: (taskId: string) => ["sessions", { taskId }] as const,
    today: ["sessions", "today"] as const,
  },
};
```

---

## 🔐 Auth & Sync Strategy

```
User not signed in:
  → All reads/writes go directly to IndexedDB (Dexie)
  → Supabase client never initialized

User signs in:
  → Pull remote data from Supabase → merge into IndexedDB
  → All future writes go to IndexedDB AND Supabase (dual-write)
  → On conflict: last-write-wins by updatedAt timestamp
```

Supabase tables mirror the TypeScript types exactly (snake_case columns).
RLS policies: users can only read/write their own rows (`user_id = auth.uid()`).

---

## 📱 PWA Configuration

**`public/manifest.json`** — source of truth is the file in the repo. Current icons live under **`/icons/`** (e.g. `/icons/icon-192.png`). Theme/background colors match the Stitch palette (see file).

Minimum shape (fields may match current values):

```json
{
  "name": "Pomotask",
  "short_name": "Pomodoro",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a12",
  "theme_color": "#ff2d78",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

Service worker: cache app shell + static assets (Phase 9). No need to cache API calls for MVP.

---

## 🧪 Code Conventions

- **File naming**: PascalCase for components, camelCase for hooks/utils
- **Imports**: use `@/` alias for `src/`
- **No default exports** except for route components (TanStack Router convention)
- **Error boundaries**: wrap each route in an ErrorBoundary
- **Loading states**: every async operation shows a skeleton or spinner
- **TypeScript**: strict mode, no `any`
- **Commits**: conventional commits (`feat:`, `fix:`, `chore:`, etc.)

---

## 🌐 Design Source

UI/UX: [Google Stitch Project](https://stitch.withgoogle.com/projects/6328229122179225454)

> **Agents**: Connect to Stitch via MCP to retrieve exact colors, typography, spacing tokens, and component designs before implementing any UI component.
