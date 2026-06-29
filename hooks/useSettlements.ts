"use client";

import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/fetcher";
import { QUERY_STALE_TIME } from "@/lib/query-config";
import type { SettlementDto } from "@/types/domain";

export type SettlementsResponse = {
  settlements: SettlementDto[];
  summary: {
    pendingPayout: number;
    nextSettlementDate: string;
  };
  nextCursor: string | null;
};

export function useSettlements() {
  return useInfiniteQuery({
    queryKey: ["settlements"],
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam }) => {
      const searchParams = new URLSearchParams({ limit: "10" });
      if (pageParam) searchParams.set("cursor", pageParam);
      
      const queryStr = searchParams.toString();
      return fetchJson<SettlementsResponse>(`/api/settlements${queryStr ? `?${queryStr}` : ""}`);
    },
    getNextPageParam: (lastPage) => lastPage?.nextCursor ?? undefined,
    placeholderData: keepPreviousData,
    staleTime: QUERY_STALE_TIME,
    gcTime: QUERY_STALE_TIME * 2,
    refetchOnMount: false,
  });
}
