# 🍅 PomodoroFlow

> A task management app where everything is measured in Pomodoros.

PomodoroFlow combines a focused Pomodoro timer with project and task management. Estimate your tasks in Pomodoros, track focus sessions, compare estimated vs real Pomodoros, and stay productive with enforced break times.

---

## ✨ Features

- **Pomodoro Timer** — 25 min focus / 5 min short break / 15 min long break
- **Projects** — Group tasks under projects, see project-level Pomodoro stats
- **Tasks** — Create tasks with Pomodoro estimates; auto-split if > 5 Pomodoros
- **Estimation tracking** — See estimated vs real Pomodoros per task and project
- **Offline-first** — Works without an account using IndexedDB
- **Optional Auth** — Sign up to sync across devices
- **Mobile-ready** — Responsive PWA, installable on iOS/Android

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Routing | TanStack Router |
| Server State | TanStack Query |
| Local DB | IndexedDB via Dexie.js |
| Auth (optional) | Supabase Auth |
| Remote DB (optional) | Supabase (PostgreSQL) |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui |
| Forms | TanStack Form |
| Tables | TanStack Table |
| Build | Vite |
| Package manager | pnpm |

---

## 🚀 Getting Started

\`\`\`bash
# Clone the repo
git clone https://github.com/your-org/pomodoro-flow.git
cd pomodoro-flow

# Install dependencies
pnpm install

# Start dev server
pnpm dev
\`\`\`

### Environment variables (optional — for auth + sync)

\`\`\`env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

If these are not set, the app runs fully offline with IndexedDB.

---

## 📁 Project Structure

\`\`\`
src/
├── routes/              # TanStack Router file-based routes
│   ├── index.tsx        # Dashboard / active timer
│   ├── projects/        # Projects list + detail
│   └── tasks/           # Task list + detail
├── components/
│   ├── timer/           # PomodoroTimer, TimerControls, BreakOverlay
│   ├── tasks/           # TaskCard, TaskForm, TaskSplitDialog
│   ├── projects/        # ProjectCard, ProjectForm, ProjectStats
│   └── ui/              # shadcn/ui components
├── hooks/
│   ├── useTimer.ts      # Timer logic & state machine
│   ├── useTasks.ts      # TanStack Query hooks for tasks
│   └── useProjects.ts   # TanStack Query hooks for projects
├── db/
│   ├── schema.ts        # Dexie schema (IndexedDB)
│   └── sync.ts          # Supabase sync when auth present
├── stores/
│   └── timerStore.ts    # Zustand store for active timer state
└── lib/
    ├── pomodoro.ts      # Pomodoro business logic & calculations
    └── supabase.ts      # Supabase client init
\`\`\`

---

## 🎨 Design

UI/UX designed in [Google Stitch](https://stitch.withgoogle.com/projects/6328229122179225454).

> Agents: connect via Stitch MCP to access full design specs, colors, components, and assets.

---

## 📖 Documentation

- [MVP Scope](./MVPSCOPE.md)
- [Technical Specs](./SPECS.md)
- [Roadmap & Tasks](./ROADMAP.md)

---

## 📄 License

MIT
