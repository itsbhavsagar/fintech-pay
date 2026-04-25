"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchJson } from "@/lib/fetcher";
import type { PaymentLinkDto } from "@/types/domain";

export type CreatePaymentLinkInput = {
  title: string;
  amount: number;
  currency: string;
  expiresAt: string | null;
};

export function usePaymentLinks() {
  return useQuery({
    queryKey: ["payment-links"],
    queryFn: () => fetchJson<{ paymentLinks: PaymentLinkDto[] }>("/api/payment-links"),
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
