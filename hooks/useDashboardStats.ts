"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/fetcher";
import { QUERY_STALE_TIME } from "@/lib/query-config";
import type { DashboardStatsDto } from "@/types/domain";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => fetchJson<DashboardStatsDto>("/api/dashboard/stats"),
    staleTime: QUERY_STALE_TIME,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}
