# AGENTS.md

## Cursor Cloud specific instructions

### Overview

Pomotask is an offline-first Pomodoro task management PWA built with React 18, Vite, TanStack Router, Zustand, Dexie.js (IndexedDB), and optional Convex cloud backend. See `README.md` and `AGENT.md` for full stack details and development workflow.

### Key commands

Standard commands are in `package.json` scripts:

- `pnpm dev` — Vite dev server on port 5173
- `pnpm lint` — ESLint (zero warnings policy)
- `pnpm typecheck` — `tsc --noEmit`
- `pnpm test:run` — Vitest with coverage
- `pnpm build` — production build (`tsc && vite build`)

### Convex codegen without deploy keys

`npx convex codegen` requires `CONVEX_DEPLOY_KEY` and `CONVEX_DEPLOYMENT` env vars, which are not available in the Cloud Agent environment. The `convex/_generated/` directory (gitignored) must be manually generated from the Convex codegen templates. The update script handles this by running a Node script that generates the three required files (`api.ts`, `dataModel.ts`, `server.ts`) based on the modules in `convex/`. If new files are added to `convex/`, the generation script should be updated.

### Offline mode (no Convex URL)

Without `VITE_CONVEX_URL`, the app runs fully offline using IndexedDB via Dexie.js. The code gracefully handles the missing Convex URL by conditionally wrapping the app in `ConvexAuthProvider` only when `VITE_CONVEX_URL` is set. No login or backend is required to test the app.

### Router devtools

`@tanstack/router-devtools` is currently commented out in `src/routes/__root.tsx` due to version incompatibility with `@tanstack/react-router`. This does not affect functionality.

### esbuild build scripts

The `pnpm.onlyBuiltDependencies` field in `package.json` allowlists `esbuild` for non-interactive postinstall script execution. Without this, `pnpm install` in a non-interactive environment skips esbuild's native binary download, causing Vite/build failures.

### Pre-commit hooks (Husky)

Husky hooks run `lint-staged` (ESLint + tsc on staged `.ts`/`.tsx` files, Prettier on `.json`/`.md`/`.yml`/`.yaml`) and `vitest run --coverage`. See `.husky/pre-commit` and `lint-staged.config.mjs`.
