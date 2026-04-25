"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/fetcher";

export interface Anomaly {
  type: "success_rate" | "volume_spike" | "failure_rate" | "zero_transactions";
  severity: "critical" | "warning" | "info";
  date: string;
  description: string;
  details?: Record<string, unknown>;
}

export interface ForecastData {
  date: string;
  revenue: number;
  isForecast: boolean;
}

export interface Insight {
  title: string;
  value: string;
  description: string;
  icon: "star" | "trending" | "alert";
}

export interface IntelligenceResponse {
  anomalies: Anomaly[];
  forecast: ForecastData[];
  forecastTotal: number;
  insights: Insight[];
  transactionCount: number;
}

export function useIntelligence() {
  return useQuery({
    queryKey: ["intelligence"],
    queryFn: () => fetchJson<IntelligenceResponse>("/api/intelligence"),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useIntelligenceQuery(query: string, date?: string) {
  return useQuery({
    queryKey: ["intelligence-query", query, date],
    queryFn: async () => {
      const response = await fetch("/api/intelligence/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, date }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch query response");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      let result = "";
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6)) as {
              token?: string;
              done?: boolean;
              error?: string;
              fullContent?: string;
            };

            if (data.error) {
              throw new Error(data.error);
            }

            if (data.token) {
              result += data.token;
            }

            if (data.done) {
              return result;
            }
          }
        }
      }

      return result;
    },
    enabled: query.length > 0,
  });
}
