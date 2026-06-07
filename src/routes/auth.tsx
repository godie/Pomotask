/* eslint-disable react-refresh/only-export-components -- TanStack Router route file */
import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { LogIn, UserPlus, Loader2 } from "lucide-react";
import { isConvexConfigured } from "@/lib/convex";

type Flow = "signIn" | "signUp";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const { signIn } = useAuthActions();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [flow, setFlow] = useState<Flow>("signUp");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  // Auth is only available when Convex is configured
  useEffect(() => {
    if (!isConvexConfigured) {
      void navigate({ to: "/" });
    }
  }, [navigate]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      void navigate({ to: "/" });
    }
  }, [isAuthenticated, navigate]);

  if (!isConvexConfigured) {
    return null;
  }

  // Don't render the form while redirecting
  if (isAuthenticated || authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleSubmitting(true);
    try {
      await signIn("google", { redirectTo: "/" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      setGoogleSubmitting(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await signIn("password", {
        email,
        password,
        flow,
      });
      // After successful sign-in/sign-up, navigate home.
      // The migration hook will fire automatically once useConvexAuth
      // reports isAuthenticated: true.
      void navigate({ to: "/" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 px-4">
      <h1 className="text-2xl font-headline font-bold text-primary mb-8 text-center">
        {flow === "signUp" ? "Create Account" : "Sign In"}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-surface border border-outline/20 rounded-2xl p-6 space-y-4"
      >
        <button
          type="button"
          onClick={() => {
            void handleGoogleSignIn();
          }}
          disabled={googleSubmitting || submitting}
          className="w-full bg-background border border-outline/20 text-foreground font-label font-bold uppercase tracking-wider py-2.5 rounded-lg hover:bg-surface_variant transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {googleSubmitting && <Loader2 className="animate-spin" size={18} />}
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="w-5 h-5"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>

        <div className="relative flex items-center py-1">
          <div className="flex-grow border-t border-outline/20" />
          <span className="flex-shrink mx-3 text-xs text-on_surface_variant font-label uppercase tracking-wider">
            or
          </span>
          <div className="flex-grow border-t border-outline/20" />
        </div>

        <div>
          <label
            htmlFor="auth-email"
            className="block text-sm font-label uppercase tracking-wider text-on_surface_variant mb-1"
          >
            Email
          </label>
          <input
            id="auth-email"
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            placeholder="you@example.com"
            className="w-full bg-background border border-outline/20 rounded-lg px-3 py-2 text-foreground placeholder:text-on_surface_variant/50 focus:outline-none focus:border-primary/50"
          />
        </div>

        <div>
          <label
            htmlFor="auth-password"
            className="block text-sm font-label uppercase tracking-wider text-on_surface_variant mb-1"
          >
            Password
          </label>
          <input
            id="auth-password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            placeholder="••••••••"
            className="w-full bg-background border border-outline/20 rounded-lg px-3 py-2 text-foreground placeholder:text-on_surface_variant/50 focus:outline-none focus:border-primary/50"
          />
        </div>

        {error && (
          <div
            role="alert"
            className="bg-error/10 border border-error/30 text-error rounded-lg px-3 py-2 text-sm"
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary text-on_primary font-label font-bold uppercase tracking-wider py-2.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting && <Loader2 className="animate-spin" size={18} />}
          {flow === "signUp" ? (
            <>
              <UserPlus size={18} />
              Create Account
            </>
          ) : (
            <>
              <LogIn size={18} />
              Sign In
            </>
          )}
        </button>

        <p className="text-center text-sm text-on_surface_variant">
          {flow === "signUp" ? (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setFlow("signIn");
                  setError(null);
                }}
                className="text-primary hover:underline font-label"
              >
                Sign in
              </button>
            </>
          ) : (
            <>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setFlow("signUp");
                  setError(null);
                }}
                className="text-primary hover:underline font-label"
              >
                Create one
              </button>
            </>
          )}
        </p>
      </form>
    </div>
  );
}
