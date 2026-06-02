/* eslint-disable react-refresh/only-export-components -- TanStack Router route file */
import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { LogIn, UserPlus, Loader2 } from "lucide-react";

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

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      void navigate({ to: "/" });
    }
  }, [isAuthenticated, navigate]);

  // Don't render the form while redirecting
  if (isAuthenticated || authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

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
