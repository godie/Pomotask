import { Link } from "@tanstack/react-router";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { LogIn, LogOut } from "lucide-react";
import { isConvexConfigured } from "@/lib/convex";

export function AuthNav() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();

  if (!isConvexConfigured || isLoading) return null;

  if (isAuthenticated) {
    return (
      <button
        type="button"
        onClick={() => {
          void signOut();
        }}
        className="hidden sm:flex items-center gap-2 text-on_surface_variant hover:text-primary transition-colors text-xs font-label uppercase tracking-widest"
        title="Sign out"
      >
        <LogOut size={14} />
        <span>Sign Out</span>
      </button>
    );
  }

  return (
    <Link
      to="/auth"
      className="hidden sm:flex items-center gap-2 text-on_surface_variant hover:text-primary transition-colors text-xs font-label uppercase tracking-widest"
    >
      <LogIn size={14} />
      <span>Sign In</span>
    </Link>
  );
}
