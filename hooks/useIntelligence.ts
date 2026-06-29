"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/fetcher";
import type { IntelligenceResponse } from "@/lib/intelligence";
import { QUERY_STALE_TIME } from "@/lib/query-config";

export type { Anomaly, ForecastData, Insight, IntelligenceResponse } from "@/lib/intelligence";

export function useIntelligence(initialData?: IntelligenceResponse) {
  return useQuery({
    queryKey: ["intelligence"],
    queryFn: () => fetchJson<IntelligenceResponse>("/api/intelligence"),
    placeholderData: keepPreviousData,
    initialData,
    initialDataUpdatedAt: initialData ? Date.now() : undefined,
    staleTime: QUERY_STALE_TIME,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}
