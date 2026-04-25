import type { Transaction } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { periodToDays } from "@/lib/utils";
import type { AnalyticsDto, BreakdownPoint, DashboardStatsDto, PeakHourPoint, Period } from "@/types/domain";

const dayInMs = 24 * 60 * 60 * 1000;
const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * dayInMs);
}

function dayKey(date: Date): string {
  return startOfUtcDay(date).toISOString().slice(0, 10);
}

function percentage(part: number, total: number): number {
  if (total === 0) {
    return 0;
  }

  return Number(((part / total) * 100).toFixed(1));
}

function pushBreakdown(map: Map<string, { value: number; revenue: number }>, name: string, amount: number): void {
  const current = map.get(name) ?? { value: 0, revenue: 0 };
  map.set(name, {
    value: current.value + 1,
    revenue: current.revenue + amount,
  });
}

function toBreakdown(map: Map<string, { value: number; revenue: number }>, limit?: number): BreakdownPoint[] {
  const items = Array.from(map.entries())
    .map(([name, point]) => ({
      name,
      value: point.value,
      revenue: Number(point.revenue.toFixed(2)),
    }))
    .sort((a, b) => b.revenue - a.revenue);

  return typeof limit === "number" ? items.slice(0, limit) : items;
}

function buildPeakHours(transactions: Transaction[]): PeakHourPoint[] {
  const matrix = new Map<string, number>();

  for (const day of dayLabels) {
    for (let hour = 0; hour < 24; hour += 1) {
      matrix.set(`${day}-${hour}`, 0);
    }
  }

  for (const transaction of transactions) {
    const day = dayLabels[transaction.createdAt.getUTCDay()];
    const hour = transaction.createdAt.getUTCHours();
    const key = `${day}-${hour}`;
    matrix.set(key, (matrix.get(key) ?? 0) + 1);
  }

  return dayLabels.flatMap((day) =>
    Array.from({ length: 24 }, (_, hour) => ({
      day,
      hour,
      volume: matrix.get(`${day}-${hour}`) ?? 0,
    })),
  );
}

export async function getAnalytics(userId: string, period: Period): Promise<AnalyticsDto> {
  const days = periodToDays(period);
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

  const dailyMap = new Map<string, { revenue: number; transactions: number; successful: number }>();
  const countryMap = new Map<string, { value: number; revenue: number }>();
  const currencyMap = new Map<string, { value: number; revenue: number }>();
  const methodMap = new Map<string, { value: number; revenue: number }>();

  for (let index = 0; index < days; index += 1) {
    const key = dayKey(addDays(startDate, index));
    dailyMap.set(key, { revenue: 0, transactions: 0, successful: 0 });
  }

  let successCount = 0;
  let totalRevenue = 0;

  for (const transaction of transactions) {
    const isSuccess = transaction.status === "success";
    const revenue = isSuccess ? transaction.amount : 0;
    const key = dayKey(transaction.createdAt);
    const daily = dailyMap.get(key) ?? { revenue: 0, transactions: 0, successful: 0 };

    dailyMap.set(key, {
      revenue: daily.revenue + revenue,
      transactions: daily.transactions + 1,
      successful: daily.successful + (isSuccess ? 1 : 0),
    });

    if (isSuccess) {
      successCount += 1;
      totalRevenue += transaction.amount;
    }

    pushBreakdown(countryMap, transaction.country, revenue);
    pushBreakdown(currencyMap, transaction.currency, revenue);
    pushBreakdown(methodMap, transaction.paymentMethod, revenue);
  }

  const dailyRevenue = Array.from(dailyMap.entries()).map(([date, point]) => ({
    date,
    revenue: Number(point.revenue.toFixed(2)),
    transactions: point.transactions,
  }));

  const successRateOverTime = Array.from(dailyMap.entries()).map(([date, point]) => ({
    date,
    successRate: percentage(point.successful, point.transactions),
  }));

  return {
    dailyRevenue,
    countryBreakdown: toBreakdown(countryMap, 10),
    currencyBreakdown: toBreakdown(currencyMap),
    successRate: percentage(successCount, transactions.length),
    successRateOverTime,
    paymentMethodBreakdown: toBreakdown(methodMap),
    peakHours: buildPeakHours(transactions),
    totalRevenue: Number(totalRevenue.toFixed(2)),
    totalTransactions: transactions.length,
  };
}

export async function getDashboardStats(userId: string): Promise<DashboardStatsDto> {
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  const [transactions, activePaymentLinks] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        userId,
        createdAt: {
          gte: monthStart,
        },
      },
    }),
    prisma.paymentLink.count({
      where: {
        userId,
        status: "active",
      },
    }),
  ]);

  const successCount = transactions.filter((transaction) => transaction.status === "success").length;
  const totalRevenue = transactions
    .filter((transaction) => transaction.status === "success")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  return {
    totalRevenue: Number(totalRevenue.toFixed(2)),
    totalTransactions: transactions.length,
    successRate: percentage(successCount, transactions.length),
    activePaymentLinks,
  };
}

export async function buildMerchantContext(userId: string): Promise<string> {
  const [user, analytics, failedTransactions] = await Promise.all([
    prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        businessName: true,
      },
    }),
    getAnalytics(userId, "30d"),
    prisma.transaction.count({
      where: {
        userId,
        status: "failed",
        createdAt: {
          gte: addDays(startOfUtcDay(new Date()), -29),
        },
      },
    }),
  ]);

  const topCountry = analytics.countryBreakdown[0]?.name ?? "N/A";
  const topCurrency = analytics.currencyBreakdown[0]?.name ?? "N/A";

  return [
    `Merchant: ${user?.businessName ?? "Unnamed merchant"}`,
    `Last 30 days revenue: ${analytics.totalRevenue.toFixed(2)}`,
    `Success rate: ${analytics.successRate}%`,
    `Top country: ${topCountry}`,
    `Top currency: ${topCurrency}`,
    `Recent failed transactions: ${failedTransactions}`,
  ].join("\n");
}
