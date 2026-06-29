"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/fetcher";
import { QUERY_STALE_TIME } from "@/lib/query-config";
import type { AnalyticsDto, DashboardStatsDto, Period } from "@/types/domain";

export type AnalyticsResponse = AnalyticsDto & {
  stats: DashboardStatsDto;
};

export function useAnalytics(
  period: Period,
  options?: {
    initialData?: AnalyticsResponse;
    initialPeriod?: Period;
  },
) {
  const useInitialData =
    options?.initialData &&
    (options.initialPeriod === undefined || options.initialPeriod === period);

  return useQuery({
    queryKey: ["analytics", period],
    queryFn: () =>
      fetchJson<AnalyticsResponse>(`/api/analytics?period=${period}`),
    placeholderData: keepPreviousData,
    initialData: useInitialData ? options.initialData : undefined,
    initialDataUpdatedAt: useInitialData ? Date.now() : undefined,
    staleTime: QUERY_STALE_TIME,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}
