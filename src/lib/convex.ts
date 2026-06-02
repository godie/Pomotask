import { ConvexReactClient } from "convex/react";

const convexUrl = import.meta.env.VITE_CONVEX_URL as string;

// Always create a client so useConvexAuth() is safe everywhere.
// When VITE_CONVEX_URL is unset the client points to a placeholder
// that never connects — auth always resolves to isAuthenticated: false.
export const convex = new ConvexReactClient(
  convexUrl || "https://placeholder.pomotask.local",
);
