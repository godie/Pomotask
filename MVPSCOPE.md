# 🎯 MVP Scope — PomodoroFlow

> This document defines the exact scope of the Minimum Viable Product.
> Agents: implement ONLY what is listed here. Everything else goes in a future phase.

---

## 🧭 MVP Goal

Allow a user to manage projects and tasks measured in Pomodoros, run a Pomodoro timer tied to a task, and see estimated vs real Pomodoros — all without requiring an account.

---

## ✅ MVP Features

### 1. Pomodoro Timer
- [ ] 25-minute focus countdown
- [ ] 5-minute short break after each Pomodoro
- [ ] 15-minute long break after every 4 Pomodoros
- [ ] Start / Pause / Skip / Reset controls
- [ ] Audio notification when session ends (simple beep or browser notification)
- [ ] Timer persists if user navigates between pages (global state)
- [ ] Active task shown on timer screen

### 2. Projects
- [ ] Create a project (name, color, optional description)
- [ ] List all projects
- [ ] View project detail: name, task list, Pomodoro stats
- [ ] Edit project name/color
- [ ] Delete project (soft delete or with confirmation)
- [ ] Project stats: total estimated Pomodoros vs total real Pomodoros

### 3. Tasks
- [ ] Create a task (name, project, estimated Pomodoros)
- [ ] Estimated Pomodoros: integer 1–10 (UI warns if > 5, prompts split)
- [ ] **Auto-split rule**: if estimated > 5, show dialog to split into 2 tasks automatically
- [ ] List tasks (all, or filtered by project)
- [ ] Mark task as complete
- [ ] Delete task
- [ ] Track real Pomodoros (incremented automatically each time a Pomodoro finishes while task is active)
- [ ] Task states: \`pending\`, \`in_progress\`, \`completed\`

### 4. Timer ↔ Task Link
- [ ] Select active task before or during a session
- [ ] When a Pomodoro session completes, increment \`real_pomodoros\` on the active task by 1
- [ ] Show active task name on timer

### 5. Estimation Display
- [ ] Per task: \`estimated_pomodoros\` vs \`real_pomodoros\` (e.g. "3/5 🍅")
- [ ] Per project: sum of estimated vs sum of real across all tasks

### 6. Persistence (Offline-first)
- [ ] All data stored in IndexedDB via Dexie.js
- [ ] No account required
- [ ] Data survives page refresh

### 7. Optional Auth (Progressive Enhancement)
- [ ] "Sign in" option in nav
- [ ] If signed in, sync IndexedDB data to Supabase
- [ ] If not signed in, all features still work fully offline

### 8. Responsive / Mobile
- [ ] App works on mobile viewport (375px+)
- [ ] Timer and task selection usable on touch screens
- [ ] PWA manifest + service worker so it's installable

---

## ❌ Out of MVP Scope

These are explicitly deferred to future phases:

- Team collaboration / shared projects
- Recurring tasks
- Calendar integration
- Analytics dashboard / charts
- Notifications via push (only in-browser for MVP)
- Tags / labels on tasks
- Drag-and-drop task reordering
- Time tracking beyond Pomodoro count
- Dark/light mode toggle (implement only one theme for MVP)
- Subtasks (split is the mechanism instead)
- Comments on tasks
- Import/export

---

## 📐 Key Business Rules

| Rule | Detail |
|---|---|
| Pomodoro duration | 25 minutes (not configurable in MVP) |
| Short break | 5 minutes |
| Long break | 15 minutes, after every 4 Pomodoros |
| Max task estimate | 10 Pomodoros in the form |
| Split threshold | If estimated > 5 → prompt split into 2 tasks |
| Split logic | Divide original estimate evenly (e.g. 8 → two tasks of 4) |
| Real Pomodoros | Auto-incremented, not manually editable |

---

## 🖼️ MVP Screens

1. **Home / Timer** — Active timer + active task selector
2. **Projects List** — All projects with Pomodoro summary
3. **Project Detail** — Task list for a project + project stats
4. **Tasks List** — All tasks across projects
5. **Task Form** (modal or page) — Create/edit task
6. **Project Form** (modal) — Create/edit project
7. **Break Screen** — Overlay or page shown during break time

---

## 🏁 MVP Definition of Done

- [ ] All features above implemented and working
- [ ] Works offline (no network required)
- [ ] Works on Chrome desktop and Chrome mobile
- [ ] No crashes on core user flows
- [ ] Data persists across page refresh
- [ ] Deployed to Vercel (or equivalent)
