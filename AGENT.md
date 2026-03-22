# 🤖 AGENT.md — Instructions for AI Agents

> Read this file FIRST before doing anything else in this repo.

---

## What is this project?

**Pomotask** — A todo list app where everything is measured in Pomodoros.
Users manage projects and tasks, run a Pomodoro timer, and track estimated vs real Pomodoros per task and project.

---

## Your workflow

1. **Read docs in order**:
   - `README.md` — project overview and stack
   - `docs/MVP_SCOPE.md` — what to build (and what NOT to build)
   - `docs/SPECS.md` — technical decisions, types, architecture
   - `docs/ROADMAP.md` — your task list, phase by phase

2. **Design tokens**: Before writing ANY component, connect to Stitch MCP:
   - URL: `https://stitch.withgoogle.com/projects/6328229122179225454`
   - Get: colors, typography, spacing, component designs
   - Apply them via Tailwind CSS variables

3. **Work phase by phase** in `ROADMAP.md`. Mark tasks `[x]` as you complete them.

4. **Every task follows TDD — Red → Green → Refactor** (see section below).

5. **Commit after each phase** using conventional commits.

6. **Never skip phases** — each phase depends on the previous one.

---

## 🔴🟢♻️ TDD Workflow — MANDATORY

**You must never write implementation code before writing a failing test.**
This is non-negotiable. Every piece of logic, every function, every hook, every component follows this exact cycle:

### The cycle for EVERY task

```
🔴 RED     → Write the test first. Run it. It MUST fail.
              If it passes without implementation → the test is wrong. Fix it.

🟢 GREEN   → Write the minimum code to make the test pass.
              No extra logic. No polish. Just enough to go green.

♻️ REFACTOR → Clean up the code. Improve names, extract helpers, remove duplication.
              Run tests again. They must still be green after refactoring.
```

### TDD rules you must follow

- **One test at a time.** Write one test → make it pass → write the next.
- **Tests live in `src/tests/`** mirroring the source structure:
  - `src/lib/pomodoro.ts` → `src/tests/lib/pomodoro.test.ts`
  - `src/db/tasks.ts` → `src/tests/db/tasks.test.ts`
  - `src/stores/timerStore.ts` → `src/tests/stores/timerStore.test.ts`
  - `src/components/timer/TimerRing.tsx` → `src/tests/components/timer/TimerRing.test.tsx`
- **Run tests after every change**: `pnpm test:run`
- **Never commit red tests.** All tests must be green before committing.
- **Test names must describe behavior**, not implementation:
  - ✅ `'increments real pomodoros when focus session completes'`
  - ❌ `'calls incrementRealPomodoros function'`

### What to test per layer

| Layer                       | What to test                                                          |
| --------------------------- | --------------------------------------------------------------------- |
| `src/lib/` (business logic) | All functions, all edge cases, all business rules                     |
| `src/db/` (data layer)      | CRUD operations (mock Dexie — already set up in `src/tests/setup.ts`) |
| `src/stores/` (Zustand)     | State transitions, actions, side effects                              |
| `src/hooks/` (Query hooks)  | Hook behavior with mocked query client                                |
| `src/components/` (UI)      | Render output, user interactions, conditional display                 |

### Minimum test coverage per task

Before marking any ROADMAP task `[x]`, it must have:

- At least **one test per exported function or component**
- Tests covering the **happy path** and at least **one edge case or error case**
- `pnpm test:run` passing with **no failures**

### Example TDD cycle — `shouldSplitTask`

```typescript
// 🔴 Step 1 — Write test FIRST (file doesn't exist yet)
it("returns true when estimate is greater than 5", () => {
  expect(shouldSplitTask(6)).toBe(true); // ← FAILS (no implementation)
});

// Run: pnpm test:run → RED ✓

// 🟢 Step 2 — Write minimum implementation
export function shouldSplitTask(n: number): boolean {
  return n > 5;
}

// Run: pnpm test:run → GREEN ✓

// ♻️ Step 3 — Refactor if needed, run tests again → still GREEN ✓
```

### TDD for UI components

For React components, test behavior not markup:

```typescript
// 🔴 Write test first
it('shows break overlay when timer is in break mode', () => {
  render(<BreakOverlay mode="short_break" secondsLeft={300} />)
  expect(screen.getByText(/short break/i)).toBeInTheDocument()
})

// 🟢 Then create BreakOverlay.tsx with minimum JSX to pass
// ♻️ Then refactor styles, extract subcomponents, etc.
```

---

## Key rules

- **TDD is mandatory** — test first, always, no exceptions
- Do not add features not listed in `MVP_SCOPE.md`
- Do not use any library not listed in `SPECS.md` without noting it
- All data must persist in IndexedDB (Dexie) — this is offline-first
- Auth is optional — the app must work 100% without it
- TypeScript strict mode — no `any`
- Mobile-first responsive design
- Never commit failing tests

---

## Stack quick reference

```
React 18 + Vite + TypeScript (strict)
TanStack Router — routing
TanStack Query — async state
TanStack Form — forms
Dexie.js — IndexedDB
Zustand — timer global state
Tailwind CSS v4 + shadcn/ui
Supabase — optional auth + sync
pnpm — package manager
```

---

## Where things live

| What           | Where                      |
| -------------- | -------------------------- |
| Types          | `src/types/index.ts`       |
| DB operations  | `src/db/`                  |
| Timer logic    | `src/stores/timerStore.ts` |
| Business rules | `src/lib/pomodoro.ts`      |
| Query hooks    | `src/hooks/`               |
| Routes/Pages   | `src/routes/`              |
| Components     | `src/components/`          |

---

## Business rules to never break

- A Pomodoro = 25 min focus
- After 4 Pomodoros → long break (15 min), else short break (5 min)
- If task estimate > 5 Pomodoros → must offer to split into 2 tasks
- Split divides estimate evenly (`Math.ceil` for part 1)
- `realPomodoros` is auto-incremented only — never manually editable by user
- Tasks can belong to a project or be standalone (no project)
