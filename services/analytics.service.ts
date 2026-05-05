import type { Transaction } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const dayInMs = 24 * 60 * 60 * 1000;

function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * dayInMs);
}

function dayKey(date: Date): string {
  return startOfUtcDay(date).toISOString().slice(0, 10);
}

function percentage(part: number, total: number): number {
  if (total === 0) return 0;
  return Number(((part / total) * 100).toFixed(1));
}

/**
 Get analytics data for a user over a period
 */
export async function getAnalyticsForPeriod(userId: string, days: number) {
  const today = startOfUtcDay(new Date());
  const startDate = addDays(today, -(days - 1));

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      createdAt: {
        gte: startDate,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // Initialize daily map
  const dailyMap = new Map<
    string,
    { revenue: number; transactions: number; successful: number }
  >();
  for (let index = 0; index < days; index += 1) {
    const key = dayKey(addDays(startDate, index));
    dailyMap.set(key, { revenue: 0, transactions: 0, successful: 0 });
  }

  // Process transactions
  const countryMap = new Map<string, { value: number; revenue: number }>();
  const currencyMap = new Map<string, { value: number; revenue: number }>();
  const methodMap = new Map<string, { value: number; revenue: number }>();

  for (const tx of transactions) {
    const key = dayKey(tx.createdAt);
    const day = dailyMap.get(key);

    if (day) {
      day.transactions += 1;
      day.revenue += tx.amount;

      if (tx.status === "captured" || tx.status === "success") {
        day.successful += 1;
      }
    }

    // Country breakdown
    const countryData = countryMap.get(tx.country) ?? { value: 0, revenue: 0 };
    countryData.value += 1;
    countryData.revenue += tx.amount;
    countryMap.set(tx.country, countryData);

    // Currency breakdown
    const currency = tx.currency.toUpperCase();
    const currencyData = currencyMap.get(currency) ?? { value: 0, revenue: 0 };
    currencyData.value += 1;
    currencyData.revenue += tx.amount;
    currencyMap.set(currency, currencyData);

    // Method breakdown
    const methodData = methodMap.get(tx.paymentMethod) ?? {
      value: 0,
      revenue: 0,
    };
    methodData.value += 1;
    methodData.revenue += tx.amount;
    methodMap.set(tx.paymentMethod, methodData);
  }

  // Compute aggregates
  let totalRevenue = 0;
  let totalTransactions = 0;
  let totalSuccessful = 0;

  for (const day of dailyMap.values()) {
    totalRevenue += day.revenue;
    totalTransactions += day.transactions;
    totalSuccessful += day.successful;
  }

  const successRate = percentage(totalSuccessful, totalTransactions);

  // Format daily revenue
  const dailyRevenue = Array.from(dailyMap.entries()).map(([date, data]) => ({
    date: new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    revenue: data.revenue,
  }));

  // Sort and limit breakdowns
  const countryBreakdown = Array.from(countryMap.entries())
    .map(([name, point]) => ({
      name,
      value: point.value,
      revenue: Number(point.revenue.toFixed(2)),
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  const paymentMethodBreakdown = Array.from(methodMap.entries())
    .map(([name, point]) => ({
      name,
      value: point.value,
      revenue: Number(point.revenue.toFixed(2)),
    }))
    .sort((a, b) => b.value - a.value);

  const currencyBreakdown = Array.from(currencyMap.entries())
    .map(([name, point]) => ({
      name,
      value: point.value,
      revenue: Number(point.revenue.toFixed(2)),
    }))
    .sort((a, b) => b.revenue - a.revenue);

  return {
    stats: {
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalTransactions,
      successRate,
      activePaymentLinks: 0, // TODO: fetch from DB
    },
    dailyRevenue,
    countryBreakdown,
    paymentMethodBreakdown,
    currencyBreakdown,
    successRateOverTime: [], // TODO: compute per-day success rate
    peakHours: [], // TODO: compute peak hours
  };
}

/**
 * Get dashboard stats
 */
export async function getDashboardStats(userId: string) {
  const today = startOfUtcDay(new Date());
  const startDate = addDays(today, -29); // Last 30 days

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      createdAt: {
        gte: startDate,
      },
    },
  });

  const successful = transactions.filter(
    (t) => t.status === "captured" || t.status === "success",
  ).length;

  const paymentLinks = await prisma.paymentLink.count({
    where: {
      userId,
      status: "active",
    },
  });

  return {
    totalRevenue: Number(
      transactions.reduce((sum, t) => sum + t.amount, 0).toFixed(2),
    ),
    totalTransactions: transactions.length,
    successRate: percentage(successful, transactions.length),
    activePaymentLinks: paymentLinks,
  };
}
