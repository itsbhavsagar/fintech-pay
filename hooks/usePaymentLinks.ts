"use client";

import { keepPreviousData, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJson } from "@/lib/fetcher";
import type { PaymentLinkDto } from "@/types/domain";

export type CreatePaymentLinkInput = {
  title: string;
  amount: number;
  currency: string;
  expiresAt: string | null;
};

export type PaymentLinkFilters = {
  search?: string;
  status?: string;
  month?: string;
};

type PaymentLinksResponse = {
  paymentLinks: PaymentLinkDto[];
  nextCursor: string | null;
};

export function usePaymentLinks(filters?: PaymentLinkFilters) {
  return useInfiniteQuery({
    queryKey: ["payment-links", filters],
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam }) => {
      const searchParams = new URLSearchParams({ limit: "10" });
      if (pageParam) searchParams.set("cursor", pageParam);
      if (filters?.search) searchParams.set("search", filters.search);
      if (filters?.status) searchParams.set("status", filters.status);
      if (filters?.month) searchParams.set("month", filters.month);
      const queryStr = searchParams.toString();
      return fetchJson<PaymentLinksResponse>(`/api/payment-links${queryStr ? `?${queryStr}` : ""}`);
    },
    getNextPageParam: (lastPage) => lastPage?.nextCursor ?? undefined,
    placeholderData: keepPreviousData,
    staleTime: 60000,
    gcTime: 300000,
  });
}

export function useCreatePaymentLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePaymentLinkInput) =>
      fetchJson<{ paymentLink: PaymentLinkDto }>("/api/razorpay/create-link", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["payment-links"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["analytics"],
      });
    },
  });
}
