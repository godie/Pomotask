import { useCallback, useEffect, useState } from "react";
import { CheckCircle, CloudUpload, XCircle, X } from "lucide-react";
import type { MigrationStatus } from "@/hooks/useMigration";

interface MigrationBannerProps {
  status: MigrationStatus;
  error: string | null;
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4 text-secondary"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export function MigrationBanner({ status, error }: MigrationBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  // Auto-dismiss "done" after 3 seconds by marking the banner as dismissed
  useEffect(() => {
    if (status !== "done") return;

    const timer = setTimeout(() => {
      setDismissed(true);
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, [status]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
  }, []);

  if (dismissed || status === "idle") {
    return null;
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 z-60 flex items-center justify-center pointer-events-none pt-safe"
      role="status"
      aria-live="polite"
    >
      <div
        className={`pointer-events-auto flex items-center gap-3 px-4 py-2.5 rounded-b-2xl text-sm font-label tracking-wide shadow-lg border transition-all duration-300 ${
          status === "migrating"
            ? "bg-surface-container-high border-secondary/30 text-secondary shadow-[0_0_20px_rgba(0,255,204,0.15)]"
            : status === "done"
              ? "bg-surface-container-high border-primary/30 text-primary shadow-[0_0_20px_rgba(255,45,120,0.15)]"
              : "bg-surface-container-high border-error/30 text-error shadow-[0_0_20px_rgba(255,82,82,0.15)]"
        }`}
      >
        {status === "migrating" && (
          <>
            <Spinner />
            <CloudUpload size={16} />
            <span>Migrating your data...</span>
          </>
        )}

        {status === "done" && (
          <>
            <CheckCircle size={16} />
            <span>Migration complete!</span>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle size={16} />
            <span className="max-w-sm truncate" title={error ?? undefined}>
              Migration failed{error ? `: ${error}` : ""}
            </span>
            <button
              onClick={handleDismiss}
              className="ml-2 p-0.5 rounded-full hover:bg-error/10 transition-colors"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
