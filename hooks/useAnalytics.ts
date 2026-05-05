"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/fetcher";
import type { AnalyticsDto, DashboardStatsDto, Period } from "@/types/domain";

export type AnalyticsResponse = AnalyticsDto & {
  stats: DashboardStatsDto;
};

export function useAnalytics(period: Period) {
  return useQuery({
    queryKey: ["analytics", period],
    queryFn: () =>
      fetchJson<AnalyticsResponse>(`/api/analytics?period=${period}`),
    placeholderData: keepPreviousData,
  });
}
