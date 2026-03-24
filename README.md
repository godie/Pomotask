# 🍅 Pomotask

> A task management app where everything is measured in Pomodoros.

Pomotask combines a focused Pomodoro timer with project and task management. Estimate your tasks in Pomodoros, track focus sessions, compare estimated vs real Pomodoros, and stay productive with enforced break times.

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

| Layer                | Technology               |
| -------------------- | ------------------------ |
| Framework            | React 18                 |
| Routing              | TanStack Router          |
| Server State         | TanStack Query           |
| Client State         | Zustand                  |
| Local DB             | IndexedDB via Dexie.js   |
| Auth (optional)      | Supabase Auth            |
| Remote DB (optional) | Supabase (PostgreSQL)    |
| Styling              | Tailwind CSS v4          |
| UI Components        | shadcn/ui                |
| Forms                | TanStack Form            |
| Tables               | TanStack Table           |
| Build                | Vite                     |
| Tests                | Vitest + Testing Library |
| Package manager      | pnpm                     |

---

## 🚀 Getting Started

```bash
# https://github.com/godie/Pomotask
git clone https://github.com/godie/Pomotask.git
cd Pomotask

# Install dependencies
pnpm install

# Dev server
pnpm dev
```

### Quality checks

```bash
pnpm typecheck   # TypeScript
pnpm lint        # ESLint
pnpm test:run    # Vitest + coverage
pnpm build       # Production bundle
```

### Environment variables (optional — for auth + sync)

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

If these are not set, the app runs fully offline with IndexedDB.

---

## 📁 Project Structure (current)

```
src/
├── App.tsx
├── main.tsx
├── index.css
├── db/                 # Dexie — projects, tasks, sessions
├── hooks/              # Custom hooks (useTimer)
├── lib/                # pomodoro helpers, supabase client, utils
├── stores/             # timerStore (Zustand)
├── tests/              # Vitest setup + unit tests
└── types/              # Shared TypeScript types
```

TanStack Router file routes (`src/routes/`), UI components, and query hooks are added per [ROADMAP.md](./ROADMAP.md).

---

## 🎨 Design

UI/UX designed in [Google Stitch](https://stitch.withgoogle.com/projects/6328229122179225454).

> Agents: connect via Stitch MCP to access full design specs, colors, components, and assets.

---

## 📖 Documentation

- [MVP Scope](./MVPSCOPE.md)
- [Technical Specs](./SPECS.md)
- [Roadmap & Tasks](./ROADMAP.md)
- [CI/CD & pre-commit](./docs/CICD_SETUP.md)

---

## 📄 License

MIT
