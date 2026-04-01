import { cn } from "@/lib/utils";

interface BreakTimerPanelProps {
  mode: "short_break" | "long_break";
  className?: string;
}

export function BreakTimerPanel({ mode, className }: BreakTimerPanelProps) {
  const isShort = mode === "short_break";

  return (
    <div className={cn("text-center space-y-3 max-w-md mx-auto px-2", className)}>
      <div
        className={cn(
          "w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto flex items-center justify-center text-4xl sm:text-5xl border shadow-lg",
          isShort
            ? "bg-secondary/10 border-secondary/35 text-secondary shadow-[0_0_28px_rgba(0,255,204,0.2)]"
            : "bg-tertiary/10 border-tertiary/35 text-tertiary shadow-[0_0_28px_rgba(255,224,74,0.18)]",
        )}
        aria-hidden
      >
        {isShort ? "☕" : "🌙"}
      </div>
      <div>
        <h2
          className={cn(
            "text-2xl sm:text-3xl font-headline font-bold uppercase tracking-tight",
            isShort ? "text-secondary glow-secondary" : "text-tertiary",
          )}
        >
          {isShort ? "Short break" : "Long break"}
        </h2>
        <p className="mt-2 text-on_surface_variant font-label text-[11px] sm:text-xs uppercase tracking-widest leading-relaxed">
          {isShort
            ? "Step away, breathe, then come back sharp"
            : "Recharge — you earned a deeper pause"}
        </p>
      </div>
    </div>
  );
}
