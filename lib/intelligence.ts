import { unstable_cache } from "next/cache";
import type { Transaction } from "@prisma/client";
import { prisma } from "@/lib/prisma";

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

const dayInMs = 24 * 60 * 60 * 1000;

function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function dayKey(date: Date): string {
  return startOfUtcDay(date).toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * dayInMs);
}

function formatCurrency(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
  };
  const symbol = symbols[currency] ?? currency;
  if (amount >= 1_000_000) {
    return `${symbol}${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${symbol}${(amount / 1000).toFixed(1)}K`;
  }
  return `${symbol}${amount.toFixed(0)}`;
}

function computeAnomalies(transactions: Transaction[]): Anomaly[] {
  const anomalies: Anomaly[] = [];

  const dailyMap = new Map<
    string,
    {
      transactions: Transaction[];
      successful: number;
      failed: number;
    }
  >();

  const today = startOfUtcDay(new Date());
  for (let i = 0; i < 30; i++) {
    const day = dayKey(addDays(today, -(29 - i)));
    dailyMap.set(day, { transactions: [], successful: 0, failed: 0 });
  }

  for (const tx of transactions) {
    const day = dayKey(tx.createdAt);
    const dayData = dailyMap.get(day);
    if (dayData) {
      dayData.transactions.push(tx);
      if (tx.status === "captured" || tx.status === "success") {
        dayData.successful++;
      } else {
        dayData.failed++;
      }
    }
  }

  let totalByDay = 0;
  let totalSuccessfulByDay = 0;
  for (const dayData of dailyMap.values()) {
    totalByDay += dayData.transactions.length;
    totalSuccessfulByDay += dayData.successful;
  }
  const avgSuccessRate =
    totalByDay > 0 ? (totalSuccessfulByDay / totalByDay) * 100 : 0;

  for (const [day, dayData] of dailyMap) {
    const daySuccessRate =
      dayData.transactions.length > 0
        ? (dayData.successful / dayData.transactions.length) * 100
        : 0;

    if (
      dayData.transactions.length >= 5 &&
      daySuccessRate < 70 &&
      daySuccessRate < avgSuccessRate - 20
    ) {
      const failedByMethod = new Map<string, number>();
      const failedByCountry = new Map<string, number>();

      for (const tx of dayData.transactions) {
        if (tx.status !== "captured" && tx.status !== "success") {
          failedByMethod.set(
            tx.paymentMethod,
            (failedByMethod.get(tx.paymentMethod) ?? 0) + 1,
          );
          failedByCountry.set(
            tx.country,
            (failedByCountry.get(tx.country) ?? 0) + 1,
          );
        }
      }

      const topMethod = Array.from(failedByMethod.entries()).sort(
        (a, b) => b[1] - a[1],
      )[0];
      const topCountry = Array.from(failedByCountry.entries()).sort(
        (a, b) => b[1] - a[1],
      )[0];

      anomalies.push({
        type: "success_rate",
        severity: daySuccessRate < 50 ? "critical" : "warning",
        date: day,
        description: `Success rate dropped to ${daySuccessRate.toFixed(0)}% on ${new Date(day).toLocaleDateString("en-US", { month: "short", day: "numeric" })} — ${dayData.failed} failed ${topMethod?.[0] ?? "transactions"} ${topCountry ? `from ${topCountry[0]}` : ""}`,
        details: {
          successRate: daySuccessRate,
          failedCount: dayData.failed,
          method: topMethod?.[0],
          country: topCountry?.[0],
        },
      });
    }
  }

  const volumeByDay = new Map<string, number>();
  for (const [day, dayData] of dailyMap) {
    volumeByDay.set(day, dayData.transactions.length);
  }
  const avgVolume =
    Array.from(volumeByDay.values()).reduce((a, b) => a + b, 0) / 30;

  for (const [day, volume] of volumeByDay) {
    if (volume > avgVolume * 2) {
      anomalies.push({
        type: "volume_spike",
        severity: "info",
        date: day,
        description: `Transaction volume spiked to ${volume} on ${new Date(day).toLocaleDateString("en-US", { month: "short", day: "numeric" })} (${(volume / avgVolume).toFixed(1)}x average)`,
        details: {
          volume,
          average: avgVolume,
        },
      });
    }
  }

  const currencyStats = new Map<string, { total: number; failed: number }>();
  for (const tx of transactions) {
    const current = currencyStats.get(tx.currency) ?? {
      total: 0,
      failed: 0,
    };
    current.total++;
    if (tx.status !== "captured" && tx.status !== "success") {
      current.failed++;
    }
    currencyStats.set(tx.currency, current);
  }

  for (const [currency, stats] of currencyStats) {
    if (stats.total >= 5) {
      const failureRate = (stats.failed / stats.total) * 100;
      if (failureRate > 25) {
        anomalies.push({
          type: "failure_rate",
          severity: failureRate > 40 ? "critical" : "warning",
          date: "",
          description: `${currency} has ${failureRate.toFixed(0)}% failure rate (${stats.failed}/${stats.total} transactions)`,
          details: {
            currency,
            failureRate,
            failedCount: stats.failed,
            totalCount: stats.total,
          },
        });
      }
    }
  }

  return anomalies.sort((a, b) => {
    const severityRank = { critical: 0, warning: 1, info: 2 };
    return severityRank[a.severity] - severityRank[b.severity];
  });
}

function calculateForecast(dailyRevenue: Map<string, number>): {
  data: ForecastData[];
  forecastTotal: number;
} {
  const data: ForecastData[] = [];
  const today = startOfUtcDay(new Date());

  const days: [string, number][] = [];
  for (let i = 0; i < 30; i++) {
    const day = dayKey(addDays(today, -(29 - i)));
    const revenue = dailyRevenue.get(day) ?? 0;
    days.push([day, revenue]);
    data.push({
      date: new Date(day).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      revenue,
      isForecast: false,
    });
  }

  const n = days.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += days[i]?.[1] ?? 0;
    sumXY += i * (days[i]?.[1] ?? 0);
    sumX2 += i * i;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  let forecastTotal = 0;
  for (let i = 0; i < 7; i++) {
    const forecastDay = n + i;
    const predictedRevenue = Math.max(0, intercept + slope * forecastDay);
    forecastTotal += predictedRevenue;
    const date = addDays(today, i + 1);
    data.push({
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      revenue: predictedRevenue,
      isForecast: true,
    });
  }

  return { data, forecastTotal };
}

export async function getIntelligence(userId: string): Promise<IntelligenceResponse> {
  const cachedFn = unstable_cache(
    async (uid: string) => {
      const today = startOfUtcDay(new Date());
      const startDate = addDays(today, -29);

      const transactions = await prisma.transaction.findMany({
        where: {
          userId: uid,
          createdAt: {
            gte: startDate,
          },
        },
        select: {
          amount: true,
          status: true,
          createdAt: true,
          paymentMethod: true,
          country: true,
          currency: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      const anomalies = computeAnomalies(transactions as Transaction[]);
      const dailyRevenue = new Map<string, number>();
      for (let i = 0; i < 30; i++) {
        const day = dayKey(addDays(today, -(29 - i)));
        dailyRevenue.set(day, 0);
      }

      for (const tx of transactions) {
        const day = dayKey(tx.createdAt);
        if (dailyRevenue.has(day)) {
          dailyRevenue.set(day, (dailyRevenue.get(day) ?? 0) + tx.amount);
        }
      }

      const { data: forecastData, forecastTotal } =
        calculateForecast(dailyRevenue);

      const dayOfWeekStats = new Map<
        string,
        { successful: number; total: number }
      >();
      const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];

      for (const tx of transactions) {
        const dayName = dayNames[tx.createdAt.getUTCDay()] ?? "Monday";
        const current = dayOfWeekStats.get(dayName) ?? {
          successful: 0,
          total: 0,
        };
        current.total++;
        if (tx.status === "captured" || tx.status === "success") {
          current.successful++;
        }
        dayOfWeekStats.set(dayName, current);
      }

      let bestDay = "Monday";
      let bestRate = 0;
      for (const [day, stats] of dayOfWeekStats) {
        const rate = stats.total > 0 ? (stats.successful / stats.total) * 100 : 0;
        if (rate > bestRate) {
          bestRate = rate;
          bestDay = day;
        }
      }

      const countryRevenue = new Map<string, number>();
      for (const tx of transactions) {
        countryRevenue.set(
          tx.country,
          (countryRevenue.get(tx.country) ?? 0) + tx.amount,
        );
      }

      let topCountry = "Unknown";
      let topRevenue = 0;
      let topCurrency = "USD";

      for (const [country, revenue] of countryRevenue) {
        if (revenue > topRevenue) {
          topRevenue = revenue;
          topCountry = country;
        }
      }

      for (const tx of transactions) {
        if (tx.country === topCountry) {
          topCurrency = tx.currency;
          break;
        }
      }

      const methodStats = new Map<string, { total: number; failed: number }>();
      for (const tx of transactions) {
        const current = methodStats.get(tx.paymentMethod) ?? {
          total: 0,
          failed: 0,
        };
        current.total++;
        if (tx.status !== "captured" && tx.status !== "success") {
          current.failed++;
        }
        methodStats.set(tx.paymentMethod, current);
      }

      let riskiestMethod = "Card";
      let highestFailureRate = 0;
      for (const [method, stats] of methodStats) {
        if (stats.total >= 3) {
          const failureRate = (stats.failed / stats.total) * 100;
          if (failureRate > highestFailureRate) {
            highestFailureRate = failureRate;
            riskiestMethod = method;
          }
        }
      }

      const insights: Insight[] = [
        {
          title: "Best Performing Day",
          value: bestDay,
          description: `${bestRate.toFixed(0)}% avg success rate`,
          icon: "star",
        },
        {
          title: "Highest Revenue Country",
          value: topCountry,
          description: `${formatCurrency(topRevenue, topCurrency)} this month`,
          icon: "trending",
        },
        {
          title: "Payment Method to Watch",
          value: riskiestMethod,
          description: `${highestFailureRate.toFixed(0)}% failure rate`,
          icon: "alert",
        },
      ];

      return {
        anomalies,
        forecast: forecastData,
        forecastTotal: Math.round(forecastTotal),
        insights,
        transactionCount: transactions.length,
      };
    },
    ["intelligence"],
    { revalidate: 300, tags: [`intelligence-${userId}`] },
  );

  return cachedFn(userId);
}
