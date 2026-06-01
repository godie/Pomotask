import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllFocusSessions } from "@/db/sessions";
import { queryKeys } from "@/lib/queryKeys";
import {
  computeFocusStreakDays,
  formatTotalFocusedDuration,
  sumFocusDurationSeconds,
} from "@/lib/focusStats";

export function useFocusStats() {
  const query = useQuery({
    queryKey: queryKeys.sessions.all,
    queryFn: getAllFocusSessions,
  });

  const { streakDays, totalFocusedLabel } = useMemo(() => {
    const sessions = query.data ?? [];
    const totalSeconds = sumFocusDurationSeconds(sessions);
    return {
      streakDays: computeFocusStreakDays(sessions),
      totalFocusedLabel: formatTotalFocusedDuration(totalSeconds),
    };
  }, [query.data]);

  return {
    streakDays,
    totalFocusedLabel,
    isLoading: query.isLoading,
  };
}
