"use client";

import {
  keepPreviousData,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { fetchJson } from "@/lib/fetcher";
import { QUERY_STALE_TIME } from "@/lib/query-config";
import type {
  TransactionDto,
  TransactionsResponseDto,
  TransactionStatus,
} from "@/types/domain";

export type TransactionFilters = {
  search: string;
  status: TransactionStatus | "all";
  currency: string;
  from: string;
  to: string;
};

export const DEFAULT_TRANSACTION_FILTERS: TransactionFilters = {
  search: "",
  status: "all",
  currency: "all",
  from: "",
  to: "",
};

function buildTransactionsUrl(
  filters: TransactionFilters,
  cursor?: string | null,
): string {
  const params = new URLSearchParams({ limit: "10" });

  if (cursor) params.set("cursor", cursor);
  if (filters.search?.trim()) params.set("search", filters.search.trim());
  if (filters.status && filters.status !== "all")
    params.set("status", filters.status);
  if (filters.currency && filters.currency !== "all")
    params.set("currency", filters.currency);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);

  return `/api/transactions?${params.toString()}`;
}

export function useTransactions(
  filters: TransactionFilters,
  options?: {
    initialPage?: {
      transactions: TransactionDto[];
      nextCursor: string | null;
    };
  },
) {
  const safeFilters = {
    search: filters?.search ?? "",
    status: filters?.status ?? "all",
    currency: filters?.currency ?? "all",
    from: filters?.from ?? "",
    to: filters?.to ?? "",
  };

  return useInfiniteQuery({
    queryKey: [
      "transactions",
      safeFilters.search,
      safeFilters.status,
      safeFilters.currency,
      safeFilters.from,
      safeFilters.to,
    ],

    initialPageParam: null as string | null,

    queryFn: async ({ pageParam }) => {
      const res = await fetchJson<TransactionsResponseDto>(
        buildTransactionsUrl(safeFilters, pageParam),
      );

      return {
        transactions: res?.transactions ?? [],
        nextCursor: res?.nextCursor ?? null,
      };
    },

    getNextPageParam: (lastPage) => lastPage?.nextCursor ?? undefined,

    placeholderData: keepPreviousData,
    staleTime: QUERY_STALE_TIME,
    gcTime: QUERY_STALE_TIME * 2,
    refetchOnMount: false,
    initialData: options?.initialPage
      ? {
          pages: [options.initialPage],
          pageParams: [null],
        }
      : undefined,
    initialDataUpdatedAt: options?.initialPage ? Date.now() : undefined,
  });
}
