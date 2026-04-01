import { useTimerStore } from "@/stores/timerStore";
import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";

interface LabelledTimerControlsProps {
  /** Hides reset during breaks so users do not jump back to focus by mistake. */
  hideReset?: boolean;
}

export function LabelledTimerControls({
  hideReset = false,
}: LabelledTimerControlsProps) {
  const { status, mode, start, pause, resume, reset, skip } = useTimerStore();

  const isRunning = status === "running";
  const isPaused = status === "paused";
  const isIdle = status === "idle";

  const iconBtn =
    "flex flex-col items-center gap-1.5 p-2 sm:p-3 rounded-2xl transition-all duration-300 active:scale-95 border-2 min-w-[4.5rem] sm:min-w-[5.5rem]";

  const colors = {
    focus:
      "border-primary/40 text-primary hover:bg-primary/10 shadow-[0_0_12px_rgba(255,45,120,0.15)]",
    short_break:
      "border-secondary/40 text-secondary hover:bg-secondary/10 shadow-[0_0_12px_rgba(0,255,204,0.12)]",
    long_break:
      "border-tertiary/40 text-tertiary hover:bg-tertiary/10 shadow-[0_0_12px_rgba(255,224,74,0.12)]",
  };

  return (
    <div className="flex flex-wrap justify-center gap-3 sm:gap-5 items-end">
      {!hideReset && (
        <button
          type="button"
          onClick={reset}
          className={cn(
            iconBtn,
            "border-outline/25 text-on_surface_variant hover:bg-surface_variant bg-surface/50",
          )}
          title="Reset"
        >
          <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden />
          <span className="font-label text-[10px] uppercase tracking-widest">
            Reset
          </span>
        </button>
      )}

      {isIdle && (
        <button
          type="button"
          onClick={start}
          className={cn(iconBtn, colors[mode], "bg-surface px-4 sm:px-6")}
          aria-label="Start timer"
        >
          <Play
            className="w-7 h-7 sm:w-9 sm:h-9"
            fill="currentColor"
            aria-hidden
          />
          <span className="font-label text-[10px] font-bold uppercase tracking-[0.2em]">
            Start
          </span>
        </button>
      )}

      {isRunning && (
        <button
          type="button"
          onClick={pause}
          className={cn(iconBtn, colors[mode], "bg-surface px-4 sm:px-6")}
          aria-label="Pause timer"
        >
          <Pause
            className="w-7 h-7 sm:w-9 sm:h-9"
            fill="currentColor"
            aria-hidden
          />
          <span className="font-label text-[10px] font-bold uppercase tracking-[0.2em]">
            Pause
          </span>
        </button>
      )}

      {isPaused && (
        <button
          type="button"
          onClick={resume}
          className={cn(
            iconBtn,
            colors[mode],
            "bg-surface px-4 sm:px-6 animate-pulse",
          )}
          aria-label="Resume timer"
        >
          <Play
            className="w-7 h-7 sm:w-9 sm:h-9"
            fill="currentColor"
            aria-hidden
          />
          <span className="font-label text-[10px] font-bold uppercase tracking-[0.2em]">
            Resume
          </span>
        </button>
      )}

      <button
        type="button"
        onClick={() => {
          void skip();
        }}
        className={cn(
          iconBtn,
          "border-outline/25 text-on_surface_variant hover:bg-surface_variant bg-surface/50",
        )}
        title="Skip"
      >
        <SkipForward className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden />
        <span className="font-label text-[10px] uppercase tracking-widest">
          Skip
        </span>
      </button>
    </div>
  );
}
