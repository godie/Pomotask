# 🤖 AGENT.md — Instructions for AI Agents

> Read this file FIRST before doing anything else in this repo.

---

## What is this project?

**PomodoroFlow** — A todo list app where everything is measured in Pomodoros.
Users manage projects and tasks, run a Pomodoro timer, and track estimated vs real Pomodoros per task and project.

---

## Your workflow

1. **Read docs in order**:
   - \`README.md\` — project overview and stack
   - \`MVPSCOPE.md\` — what to build (and what NOT to build)
   - \`SPECS.md\` — technical decisions, types, architecture
   - \`ROADMAP.md\` — your task list, phase by phase

2. **Design tokens**: Before writing ANY component, connect to Stitch MCP:
   - URL: \`https://stitch.withgoogle.com/projects/6328229122179225454\`
   - Get: colors, typography, spacing, component designs
   - Apply them via Tailwind CSS variables

3. **Work phase by phase** in \`ROADMAP.md\`. Mark tasks \`[x]\` as you complete them.

4. **Commit after each phase** using conventional commits.

5. **Never skip phases** — each phase depends on the previous one.

---

## Key rules

- Do not add features not listed in \`MVPSCOPE.md\`
- Do not use any library not listed in \`SPECS.md\` without noting it
- All data must persist in IndexedDB (Dexie) — this is offline-first
- Auth is optional — the app must work 100% without it
- TypeScript strict mode — no \`any\`
- Mobile-first responsive design

---

## Stack quick reference

\`\`\`
React 18 + Vite + TypeScript (strict)
TanStack Router — routing
TanStack Query — async state
TanStack Form — forms
Dexie.js — IndexedDB
Zustand — timer global state
Tailwind CSS v4 + shadcn/ui
Supabase — optional auth + sync
pnpm — package manager
\`\`\`

---

## Where things live

| What | Where |
|---|---|
| Types | \`src/types/index.ts\` |
| DB operations | \`src/db/\` |
| Timer logic | \`src/stores/timerStore.ts\` |
| Business rules | \`src/lib/pomodoro.ts\` |
| Query hooks | \`src/hooks/\` |
| Routes/Pages | \`src/routes/\` |
| Components | \`src/components/\` |

---

## Business rules to never break

- A Pomodoro = 25 min focus
- After 4 Pomodoros → long break (15 min), else short break (5 min)
- If task estimate > 5 Pomodoros → must offer to split into 2 tasks
- Split divides estimate evenly (\`Math.ceil\` for part 1)
- \`realPomodoros\` is auto-incremented only — never manually editable by user
- Tasks can belong to a project or be standalone (no project)
