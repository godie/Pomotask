# 🗺️ Roadmap — Pomotask

> Working phase by phase. Each task follows **🔴RED → 🟢GREEN → ♻️REFACTOR**.

---

## Phase 1 — Database Layer (IndexedDB) ✅

- [x] **1.1** Create `src/db/schema.ts`
- [x] **1.2** 🔴🟢♻️ `src/db/projects.ts`
- [x] **1.3** 🔴🟢♻️ `src/db/tasks.ts`
- [x] **1.4** 🔴🟢♻️ `src/db/sessions.ts`
- [x] **1.5** 🔴🟢♻️ `src/lib/pomodoro.ts`

**Commit**: `feat: IndexedDB schema and data layer (TDD)`

---

## Phase 2 — Timer Store ✅

- [x] **2.1** 🔴 Run `pnpm test:run` — RED
- [x] **2.2** 🟢 Create `src/stores/timerStore.ts` with Zustand
- [x] **2.3** 🔴🟢 Add test: `'decrements secondsLeft on tick'`
- [x] **2.4** 🔴🟢 Add test: `'calls incrementRealPomodoros on active task when focus completes'`
- [x] **2.5** 🔴🟢 Add test: `'creates a PomodoroSession record on focus complete'`
- [x] **2.6** 🔴🟢 Add test: `'interval runs tick every second when running'`
- [x] **2.7** ♻️ Refactor store, run all tests → GREEN

**Commit**: `feat: Zustand timer store with state machine (TDD)`

---

## Phase 3 — TanStack Query Hooks ✅

- [x] **3.1** Create `src/lib/queryKeys.ts`
- [x] **3.2** 🔴🟢♻️ `src/hooks/useProjects.ts`
- [x] **3.3** 🔴🟢♻️ `src/hooks/useTasks.ts`
- [x] **3.4** Set up `QueryClient` in `src/main.tsx`

**Commit**: `feat: TanStack Query hooks for projects and tasks (TDD)`

---

## Phase 4 — Routing & Layout ✅

- [x] **4.1** 🔴🟢 `src/routes/__root.tsx` — root layout
- [x] **4.2** Create placeholder route files
- [x] **4.3** 🔴🟢 Test: `'navigating to /projects renders ProjectsList'`
- [x] **4.4** 🔴🟢 Test: `'navigating to unknown route renders 404'`
- [x] **4.5** Add `<RouterProvider>` in `src/App.tsx`

**Commit**: `feat: routing and root layout shell (TDD)`

---

## Phase 5 — Timer UI ✅

- [x] **5.1** 🔴🟢♻️ `TimerRing.tsx`
- [x] **5.2** 🔴🟢♻️ `TimerControls.tsx`
- [x] **5.5** Wire `src/routes/index.tsx`
- [x] **5.7** Audio beep on session end

**Commit**: `feat: Pomodoro timer UI and controls (TDD)`

---

## Phase 6 — Projects UI ✅

- [x] **6.1** 🔴🟢♻️ `ProjectCard.tsx`
- [x] **6.2** 🔴🟢♻️ `ProjectForm.tsx`
- [x] **6.4** 🔴🟢 Projects list page

**Commit**: `feat: projects list and detail UI (TDD)`

---

## Phase 7 — Tasks UI ✅

- [x] **7.1** 🔴🟢♻️ `TaskCard.tsx`
- [x] **7.2** 🔴🟢♻️ `TaskSplitDialog.tsx`
- [x] **7.3** 🔴🟢♻️ `TaskForm.tsx`
- [x] **7.4** 🔴🟢♻️ `TaskList.tsx`
- [x] **7.5** 🔴🟢 Tasks list page

**Commit**: `feat: tasks UI with split dialog (TDD)`

---

## Phase 8 — Optional Auth ✅

- [x] **8.1** Create `src/lib/supabase.ts`
- [x] **8.4** Create sign-in UI (placeholder)
- [x] **8.6** Implement `src/db/sync.ts` logic

**Commit**: `feat: optional Supabase auth and sync`

---

## Phase 9 — PWA & Polish ✅

- [x] **9.1** Add service worker with `vite-plugin-pwa`
- [x] **9.7** Add loading skeletons to all async components
- [x] **9.8** Add error boundary with friendly fallback UI

---

## 📊 Progress Summary

| Phase | Description      | Status |
| ----- | ---------------- | ------ |
| 1     | Database Layer   | ✅     |
| 2     | Timer Store      | ✅     |
| 3     | Query Hooks      | ✅     |
| 4     | Routing & Layout | ✅     |
| 5     | Timer UI         | ✅     |
| 6     | Projects UI      | ✅     |
| 7     | Tasks UI         | ✅     |
| 8     | Auth (optional)  | ✅     |
| 9     | PWA & Polish     | ✅     |

