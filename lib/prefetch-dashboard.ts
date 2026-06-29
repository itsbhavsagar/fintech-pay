"use client";

import type { QueryClient, QueryKey } from "@tanstack/react-query";
import { fetchJson } from "@/lib/fetcher";
import type { IntelligenceResponse } from "@/lib/intelligence";
import { QUERY_STALE_TIME } from "@/lib/query-config";
import type { AnalyticsResponse } from "@/hooks/useAnalytics";
import type { DashboardStatsDto } from "@/types/domain";
import type { TransactionsPage } from "@/lib/transactions";
import type { PaymentLinkDto } from "@/types/domain";
import type { SettlementsResponse } from "@/hooks/useSettlements";

type PaymentLinksResponse = {
  paymentLinks: PaymentLinkDto[];
  nextCursor: string | null;
};

function prefetchIfStale<T>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  queryFn: () => Promise<T>,
): void {
  const state = queryClient.getQueryState(queryKey);
  if (
    state?.dataUpdatedAt &&
    Date.now() - state.dataUpdatedAt < QUERY_STALE_TIME
  ) {
    return;
  }

  void queryClient.prefetchQuery({ queryKey, queryFn, staleTime: QUERY_STALE_TIME });
}

function prefetchInfiniteIfStale<T>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  queryFn: () => Promise<T>,
): void {
  const state = queryClient.getQueryState(queryKey);
  if (
    state?.dataUpdatedAt &&
    Date.now() - state.dataUpdatedAt < QUERY_STALE_TIME
  ) {
    return;
  }

  void queryClient.prefetchInfiniteQuery({
    queryKey,
    queryFn,
    initialPageParam: null,
    staleTime: QUERY_STALE_TIME,
  });
}

const DASHBOARD_ROUTES = [
  "/",
  "/transactions",
  "/analytics",
  "/ai-intelligence",
  "/payment-links",
  "/settlements",
] as const;

const ANALYTICS_PERIODS = ["7d", "30d", "90d"] as const;

function prefetchAnalyticsPeriods(queryClient: QueryClient): void {
  for (const period of ANALYTICS_PERIODS) {
    prefetchIfStale(queryClient, ["analytics", period], () =>
      fetchJson<AnalyticsResponse>(`/api/analytics?period=${period}`),
    );
  }
}

export function prefetchAllDashboardRoutes(queryClient: QueryClient): void {
  for (const href of DASHBOARD_ROUTES) {
    prefetchDashboardRoute(queryClient, href);
  }
}

export function prefetchDashboardRoute(
  queryClient: QueryClient,
  href: string,
): void {
  switch (href) {
    case "/":
      prefetchAnalyticsPeriods(queryClient);
      prefetchIfStale(queryClient, ["dashboard-stats"], () =>
        fetchJson<DashboardStatsDto>("/api/dashboard/stats"),
      );
      prefetchInfiniteIfStale(
        queryClient,
        ["transactions", "", "all", "all", "", ""],
        () =>
          fetchJson<TransactionsPage>("/api/transactions?limit=10").then(
            (res) => ({
              transactions: res.transactions ?? [],
              nextCursor: res.nextCursor ?? null,
            }),
          ),
      );
      break;
    case "/transactions":
      prefetchInfiniteIfStale(
        queryClient,
        ["transactions", "", "all", "all", "", ""],
        () =>
          fetchJson<TransactionsPage>("/api/transactions?limit=10").then(
            (res) => ({
              transactions: res.transactions ?? [],
              nextCursor: res.nextCursor ?? null,
            }),
          ),
      );
      prefetchIfStale(queryClient, ["transactions-meta"], () =>
        fetchJson("/api/transactions/filters"),
      );
      break;
    case "/analytics":
      prefetchAnalyticsPeriods(queryClient);
      break;
    case "/ai-intelligence":
      prefetchIfStale(queryClient, ["intelligence"], () =>
        fetchJson<IntelligenceResponse>("/api/intelligence"),
      );
      break;
    case "/payment-links":
      prefetchInfiniteIfStale(queryClient, ["payment-links", undefined], () =>
        fetchJson<PaymentLinksResponse>("/api/payment-links?limit=10"),
      );
      break;
    case "/settlements":
      prefetchInfiniteIfStale(queryClient, ["settlements"], () =>
        fetchJson<SettlementsResponse>("/api/settlements?limit=10"),
      );
      break;
    default:
      break;
  }
}
