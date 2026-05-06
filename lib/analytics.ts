import { unstable_cache } from "next/cache";
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

function buildPeakHours(transactions: Pick<Transaction, "createdAt">[]): PeakHourPoint[] {
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
  const cachedFn = unstable_cache(
    async (uid: string, p: Period) => {
      const days = periodToDays(p);
      const today = startOfUtcDay(new Date());
      const startDate = addDays(today, -(days - 1));

      const transactions = await prisma.transaction.findMany({
        where: {
          userId: uid,
          createdAt: {
            gte: startDate,
          },
        },
        select: {
          createdAt: true,
          status: true,
          amount: true,
          country: true,
          currency: true,
          paymentMethod: true,
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
    },
    ["analytics"],
    { revalidate: 300, tags: [`analytics-${userId}`] }
  );

  return cachedFn(userId, period);
}

export async function getDashboardStats(userId: string): Promise<DashboardStatsDto> {
  const cachedFn = unstable_cache(
    async (uid: string) => {
      const now = new Date();
      const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

      const [transactionsCount, successAgg, activePaymentLinks] = await Promise.all([
        prisma.transaction.count({
          where: {
            userId: uid,
            createdAt: {
              gte: monthStart,
            },
          },
        }),
        prisma.transaction.aggregate({
          where: {
            userId: uid,
            status: "success",
            createdAt: {
              gte: monthStart,
            },
          },
          _sum: { amount: true },
          _count: true,
        }),
        prisma.paymentLink.count({
          where: {
            userId: uid,
            status: "active",
          },
        }),
      ]);

      const successCount = successAgg._count;
      const totalRevenue = successAgg._sum.amount ?? 0;

      return {
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalTransactions: transactionsCount,
        successRate: percentage(successCount, transactionsCount),
        activePaymentLinks,
      };
    },
    ["dashboard-stats"],
    { revalidate: 300, tags: [`dashboard-stats-${userId}`] }
  );

  return cachedFn(userId);
}

export async function buildMerchantContext(userId: string): Promise<string> {
  const cachedFn = unstable_cache(
    async (uid: string) => {
      const [user, analytics, failedTransactions] = await Promise.all([
        prisma.user.findUnique({
          where: {
            id: uid,
          },
          select: {
            businessName: true,
          },
        }),
        getAnalytics(uid, "30d"),
        prisma.transaction.count({
          where: {
            userId: uid,
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
    },
    ["merchant-context"],
    { revalidate: 300, tags: [`merchant-context-${userId}`] }
  );

  return cachedFn(userId);
}
