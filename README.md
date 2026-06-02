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
- **Cloud Sync** — Sync your data across devices using Convex
- **Mobile-ready** — Responsive PWA, installable on iOS/Android

---

## 🧱 Tech Stack

| Layer           | Technology               |
| --------------- | ------------------------ |
| Framework       | React 18                 |
| Routing         | TanStack Router          |
| Server State    | TanStack Query / Convex  |
| Client State    | Zustand                  |
| Local DB        | IndexedDB via Dexie.js   |
| Backend / Sync  | Convex                   |
| Styling         | Tailwind CSS v4          |
| UI Components   | shadcn/ui                |
| Forms           | TanStack Form            |
| Tables          | TanStack Table           |
| Build           | Vite                     |
| Tests           | Vitest + Testing Library |
| Package manager | pnpm                     |

---

## 🚀 Getting Started

```bash
# https://github.com/godie/Pomotask
git clone https://github.com/godie/Pomotask.git
cd Pomotask

# Install dependencies
pnpm install

# Start Convex dev server (in a separate terminal)
npx convex dev

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

### Environment variables (for Convex sync)

```bash
cp .env.example .env
# Edit .env and set VITE_CONVEX_URL to your Convex deployment URL
```

See [docs/convex-local-setup.md](./docs/convex-local-setup.md) for a step-by-step guide to setting up local Convex dev and testing the full migration flow.

If `VITE_CONVEX_URL` is not set, the app runs fully offline with IndexedDB.

---

## 📁 Project Structure (current)

```
src/
├── App.tsx
├── main.tsx
├── index.css
├── db/                 # Dexie — projects, tasks, sessions
├── lib/                # pomodoro helpers, convex client, utils
├── stores/             # timerStore (Zustand)
├── tests/              # Vitest setup + unit tests
└── types/              # Shared TypeScript types
convex/                 # Convex backend (schema, functions, crons)
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
- [Convex Local Dev Setup](./docs/convex-local-setup.md)

---

## Production

https://pomotask.pages.dev

## 📄 License

MIT
