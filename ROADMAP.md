# 🗺️ Roadmap & Agent Tasks — Pomotask

> This file is the source of truth for the AI agent implementing the project.
> Work tasks IN ORDER. Mark each task as `[x]` when complete before moving on to the next.
> Read `SPECS.md` and `MVP_SCOPE.md` before starting. Connect to Stitch MCP for design tokens before any UI work.

---

## 🤖 Agent Instructions

1. **Read first**: `README.md` → `AGENT.md` → `docs/SPECS.md` → `docs/MVP_SCOPE.md`
2. **Design tokens**: Before writing any component, connect to Stitch MCP at `https://stitch.withgoogle.com/projects/6328229122179225454` to get colors, fonts, spacing, and component specs.
3. **One task at a time**: Complete and verify each task before moving to the next.
4. **TDD is mandatory**: See `AGENT.md` for the full Red → Green → Refactor workflow. **Every task** follows this cycle. No implementation code without a failing test first.
5. **Commits**: Commit after each completed phase with a conventional commit message. Never commit failing tests.

### Per-task checklist (repeat for EVERY task)

```
[ ] 1. 🔴 Write test(s) — run pnpm test:run — confirm RED
[ ] 2. 🟢 Write minimum implementation — run pnpm test:run — confirm GREEN
[ ] 3. ♻️  Refactor — run pnpm test:run — confirm still GREEN
[ ] 4. Mark task [x] in this file
```

---

## Phase 0 — Project Setup

- [x] **0.1** Scaffold Vite + React + TypeScript project with pnpm
  ```bash
  pnpm create vite pomo-task --template react-ts
  cd pomo-task
  ```
- [x] **0.2** Install all Dependencies:
  ```bash
  pnpm add @tanstack/react-router @tanstack/react-query @tanstack/react-form @tanstack/react-table
  pnpm add dexie zustand
  pnpm add convex
  pnpm add lucide-react
  pnpm add -D tailwindcss @tailwindcss/vite
  pnpm dlx shadcn@latest init
  ```
- [x] **0.3** Configure TanStack Router (file-based routing with Vite plugin)
- [x] **0.4** Configure path alias `@/` → `src/` in `vite.config.ts` and `tsconfig.json`
- [x] **0.5** Set up Tailwind CSS v4 with Vite plugin
- [x] **0.6** Create folder structure as defined in `SPECS.md`
- [x] **0.7** Create `src/types/index.ts` with all TypeScript types from SPECS
- [x] **0.8** Create `.env.example` with Convex vars
- [x] **0.9** Create `README.md` (already exists — copy to project root)
- [x] **0.10** Add PWA manifest (`public/manifest.json`) and placeholder icons

**Commit**: `chore: project setup and dependencies`

---

## Phase 1 — Database Layer (IndexedDB)

> 🔴🟢♻️ TDD: Write tests in `src/tests/db/` BEFORE implementing each file.

- [x] **1.1** Create `src/db/schema.ts` with Dexie class as defined in SPECS
  - No test needed for schema — it's pure config. Verify by importing in step 1.2.

- [x] **1.2** 🔴🟢♻️ `src/db/projects.ts`
  - 🔴 Write `src/tests/db/projects.test.ts` first — test all functions below (mock `db` from schema)
  - 🟢 Implement: `getAllProjects`, `getProjectById`, `createProject`, `updateProject`, `deleteProject`
  - ♻️ Ensure each function sets `createdAt`/`updatedAt` timestamps and generates `id` via `crypto.randomUUID()`

- [x] **1.3** 🔴🟢♻️ `src/db/tasks.ts`
  - 🔴 Write `src/tests/db/tasks.test.ts` first — cover all functions + edge cases for `incrementRealPomodoros`
  - 🟢 Implement: `getAllTasks`, `getTasksByProject`, `getTaskById`, `createTask`, `updateTask`, `deleteTask`, `incrementRealPomodoros`
  - ♻️ `incrementRealPomodoros` must be atomic (read → increment → write)

- [x] **1.4** 🔴🟢♻️ `src/db/sessions.ts`
  - 🔴 Write `src/tests/db/sessions.test.ts` first — test `getTodaySessions` filters by current day
  - 🟢 Implement: `createSession`, `getSessionsByTask`, `getTodaySessions`
  - ♻️ `getTodaySessions` uses `startedAt` timestamp (start of day → now)

- [x] **1.5** 🔴🟢♻️ `src/lib/pomodoro.ts`
  - 🔴 Tests already exist in `src/tests/pomodoro.test.ts` — run them: `pnpm test:run` → must be RED
  - 🟢 Implement `shouldSplitTask()` and `splitTask()` and timer constants until all tests are GREEN
  - ♻️ Refactor, run again

**Commit**: `feat: IndexedDB schema and data layer (TDD)`

---

## Phase 2 — Timer Store

> 🔴🟢♻️ TDD: Tests already scaffolded in `src/tests/timerStore.test.ts`. Run them first — they must be RED.

- [x] **2.1** 🔴 Run `pnpm test:run` — `timerStore.test.ts` must fail (RED)
- [x] **2.2** 🟢 Create `src/stores/timerStore.ts` with Zustand store:
  - Export `useTimerStore` (full interface from SPECS)
  - Implement `start`, `pause`, `resume`, `skip`, `reset`, `setActiveTask`
  - Make tests GREEN one by one
- [x] **2.3** 🔴🟢 Add test: `'decrements secondsLeft on tick'` → implement `tick()`
- [x] **2.4** 🔴🟢 Add test: `'calls incrementRealPomodoros on active task when focus completes'` → implement `onSessionComplete()` side effect
- [x] **2.5** 🔴🟢 Add test: `'creates a PomodoroSession record on focus complete'` → wire DB call
- [x] **2.6** 🔴🟢 Add test: `'interval runs tick every second when running'` → implement `setInterval` (use `vi.useFakeTimers()`)
- [x] **2.7** ♻️ Refactor store, run all tests → GREEN
- [x] **2.8** Create `src/hooks/useTimer.ts` — thin hook wrapping timerStore (no new tests needed, covered by store tests)

**Commit**: `feat: Zustand timer store with state machine (TDD)`

---

## Phase 3 — TanStack Query Hooks

> 🔴🟢♻️ TDD: Write hook tests using `renderHook` + a mock `QueryClient`. Mock all DB functions.

- [x] **3.1** Create `src/lib/queryKeys.ts` (no tests — pure constants)

- [x] **3.2** 🔴🟢♻️ `src/hooks/useProjects.ts`
  - 🔴 Write `src/tests/hooks/useProjects.test.tsx`:
    - `'useProjects returns all projects'`
    - `'useCreateProject calls createProject and invalidates cache'`
    - `'useDeleteProject removes project from cache optimistically'`
    - `'useProject(id) fetches single project'`
  - 🟢 Implement hooks until GREEN
  - ♻️ Refactor

- [x] **3.3** 🔴🟢♻️ `src/hooks/useTasks.ts`
  - 🔴 Write `src/tests/hooks/useTasks.test.tsx`:
    - `'useTasksByProject filters tasks by projectId'`
    - `'useCreateTask triggers split dialog when estimate > 5'`
    - `'useCreateTask creates single task when estimate <= 5'`
    - `'useTask(id) fetches single task'`
  - 🟢 Implement hooks until GREEN
  - ♻️ Refactor

- [x] **3.4** Set up `QueryClient` in `src/main.tsx` with `staleTime: 1000 * 60`

**Commit**: `feat: TanStack Query hooks for projects and tasks (TDD)`

---

## Phase 4 — Routing & Layout

> 🔴🟢♻️ TDD: Test that routes render without crashing and show correct nav state.

- [x] **4.1** 🔴🟢 `src/routes/__root.tsx` — root layout
  - 🔴 `'renders nav with Timer, Projects, Tasks links'`
  - 🔴 `'renders mini-timer bar when timer is running'`
  - 🟢 Implement layout
- [x] **4.2** Create placeholder route files (index, projects, tasks) — no logic yet, just renders heading
- [x] **4.3** 🔴🟢 Test: `'navigating to /projects renders ProjectsList'`
- [x] **4.4** 🔴🟢 Test: `'navigating to unknown route renders 404'`
- [x] **4.5** Add `<RouterProvider>` in `src/App.tsx`

> ⚠️ Connect to Stitch MCP before implementing layout — get exact nav design, colors, spacing.

**Commit**: `feat: routing and root layout shell (TDD)`

---

## Phase 5 — Timer UI

> ⚠️ Fetch Stitch MCP design for timer screen before coding any component.
> 🔴🟢♻️ TDD: Test behavior and render output, not CSS classes.

- [x] **5.1** 🔴🟢♻️ `TimerRing.tsx`
  - 🔴 `'renders MM:SS format correctly'` / `'applies focus color in focus mode'` / `'applies break color in break mode'` / `'renders with correct strokeDashoffset'`
  - 🟢 SVG circular progress ring
  - ♻️ Animate with CSS

- [x] **5.2** 🔴🟢♻️ `TimerControls.tsx`
  - 🔴 `'shows Start when idle'` / `'shows Pause when running'` / `'shows Resume when paused'` / `'calls start() on click'`
  - 🟢 Implement controls wired to timerStore

- [x] **5.3** 🔴🟢♻️ `BreakOverlay.tsx`
  - 🔴 `'shows short break label when mode is short_break'` / `'shows long break label when mode is long_break'` / `'shows countdown'` / `'skip button calls skip()'`
  - 🟢 Implement overlay

- [x] **5.4** 🔴🟢♻️ Active task selector
  - 🔴 `'shows list of pending tasks'` / `'selecting task calls setActiveTask'` / `'shows active task name when set'`
  - 🟢 Implement `TaskSelector.tsx` (extracted from index.tsx)

- [x] **5.5** Wire `src/routes/index.tsx` — compose all timer components
- [x] **5.6** Browser notification on session end (test: `'requests notification permission on first start'`)
- [x] **5.7** Audio beep on session end (mocked in setup.ts — test: `'plays sound on session complete'`)

**Commit**: `feat: Pomodoro timer UI and controls (TDD)`

---

## Phase 6 — Projects UI

> ⚠️ Fetch Stitch MCP design for projects screens before coding.
> 🔴🟢♻️ TDD: use `@testing-library/react` + `userEvent` for all interactions.

- [x] **6.1** 🔴🟢♻️ `ProjectCard.tsx`
  - 🔴 `'renders project name'` / `'renders pomodoro stats est vs real'` / `'delete button calls onDelete'` / `'renders actual task count'`
  - 🟢 Implement card with `taskCount` prop

- [x] **6.2** 🔴🟢♻️ `ProjectForm.tsx`
  - 🔴 `'submit is disabled when name is empty'` / `'calls onSubmit with form values'` / `'shows validation error on empty name'` / `'validates name max length (60 chars)'`
  - 🟢 Implement TanStack Form with Zod validation

- [x] **6.3** 🔴🟢♻️ `ProjectStats.tsx`
  - 🔴 `'shows estimated and real pomodoro counts'` / `'shows 0/0 when no tasks'`
  - 🟢 Implement stats

- [x] **6.4** 🔴🟢 Projects list page — `'shows empty state when no projects'` / `'renders project cards'`
- [x] **6.5** 🔴🟢 Project detail page — `'shows project tasks'` / `'shows project stats'`

**Commit**: `feat: projects list and detail UI (TDD)`

---

## Phase 7 — Tasks UI

> ⚠️ Fetch Stitch MCP design for task screens before coding.
> 🔴🟢♻️ TDD: split dialog flow is critical — test every branch.

- [x] **7.1** 🔴🟢♻️ `TaskCard.tsx`
  - 🔴 `'renders task name and pomodoro count'` / `'shows status badge'` / `'Start button calls setActiveTask'` / `'complete button marks task done'`
  - 🟢 Implement

- [x] **7.2** 🔴🟢♻️ `TaskSplitDialog.tsx`
  - 🔴 `'shows preview of both split tasks'` / `'confirm creates 2 tasks'` / `'cancel creates original single task'` / `'split names append Part 1 and Part 2'`
  - 🟢 Implement dialog (this is the most critical UI flow — cover all branches)

- [x] **7.3** 🔴🟢♻️ `TaskForm.tsx`
  - 🔴 `'shows split dialog when estimate > 5 on submit'` / `'does not show split dialog when estimate <= 5'` / `'project field is optional'` / `'validates name max length (60 chars)'`
  - 🟢 Implement TanStack Form with split trigger and Zod validation

- [x] **7.4** 🔴🟢♻️ `TaskList.tsx`
  - 🔴 `'groups tasks by status: in_progress first, then pending, then completed'` / `'filters by projectId when prop provided'`
  - 🟢 Implement

- [x] **7.5** 🔴🟢 Tasks list page — `'shows all tasks'` / `'filters by selected project'`

**Commit**: `feat: tasks UI with split dialog (TDD)`

---

## Phase 8 — Cloud Sync (Convex)

- [x] **8.1** Create `src/lib/convex.ts` — Convex client initialization
- [x] **8.2** Create Convex schema (`convex/schema.ts`) with auth tables
- [ ] **8.3** Implement Convex mutations and queries for projects and tasks (backend sync)
- [ ] **8.4** Implement Convex Auth (see `docs/convex-auth-tareas.md`)
- [ ] **8.5** Implement sync logic between IndexedDB and Convex
- [ ] **8.6** Implement Convex watchdog and crons
- [ ] **8.7** Integrate ConvexProvider in frontend

**Commit**: `feat: Convex backend integration`

---

## Phase 9 — PWA & Polish

- [x] **9.1** Add service worker with Workbox (via `vite-plugin-pwa`)
  ```bash
  pnpm add -D vite-plugin-pwa
  ```
- [x] **9.2** Configure asset caching (app shell)
- [x] **9.3** Add install prompt for mobile (PWA `beforeinstallprompt`)
- [x] **9.4** Generate app icons (192px and 512px) based on Stitch design
- [x] **9.5** Test on Chrome mobile (device emulation minimum)
- [x] **9.6** Verify all routes work with direct navigation (no 404 on refresh)
- [x] **9.7** Add loading skeletons to all async components
- [x] **9.8** Add error boundary with friendly fallback UI

**Commit**: `feat: PWA manifest, service worker, polish`

---

## Phase 10 — Deploy

- [x] **10.1** Connect repo to Cloudflare Pages (or keep GitHub Actions deploy from `.github/workflows/ci.yml`)
- [x] **10.2** Add env vars in Cloudflare: `VITE_CONVEX_URL`, `CONVEX_DEPLOY_KEY`
- [x] **10.3** Configure SPA fallback (`/* → index.html`)
- [x] **10.4** Deploy and smoke test production build
- [x] **10.5** Update `README.md` with live URL

**Commit**: `chore: deploy to cloudflare pages`

---

## 🔧 Bug Fixes & Improvements

### Fixed (2026-03-31)

- **ProjectCard navigation**: Added `Link` to navigate to project detail page (was broken)
- **ProjectForm edit mode**: Wired up edit functionality via `useUpdateProject` hook
- **TaskForm dialog closing**: Fixed async handling when creating tasks with <= 5 pomodoros
- **TaskStatus type**: Added `'divided'` status to `src/types/index.ts` for split tasks
- **Home.test.tsx**: Added mocks for `useCreateTask`, `useUpdateTask`, `useSplitTask`, `useProjects`

---

## 📊 Progress Summary

| Phase | Description                                         | Status |
| ----- | --------------------------------------------------- | ------ |
| 0     | Project Setup                                       | ✅     |
| 1     | Database Layer                                      | ✅     |
| 2     | Timer Store                                         | ✅     |
| 3     | Query Hooks                                         | ✅     |
| 4     | Routing & Layout                                    | ✅     |
| 5     | Timer UI                                            | ✅     |
| 6     | Projects UI                                         | ✅     |
| 7     | Tasks UI                                            | ✅     |
| 8     | Cloud Sync (Convex)                                 | 🟡     |
| 9     | PWA & Polish                                        | ✅     |
| 10    | Deploy (Cloudflare Pages; see `docs/CICD_SETUP.md`) | ✅     |

Update status: ⬜ Not started → 🟡 In progress → ✅ Done
