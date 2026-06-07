import { ConvexReactClient } from "convex/react";

const convexUrl = (import.meta.env.VITE_CONVEX_URL as string | undefined)?.trim();

/** True when a real Convex deployment URL is configured at build time. */
export const isConvexConfigured = Boolean(convexUrl);

// Always create a client so Convex hooks (useQuery, useConvexAuth) are safe
// everywhere. Offline builds use a placeholder URL that never connects —
// auth resolves to { isAuthenticated: false, isLoading: false }.
export const convex = new ConvexReactClient(
  convexUrl || "https://placeholder.pomotask.local",
);
