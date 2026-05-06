"use client";

import { useQuery } from "@tanstack/react-query";

type ExchangeRatesResponse = {
  result: string;
  provider: string;
  base_code: string;
  rates: Record<string, number>;
};

export function useExchangeRates() {
  return useQuery({
    queryKey: ["exchange-rates"],
    queryFn: async (): Promise<ExchangeRatesResponse> => {

      const response = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
      if (!response.ok) {
        throw new Error("Failed to fetch exchange rates");
      }
      return response.json();
    },

    refetchInterval: 5 * 60 * 1000,
    staleTime: 5 * 60 * 1000,
  });
}
