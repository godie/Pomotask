import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import {
  useTimerStore,
  recoverRunningTimerAfterHydration,
} from "@/stores/timerStore";
import {
  FOCUS_DURATION,
  SHORT_BREAK,
  LONG_BREAK,
  POMODOROS_UNTIL_LONG_BREAK,
} from "@/lib/pomodoro";
import { incrementRealPomodoros } from "@/db/tasks";
import { createSession } from "@/db/sessions";

vi.mock("@/db/tasks", () => ({
  incrementRealPomodoros: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/db/sessions", () => ({
  createSession: vi.fn().mockResolvedValue({}),
}));

// Reset Zustand store between tests
beforeEach(() => {
  localStorage.clear();
  act(() => {
    useTimerStore.getState().reset();
  });
  useTimerStore.setState({
    status: "idle",
    mode: "focus",
    secondsLeft: FOCUS_DURATION,
    pomodorosCompleted: 0,
    totalPomodorosToday: 0,
    activeTaskId: null,
    lastTickAt: null,
  });
  vi.clearAllMocks();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("timerStore — initial state", () => {
  it("starts idle with full focus duration", () => {
    const { result } = renderHook(() => useTimerStore());
    expect(result.current.status).toBe("idle");
    expect(result.current.mode).toBe("focus");
    expect(result.current.secondsLeft).toBe(FOCUS_DURATION);
    expect(result.current.activeTaskId).toBeNull();
  });
});

describe("timerStore — start / pause / resume", () => {
  it("transitions from idle to running on start", () => {
    const { result } = renderHook(() => useTimerStore());
    act(() => {
      result.current.start();
    });
    expect(result.current.status).toBe("running");
  });

  it("pauses when running", () => {
    const { result } = renderHook(() => useTimerStore());
    act(() => {
      result.current.start();
    });
    act(() => {
      result.current.pause();
    });
    expect(result.current.status).toBe("paused");
  });

  it("resumes from paused", () => {
    const { result } = renderHook(() => useTimerStore());
    act(() => {
      result.current.start();
    });
    act(() => {
      result.current.pause();
    });
    act(() => {
      result.current.resume();
    });
    expect(result.current.status).toBe("running");
  });

  it("ticks after resume from paused", () => {
    const { result } = renderHook(() => useTimerStore());
    act(() => {
      useTimerStore.setState({ status: "paused", secondsLeft: 100 });
      result.current.resume();
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.secondsLeft).toBe(99);
  });
});

describe("timerStore — reset", () => {
  it("resets to initial focus state", () => {
    const { result } = renderHook(() => useTimerStore());
    act(() => {
      result.current.start();
    });
    act(() => {
      result.current.reset();
    });
    expect(result.current.status).toBe("idle");
    expect(result.current.secondsLeft).toBe(FOCUS_DURATION);
    expect(result.current.mode).toBe("focus");
  });
});

describe("timerStore — setActiveTask", () => {
  it("sets the active task id", () => {
    const { result } = renderHook(() => useTimerStore());
    act(() => {
      result.current.setActiveTask("task-123");
    });
    expect(result.current.activeTaskId).toBe("task-123");
  });

  it("clears the active task with null", () => {
    const { result } = renderHook(() => useTimerStore());
    act(() => {
      result.current.setActiveTask("task-123");
    });
    act(() => {
      result.current.setActiveTask(null);
    });
    expect(result.current.activeTaskId).toBeNull();
  });
});

describe("timerStore — break transitions", () => {
  it("transitions to short break after first Pomodoro", async () => {
    const { result } = renderHook(() => useTimerStore());
    await act(async () => {
      useTimerStore.setState({
        pomodorosCompleted: 0,
        status: "idle",
        mode: "focus",
      });
      await result.current.skip();
    });
    expect(result.current.mode).toBe("short_break");
    expect(result.current.secondsLeft).toBe(SHORT_BREAK);
  });

  it("transitions to long break after 4 Pomodoros", async () => {
    const { result } = renderHook(() => useTimerStore());
    await act(async () => {
      useTimerStore.setState({
        pomodorosCompleted: POMODOROS_UNTIL_LONG_BREAK - 1,
        status: "running",
        mode: "focus",
      });
      await result.current.skip();
    });
    expect(result.current.mode).toBe("long_break");
    expect(result.current.secondsLeft).toBe(LONG_BREAK);
  });
});

describe("timerStore — tick", () => {
  it("decrements secondsLeft on tick", () => {
    const { result } = renderHook(() => useTimerStore());
    act(() => {
      useTimerStore.setState({ status: "running", secondsLeft: 100 });
      result.current.tick();
    });
    expect(result.current.secondsLeft).toBe(99);
  });

  it("completes session when secondsLeft reaches 0", async () => {
    const { result } = renderHook(() => useTimerStore());
    await act(async () => {
      useTimerStore.setState({ status: "running", secondsLeft: 1 });
      result.current.tick();
    });
    expect(result.current.status).toBe("idle");
    expect(result.current.mode).not.toBe("focus");
  });
});

describe("timerStore — refresh recovery", () => {
  it("subtracts elapsed time and restarts interval after hydration", () => {
    const { result } = renderHook(() => useTimerStore());
    act(() => {
      useTimerStore.setState({
        status: "running",
        secondsLeft: 100,
        lastTickAt: Date.now() - 10_000,
      });
      recoverRunningTimerAfterHydration(useTimerStore.getState());
    });
    expect(result.current.secondsLeft).toBe(90);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.secondsLeft).toBe(89);
  });

  it("recovers running timer even when lastTickAt is missing", () => {
    const { result } = renderHook(() => useTimerStore());
    act(() => {
      useTimerStore.setState({
        status: "running",
        secondsLeft: 60,
        lastTickAt: null,
      });
      recoverRunningTimerAfterHydration(useTimerStore.getState());
    });
    expect(result.current.secondsLeft).toBe(60);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.secondsLeft).toBe(59);
  });

  it("triggers skip when timer expired during refresh", async () => {
    const { result } = renderHook(() => useTimerStore());
    act(() => {
      useTimerStore.setState({
        status: "running",
        mode: "focus",
        secondsLeft: 5,
        lastTickAt: Date.now() - 10_000,
      });
      recoverRunningTimerAfterHydration(useTimerStore.getState());
    });
    await act(async () => {
      vi.runAllTimers();
    });
    expect(result.current.status).toBe("idle");
    expect(result.current.mode).toBe("short_break");
  });
});

describe("timerStore — side effects", () => {
  it("calls incrementRealPomodoros and createSession when focus completes", async () => {
    const { result } = renderHook(() => useTimerStore());
    await act(async () => {
      useTimerStore.setState({
        mode: "focus",
        activeTaskId: "task-1",
        secondsLeft: 0,
        status: "running",
      });
      await result.current.skip();
    });

    expect(incrementRealPomodoros).toHaveBeenCalledWith("task-1");
    expect(createSession).toHaveBeenCalled();
  });

  it("requests notification permission when sending notification and permission is default", async () => {
    const originalNotification = global.Notification;
    const requestPermissionMock = vi.fn().mockResolvedValue("granted");
    const notificationConstructorMock = vi.fn();

    const MockNotification = function (
      _title: string,
      _options?: { body: string; icon?: string },
    ) {
      notificationConstructorMock();
    } as any;
    MockNotification.permission = "default";
    MockNotification.requestPermission = requestPermissionMock;
    global.Notification = MockNotification;

    const { result } = renderHook(() => useTimerStore());
    await act(async () => {
      useTimerStore.setState({
        mode: "focus",
        secondsLeft: 0,
        status: "running",
      });
      await result.current.skip();
    });

    expect(requestPermissionMock).toHaveBeenCalled();
    global.Notification = originalNotification;
  });

  it("does not request permission when already denied", async () => {
    const originalNotification = global.Notification;
    const requestPermissionMock = vi.fn();

    (global.Notification as any) = {
      permission: "denied",
      requestPermission: requestPermissionMock,
    };

    const { result } = renderHook(() => useTimerStore());
    await act(async () => {
      useTimerStore.setState({
        mode: "focus",
        secondsLeft: 0,
        status: "running",
      });
      await result.current.skip();
    });

    expect(requestPermissionMock).not.toHaveBeenCalled();
    global.Notification = originalNotification;
  });
});
