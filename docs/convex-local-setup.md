# Convex Local Dev Setup — End-to-End Testing

This guide walks through setting up a local Convex dev deployment so you can test the full migration flow: sign-up → Dexie data migrates to Convex → Dexie is cleared.

## Prerequisites

- [pnpm](https://pnpm.io/installation) installed
- A [Convex account](https://www.convex.dev/) (free tier works)

## Step 1 — Copy the environment file

```bash
cp .env.example .env
```

The `.env.example` template contains a placeholder for `VITE_CONVEX_URL`. You'll fill this in during Step 3.

## Step 2 — Start the Convex dev server

In one terminal, run:

```bash
npx convex dev
```

On first run, Convex will:

1. Prompt you to log in (opens the browser)
2. Ask you to select or create a project
3. Generate `convex/_generated/` with type-safe API bindings
4. Print your dev deployment URL

**Keep this terminal running.** The Convex dev server pushes your backend functions to the cloud and streams logs.

## Step 3 — Get your deployment URL

After `npx convex dev` starts, look for output like:

```
Deployment URL: https://efficient-minnow-76.convex.cloud
```

Copy this URL into your `.env` file:

```env
VITE_CONVEX_URL=https://efficient-minnow-76.convex.cloud
```

You can also find the dev URL in the [Convex dashboard](https://dashboard.convex.dev) under your project → Deployments → dev.

## Step 4 — Start the Vite dev server

In a second terminal:

```bash
pnpm install
pnpm dev
```

The app opens at `http://localhost:5173` (or the next available port).

## Step 5 — Verify Convex is connected

Open the browser DevTools console. You should see Convex connecting without errors. The app's nav bar should show "POMOTASK" — if `VITE_CONVEX_URL` is correctly set, the auth state is managed by Convex.

To confirm Convex is reachable, check the **Network** tab for WebSocket connections to your `*.convex.cloud` deployment.

## Step 6 — Set up email/password authentication

By default, `convex/auth.config.ts` has an empty `providers` array. To enable email/password sign-up, update it:

```typescript
// convex/auth.config.ts
export default {
  providers: [
    {
      domain: "http://localhost:5173", // your dev server origin
      applicationUri: "http://localhost:5173",
    },
  ],
};
```

`npx convex dev` watches files and auto-pushes changes, so the new auth config is picked up automatically.

> ⚠️ This is a minimal setup for E2E testing. In production, Convex Auth uses the `SITE_URL` environment variable for the origin.

## Step 7 — Test the end-to-end migration flow

### 7.1 Seed Dexie data (while unauthenticated)

Open the browser console and run:

```javascript
// Seed test data in Dexie (IndexedDB)
const { db } = await import("/src/db/schema.ts");

await db.projects.add({
  id: "test-proj-1",
  name: "Test Project",
  color: "#ff2d78",
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

await db.tasks.add({
  id: "test-task-1",
  projectId: "test-proj-1",
  name: "Test Task",
  estimatedPomodoros: 3,
  realPomodoros: 0,
  status: "pending",
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

console.log("Dexie seeded:", {
  projects: await db.projects.toArray(),
  tasks: await db.tasks.toArray(),
});
```

### 7.2 Sign up / sign in

Navigate to the sign-up or sign-in page and create an account (or sign in if you already have one).

### 7.3 Watch the migration

After successful authentication:

1. A **migration banner** appears at the top of the screen showing "Migrating your data..."
2. When complete, the banner shows "Migration complete!" and auto-dismisses after 3 seconds
3. Check the **Convex dashboard** → your project → Data tab — you should see your projects and tasks in the `projects` and `tasks` tables
4. Open the browser console and verify Dexie is empty:

```javascript
const { db } = await import("/src/db/schema.ts");
console.log("Dexie after migration:", {
  projects: await db.projects.toArray(),
  tasks: await db.tasks.toArray(),
});
// Both arrays should be empty
```

### 7.4 Verify cloud data

Create a new task in the app while signed in — it should appear in the Convex dashboard under your user ID. Sign out and the task is no longer visible (data lives in Convex, not Dexie).

## Troubleshooting

| Problem                                      | Solution                                                                                                        |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `npx convex dev` fails with auth error       | Re-run `npx convex dev` and follow the login prompts, or run `npx convex logout` first to clear the old session |
| App shows Dexie data after sign-up           | Check that `VITE_CONVEX_URL` is set in `.env` and the Vite server was restarted after setting it                |
| Migration banner doesn't appear              | Open the browser console — look for Convex auth logs. `useConvexAuth()` must return `isAuthenticated: true`     |
| Migration completes but data isn't in Convex | Check the **Convex dashboard** → Logs for errors in `migrateUserProject` or `migrateUserTask` mutations         |
| `pnpm dev` can't find Convex types           | Run `npx convex codegen` to regenerate `convex/_generated/`                                                     |

## Without a Convex deployment

If you don't want to set up Convex, simply leave `VITE_CONVEX_URL` unset (or delete `.env`). The app runs fully offline with Dexie — no login, no cloud sync. All CRUD operations use IndexedDB locally.

## Convex dashboard quick links

- **Dashboard**: https://dashboard.convex.dev
- **Data browser**: `https://dashboard.convex.dev/deployment/<your-deployment>/data?table=`
- **Logs**: `https://dashboard.convex.dev/deployment/<your-deployment>/logs`
- **Functions**: `https://dashboard.convex.dev/deployment/<your-deployment>/functions`
