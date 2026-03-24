import { useTimerStore } from '@/stores/timerStore'

export function useTimer() {
  const timer = useTimerStore()
  return timer
}
