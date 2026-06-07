import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  FOCUS_DURATION,
  LONG_BREAK,
  POMODOROS_UNTIL_LONG_BREAK,
  SHORT_BREAK,
} from "@/lib/pomodoro";
import { incrementRealPomodoros } from "@/db/tasks";
import { createSession } from "@/db/sessions";

type TimerMode = "focus" | "short_break" | "long_break";
export type TimerStatus = "idle" | "running" | "paused" | "break";

interface TimerState {
  status: TimerStatus;
  mode: TimerMode;
  secondsLeft: number;
  pomodorosCompleted: number;
  totalPomodorosToday: number;
  activeTaskId: string | null;
  /** Timestamp (ms) of the last tick — used for recovery after page refresh */
  lastTickAt: number | null;
  start: () => void;
  pause: () => void;
  resume: () => void;
  skip: () => Promise<void>;
  reset: () => void;
  setActiveTask: (taskId: string | null) => void;
  tick: () => void;
}

const initialTimerFields = {
  status: "idle" as const,
  mode: "focus" as const,
  secondsLeft: FOCUS_DURATION,
  pomodorosCompleted: 0,
  totalPomodorosToday: 0,
  activeTaskId: null as string | null,
  lastTickAt: null as number | null,
};

let timerInterval: ReturnType<typeof setInterval> | null = null;

/** Start or restart the timer interval (module-scoped, only one at a time) */
function ensureInterval(get: () => TimerState) {
  if (timerInterval) return;
  timerInterval = setInterval(() => {
    get().tick();
  }, 1000);
}

function clearTimerInterval() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

/** Resume a running timer after persist hydration or page refresh. */
export function recoverRunningTimerAfterHydration(
  state: Pick<TimerState, "status" | "secondsLeft" | "lastTickAt">,
) {
  if (state.status !== "running") return;

  let secondsLeft = state.secondsLeft;
  if (state.lastTickAt != null) {
    const elapsed = Math.floor((Date.now() - state.lastTickAt) / 1000);
    secondsLeft = Math.max(0, state.secondsLeft - elapsed);
  }

  if (secondsLeft <= 0) {
    useTimerStore.setState({ secondsLeft: 0, lastTickAt: null });
    setTimeout(() => {
      void useTimerStore.getState().skip();
    }, 0);
    return;
  }

  useTimerStore.setState({
    secondsLeft,
    lastTickAt: Date.now(),
  });
  ensureInterval(() => useTimerStore.getState());
}

const playBeep = () => {
  try {
    const context = new window.AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.type = "sine";
    oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(0.1, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.5);
  } catch (e) {
    console.warn("Audio play failed", e);
  }
};

const sendNotification = (title: string, body: string) => {
  if (Notification.permission === "granted") {
    void new Notification(title, { body, icon: "/icons/icon-192.png" });
  } else if (Notification.permission !== "denied") {
    void Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        void new Notification(title, { body, icon: "/icons/icon-192.png" });
      }
    });
  }
};

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      ...initialTimerFields,
      start: () => {
        if (get().status !== "idle") return;
        set({ status: "running", lastTickAt: Date.now() });
        ensureInterval(get);
      },
      pause: () => {
        if (get().status !== "running") return;
        set({ status: "paused" });
      },
      resume: () => {
        if (get().status !== "paused") return;
        set({ status: "running", lastTickAt: Date.now() });
        ensureInterval(get);
      },
      tick: () => {
        const { status, secondsLeft } = get();
        if (status !== "running") return;

        if (secondsLeft <= 1) {
          void get().skip();
        } else {
          set({ secondsLeft: secondsLeft - 1, lastTickAt: Date.now() });
        }
      },
      skip: async () => {
        const { mode, pomodorosCompleted, activeTaskId, secondsLeft } = get();

        playBeep();

        if (mode === "focus") {
          sendNotification("Focus Complete!", "Time for a break.");
          if (activeTaskId) {
            await incrementRealPomodoros(activeTaskId);
            await createSession({
              taskId: activeTaskId,
              startedAt: Date.now() - (FOCUS_DURATION - secondsLeft) * 1000,
              completedAt: Date.now(),
              type: "focus",
              durationSeconds: FOCUS_DURATION - secondsLeft,
            });
          }

          const nextCompleted = pomodorosCompleted + 1;
          const isLongBreak =
            nextCompleted > 0 &&
            nextCompleted % POMODOROS_UNTIL_LONG_BREAK === 0;
          set({
            pomodorosCompleted: nextCompleted,
            totalPomodorosToday: get().totalPomodorosToday + 1,
            mode: isLongBreak ? "long_break" : "short_break",
            secondsLeft: isLongBreak ? LONG_BREAK : SHORT_BREAK,
            status: "idle",
            lastTickAt: null,
          });
        } else {
          sendNotification("Break Over!", "Ready to focus again?");
          set({
            mode: "focus",
            secondsLeft: FOCUS_DURATION,
            status: "idle",
            lastTickAt: null,
          });
        }
      },
      reset: () => {
        set({
          status: "idle",
          mode: "focus",
          secondsLeft: FOCUS_DURATION,
          lastTickAt: null,
        });
        clearTimerInterval();
      },
      setActiveTask: (taskId) => {
        set({ activeTaskId: taskId });
      },
    }),
    {
      name: "pomotask-timer",
      partialize: (state) => ({
        status: state.status,
        mode: state.mode,
        secondsLeft: state.secondsLeft,
        pomodorosCompleted: state.pomodorosCompleted,
        totalPomodorosToday: state.totalPomodorosToday,
        activeTaskId: state.activeTaskId,
        lastTickAt: state.lastTickAt,
      }),
    },
  ),
);

useTimerStore.persist.onFinishHydration(() => {
  recoverRunningTimerAfterHydration(useTimerStore.getState());
});

// Rehydration can finish synchronously before the listener above is registered.
if (useTimerStore.persist.hasHydrated()) {
  recoverRunningTimerAfterHydration(useTimerStore.getState());
}
