"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/fetcher";
import type { TransactionDto, TransactionsResponseDto, TransactionStatus } from "@/types/domain";

export type TransactionFilters = {
  search: string;
  status: TransactionStatus | "all";
  currency: string;
  from: string;
  to: string;
};

function buildTransactionsUrl(filters: TransactionFilters, cursor?: string | null): string {
  const params = new URLSearchParams({
    limit: "10",
  });

  if (cursor) {
    params.set("cursor", cursor);
  }

  if (filters.search.trim()) {
    params.set("search", filters.search.trim());
  }

  if (filters.status !== "all") {
    params.set("status", filters.status);
  }

  if (filters.currency !== "all") {
    params.set("currency", filters.currency);
  }

  if (filters.from) {
    params.set("from", filters.from);
  }

  if (filters.to) {
    params.set("to", filters.to);
  }

  return `/api/transactions?${params.toString()}`;
}

export function useTransactions(filters: TransactionFilters) {
  return useInfiniteQuery({
    queryKey: ["transactions", filters],
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) => fetchJson<TransactionsResponseDto>(buildTransactionsUrl(filters, pageParam)),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

export function useTransaction(id: string | null) {
  return useQuery({
    queryKey: ["transaction", id],
    enabled: Boolean(id),
    queryFn: () => fetchJson<{ transaction: TransactionDto }>(`/api/transactions/${id}`),
  });
}
