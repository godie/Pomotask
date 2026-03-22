# 🗺️ Roadmap & Agent Tasks — PomodoroFlow

> This file is the source of truth for the AI agent implementing the project.
> Work tasks IN ORDER. Mark each task as `[x]` when complete before moving to the next.
> Read `SPECS.md` and `MVP_SCOPE.md` before starting. Connect to Stitch MCP for design tokens before any UI work.

---

## 🤖 Agent Instructions

1. **Read first**: \`README.md\` → \`SPECS.md\` → \`MVPSCOPE.md\`
2. **Design tokens**: Before writing any component, connect to Stitch MCP at \`https://stitch.withgoogle.com/projects/6328229122179225454\` to get colors, fonts, spacing, and component specs.
3. **One task at a time**: Complete and verify each task before moving to the next.
4. **Tests**: After each phase, do a quick smoke test of the feature before continuing.
5. **Commits**: Commit after each completed phase with a conventional commit message.

---

## Phase 0 — Project Setup

- [ ] **0.1** Scaffold Vite + React + TypeScript project with pnpm
  \`\`\`bash
  pnpm create vite pomodoro-flow --template react-ts
  cd pomodoro-flow
  \`\`\`
- [ ] **0.2** Install all dependencies:
  \`\`\`bash
  pnpm add @tanstack/react-router @tanstack/react-query @tanstack/react-form @tanstack/react-table
  pnpm add dexie zustand
  pnpm add @supabase/supabase-js
  pnpm add lucide-react
  pnpm add -D tailwindcss @tailwindcss/vite
  pnpm dlx shadcn@latest init
  \`\`\`
- [ ] **0.3** Configure TanStack Router (file-based routing with Vite plugin)
- [ ] **0.4** Configure path alias \`@/\` → \`src/\` in \`vite.config.ts\` and \`tsconfig.json\`
- [ ] **0.5** Set up Tailwind CSS v4 with Vite plugin
- [ ] **0.6** Create folder structure as defined in \`SPECS.md\`
- [ ] **0.7** Create \`src/types/index.ts\` with all TypeScript types from SPECS
- [ ] **0.8** Create \`.env.example\` with Supabase vars
- [ ] **0.9** Create \`README.md\` (already exists — copy to project root)
- [ ] **0.10** Add PWA manifest (\`public/manifest.json\`) and placeholder icons

**Commit**: \`chore: project setup and dependencies\`

---

## Phase 1 — Database Layer (IndexedDB)

- [ ] **1.1** Create \`src/db/schema.ts\` with Dexie class as defined in SPECS
- [ ] **1.2** Create \`src/db/projects.ts\` with functions:
  - \`getAllProjects(): Promise<Project[]>\`
  - \`getProjectById(id: string): Promise<Project | undefined>\`
  - \`createProject(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project>\`
  - \`updateProject(id: string, data: Partial<Project>): Promise<Project>\`
  - \`deleteProject(id: string): Promise<void>\`
- [ ] **1.3** Create \`src/db/tasks.ts\` with functions:
  - \`getAllTasks(): Promise<Task[]>\`
  - \`getTasksByProject(projectId: string): Promise<Task[]>\`
  - \`getTaskById(id: string): Promise<Task | undefined>\`
  - \`createTask(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task>\`
  - \`updateTask(id: string, data: Partial<Task>): Promise<Task>\`
  - \`deleteTask(id: string): Promise<void>\`
  - \`incrementRealPomodoros(id: string): Promise<void>\`
- [ ] **1.4** Create \`src/db/sessions.ts\`:
  - \`createSession(data: Omit<PomodoroSession, 'id'>): Promise<PomodoroSession>\`
  - \`getSessionsByTask(taskId: string): Promise<PomodoroSession[]>\`
  - \`getTodaySessions(): Promise<PomodoroSession[]>\`
- [ ] **1.5** Create \`src/lib/pomodoro.ts\` with \`shouldSplitTask()\` and \`splitTask()\` as defined in SPECS

**Commit**: \`feat: IndexedDB schema and data layer\`

---

## Phase 2 — Timer Store

- [ ] **2.1** Create \`src/stores/timerStore.ts\` with Zustand store (full interface from SPECS)
- [ ] **2.2** Implement timer constants (\`FOCUS_DURATION\`, \`SHORT_BREAK\`, \`LONG_BREAK\`)
- [ ] **2.3** Implement \`tick()\` action:
  - Decrement \`secondsLeft\`
  - When reaches 0: call \`onSessionComplete()\` internal handler
- [ ] **2.4** Implement \`onSessionComplete()\`:
  - If focus session: call \`incrementRealPomodoros(activeTaskId)\` on DB
  - Create a \`PomodoroSession\` record
  - Transition to break (short or long based on \`pomodorosCompleted % 4\`)
- [ ] **2.5** Implement \`start()\`, \`pause()\`, \`resume()\`, \`skip()\`, \`reset()\`
- [ ] **2.6** Wire up \`setInterval\` inside the store (use a ref pattern or middleware)
- [ ] **2.7** Create \`src/hooks/useTimer.ts\` — thin hook that reads from timerStore

**Commit**: \`feat: Zustand timer store with state machine\`

---

## Phase 3 — TanStack Query Hooks

- [ ] **3.1** Create \`src/lib/queryKeys.ts\` with all query keys from SPECS
- [ ] **3.2** Create \`src/hooks/useProjects.ts\`:
  - \`useProjects()\` — fetch all projects
  - \`useProject(id)\` — fetch single project
  - \`useCreateProject()\` — mutation
  - \`useUpdateProject()\` — mutation
  - \`useDeleteProject()\` — mutation
- [ ] **3.3** Create \`src/hooks/useTasks.ts\`:
  - \`useTasks()\` — all tasks
  - \`useTasksByProject(projectId)\` — filtered
  - \`useTask(id)\` — single task
  - \`useCreateTask()\` — mutation (includes split logic trigger)
  - \`useUpdateTask()\` — mutation
  - \`useDeleteTask()\` — mutation
- [ ] **3.4** Set up \`QueryClient\` in \`src/main.tsx\` with \`staleTime: 1000 * 60\`

**Commit**: \`feat: TanStack Query hooks for projects and tasks\`

---

## Phase 4 — Routing & Layout

- [ ] **4.1** Create \`src/routes/__root.tsx\` — root layout with:
  - Top navigation bar (logo, nav links: Timer, Projects, Tasks)
  - Persistent mini-timer bar at bottom (shows current countdown if running)
  - \`<Outlet />\` for page content
- [ ] **4.2** Create \`src/routes/index.tsx\` — Timer home page (placeholder for Phase 5)
- [ ] **4.3** Create \`src/routes/projects/index.tsx\` — Projects list page (placeholder)
- [ ] **4.4** Create \`src/routes/projects/$projectId.tsx\` — Project detail page (placeholder)
- [ ] **4.5** Create \`src/routes/tasks/index.tsx\` — Tasks list page (placeholder)
- [ ] **4.6** Add \`<RouterProvider>\` in \`src/App.tsx\`
- [ ] **4.7** Add 404 not-found route

> ⚠️ Connect to Stitch MCP before implementing layout — get exact nav design, colors, spacing.

**Commit**: \`feat: routing and root layout shell\`

---

## Phase 5 — Timer UI

> ⚠️ Fetch Stitch MCP design for timer screen before coding.

- [ ] **5.1** Create \`src/components/timer/TimerRing.tsx\`:
  - SVG circular progress ring
  - Animates as time decreases
  - Shows \`MM:SS\` in center
  - Color changes per mode (focus = brand color, break = calm color)
- [ ] **5.2** Create \`src/components/timer/TimerControls.tsx\`:
  - Start / Pause / Resume / Skip buttons
  - Reads state from timerStore
- [ ] **5.3** Create \`src/components/timer/BreakOverlay.tsx\`:
  - Full-screen or modal overlay during break
  - Shows break type (short/long), countdown, skip button
- [ ] **5.4** Create active task selector on timer page:
  - Dropdown or searchable list of pending/in-progress tasks
  - Shows selected task name and Pomodoro count
- [ ] **5.5** Wire timer page \`src/routes/index.tsx\` — compose all timer components
- [ ] **5.6** Add browser notification on session end (ask permission on first use)
- [ ] **5.7** Add simple audio beep using Web Audio API on session end

**Commit**: \`feat: Pomodoro timer UI and controls\`

---

## Phase 6 — Projects UI

> ⚠️ Fetch Stitch MCP design for projects screens before coding.

- [ ] **6.1** Create \`src/components/projects/ProjectCard.tsx\`:
  - Shows project name, color indicator, task count, Pomodoro stats (est vs real)
  - Link to project detail
  - Quick edit / delete actions
- [ ] **6.2** Create \`src/components/projects/ProjectForm.tsx\`:
  - TanStack Form
  - Fields: name (required), color picker (preset swatches), description (optional)
  - Validation: name required, name max 60 chars
- [ ] **6.3** Create \`src/components/projects/ProjectStats.tsx\`:
  - Shows \`Estimated: X 🍅 / Real: Y 🍅\`
  - Progress bar or visual indicator
- [ ] **6.4** Implement \`src/routes/projects/index.tsx\`:
  - Grid/list of \`ProjectCard\`
  - "New Project" button → opens \`ProjectForm\` in dialog
  - Empty state when no projects
- [ ] **6.5** Implement \`src/routes/projects/$projectId.tsx\`:
  - Project header with name, color, stats
  - Task list filtered to this project (use TaskList component)
  - "Add Task" button pre-filled with projectId

**Commit**: \`feat: projects list and detail UI\`

---

## Phase 7 — Tasks UI

> ⚠️ Fetch Stitch MCP design for task screens before coding.

- [ ] **7.1** Create \`src/components/tasks/TaskCard.tsx\`:
  - Shows task name, project tag, \`estimatedPomodoros\` vs \`realPomodoros\` (e.g. \`2/4 🍅\`)
  - Status badge (pending / in progress / done)
  - "Start" button (sets as active task in timer)
  - Complete / delete actions
- [ ] **7.2** Create \`src/components/tasks/TaskSplitDialog.tsx\`:
  - Shown when \`estimatedPomodoros > 5\`
  - Explains: "This task is too big. We'll split it into 2 tasks."
  - Preview of the two resulting tasks with names and estimates
  - Confirm / Cancel buttons
- [ ] **7.3** Create \`src/components/tasks/TaskForm.tsx\`:
  - TanStack Form
  - Fields: name (required), project (select, optional), estimatedPomodoros (number input 1–10)
  - On submit: if \`estimatedPomodoros > 5\` → show \`TaskSplitDialog\`
  - If user confirms split → create 2 tasks via \`splitTask()\`
  - If user cancels split → create 1 task as-is
- [ ] **7.4** Create \`src/components/tasks/TaskList.tsx\`:
  - Accepts optional \`projectId\` filter prop
  - Groups by status: In Progress → Pending → Completed
  - Uses TanStack Table for filtering/sorting (optional for MVP, basic list is fine)
- [ ] **7.5** Implement \`src/routes/tasks/index.tsx\`:
  - All tasks across projects
  - Filter by project (select dropdown)
  - "New Task" button

**Commit**: \`feat: tasks UI with split dialog\`

---

## Phase 8 — Optional Auth

- [ ] **8.1** Create \`src/lib/supabase.ts\` — lazy Supabase client (only init if env vars present)
- [ ] **8.2** Create Supabase tables (migration SQL) mirroring TypeScript types
- [ ] **8.3** Add RLS policies: \`user_id = auth.uid()\` on all tables
- [ ] **8.4** Create sign-in UI (email magic link or Google OAuth)
- [ ] **8.5** On sign-in: sync local IndexedDB data up to Supabase
- [ ] **8.6** Implement \`src/db/sync.ts\` dual-write logic
- [ ] **8.7** Add user avatar / sign-out in nav bar when logged in

**Commit**: \`feat: optional Supabase auth and sync\`

---

## Phase 9 — PWA & Polish

- [ ] **9.1** Add service worker with Workbox (via \`vite-plugin-pwa\`)
  \`\`\`bash
  pnpm add -D vite-plugin-pwa
  \`\`\`
- [ ] **9.2** Configure asset caching (app shell)
- [ ] **9.3** Add install prompt for mobile (PWA \`beforeinstallprompt\`)
- [ ] **9.4** Generate app icons (192px and 512px) based on Stitch design
- [ ] **9.5** Test on Chrome mobile (device emulation minimum)
- [ ] **9.6** Verify all routes work with direct navigation (no 404 on refresh)
- [ ] **9.7** Add loading skeletons to all async components
- [ ] **9.8** Add error boundary with friendly fallback UI

**Commit**: \`feat: PWA manifest, service worker, polish\`

---

## Phase 10 — Deploy

- [ ] **10.1** Set up Vercel project (or Netlify)
- [ ] **10.2** Add env vars in Vercel dashboard (Supabase keys)
- [ ] **10.3** Configure SPA fallback (\`/* → index.html\`)
- [ ] **10.4** Deploy and smoke test production build
- [ ] **10.5** Update \`README.md\` with live URL

**Commit**: \`chore: deploy to Vercel\`

---

## 📊 Progress Summary

| Phase | Description | Status |
|---|---|---|
| 0 | Project Setup | ⬜ |
| 1 | Database Layer | ⬜ |
| 2 | Timer Store | ⬜ |
| 3 | Query Hooks | ⬜ |
| 4 | Routing & Layout | ⬜ |
| 5 | Timer UI | ⬜ |
| 6 | Projects UI | ⬜ |
| 7 | Tasks UI | ⬜ |
| 8 | Auth (optional) | ⬜ |
| 9 | PWA & Polish | ⬜ |
| 10 | Deploy | ⬜ |

Update status: ⬜ Not started → 🟡 In progress → ✅ Done
