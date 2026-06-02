import { useEffect, useRef, useCallback } from "react";
import { useConvexAuth } from "convex/react";

export type DataSource = "convex" | "dexie";

/**
 * Detects whether the app should use Convex or Dexie for data persistence.
 *
 * - When the user is authenticated → "convex" (cloud data)
 * - When not authenticated → "dexie" (local IndexedDB)
 * - While auth is loading → "dexie" (avoids flickering)
 *
 * Requires ConvexAuthProvider to be in the component tree (rendered in main.tsx).
 * When VITE_CONVEX_URL is unset a placeholder client is used — auth always
 * resolves to { isAuthenticated: false }, so this always returns "dexie".
 */
export function useDataSource(): DataSource {
  const { isAuthenticated, isLoading } = useConvexAuth();

  // Default to Dexie while auth state is loading to avoid UI flickering
  if (isLoading) return "dexie";

  return isAuthenticated ? "convex" : "dexie";
}

/**
 * Returns a stable getter function that always reads the latest DataSource value.
 * Use this inside mutationFn callbacks to avoid stale closures
 * without calling hooks inside non-React functions.
 */
export function useDataSourceGetter() {
  const source = useDataSource();
  const ref = useRef(source);

  // Sync ref after render to comply with rules-of-hooks
  useEffect(() => {
    ref.current = source;
  }, [source]);

  return useCallback(() => ref.current, []);
}
