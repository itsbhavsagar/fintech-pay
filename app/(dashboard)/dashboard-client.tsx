"use client";

import { CreditCard, Link2, Percent, TrendingUp } from "lucide-react";
import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { DashboardContentLoader } from "@/components/layout/ContentAreaLoader";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { TransactionTable } from "@/components/dashboard/TransactionTable";
import { TransactionDetail } from "@/components/transactions/TransactionDetail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SkeletonChart, SkeletonDashboardTransactionTable } from "@/components/ui/skeleton";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import {
  useTransactions,
  type TransactionFilters,
} from "@/hooks/useTransactions";
import { isPeriodTransitioning } from "@/lib/query-config";
import { formatCompactNumber, formatPercent } from "@/lib/utils";
import type { Period, TransactionDto } from "@/types/domain";

const CountryMap = dynamic(
  () =>
    import("@/components/dashboard/CountryMap").then((mod) => mod.CountryMap),
  { ssr: false, loading: () => <SkeletonChart showHeader={false} /> },
);
const CurrencyBreakdownChart = dynamic(
  () =>
    import("@/components/dashboard/CurrencyBreakdownChart").then(
      (mod) => mod.CurrencyBreakdownChart,
    ),
  { ssr: false, loading: () => <SkeletonChart showHeader={false} /> },
);
const RevenueChart = dynamic(
  () =>
    import("@/components/dashboard/RevenueChart").then((mod) => mod.RevenueChart),
  { ssr: false, loading: () => <SkeletonChart /> },
);
const SuccessRateGauge = dynamic(
  () =>
    import("@/components/dashboard/SuccessRateGauge").then(
      (mod) => mod.SuccessRateGauge,
    ),
  { ssr: false, loading: () => <SkeletonChart showHeader={false} /> },
);

const recentFilters: TransactionFilters = {
  search: "",
  status: "all",
  currency: "all",
  from: "",
  to: "",
};

export function DashboardClient() {
  const [period, setPeriod] = useState<Period>("30d");
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionDto | null>(null);
  const dashboardStats = useDashboardStats();
  const analytics = useAnalytics(period);
  const transactions = useTransactions(recentFilters);
  const stats = dashboardStats.data;
  const chartData = analytics.data;
  const isPeriodLoading = isPeriodTransitioning(analytics);
  const isTransactionsLoading = transactions.isLoading && !transactions.data;
  const isInitialLoading =
    (!stats && dashboardStats.isLoading) || (!chartData && analytics.isLoading);
  const recentTransactions =
    transactions.data?.pages
      .flatMap((page) => page.transactions)
      .slice(0, 10) ?? [];

  if (isInitialLoading) {
    return <DashboardContentLoader />;
  }

  if (!stats || !chartData) {
    return (
      <p className="text-sm text-muted-foreground">
        Dashboard data is unavailable.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={formatCompactNumber(stats.totalRevenue)}
          helper="This month, all currencies"
          icon={TrendingUp}
        />
        <StatsCard
          title="Transactions"
          value={formatCompactNumber(stats.totalTransactions)}
          helper="Processed this month"
          icon={CreditCard}
        />
        <StatsCard
          title="Success Rate"
          value={formatPercent(stats.successRate)}
          helper="Captured vs total attempts"
          icon={Percent}
        />
        <StatsCard
          title="Active Links"
          value={formatCompactNumber(stats.activePaymentLinks)}
          helper="Open payment links"
          icon={Link2}
        />
      </div>

      <RevenueChart
        data={chartData.dailyRevenue}
        period={period}
        isLoading={isPeriodLoading}
        onPeriodChange={setPeriod}
      />

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Recent Transactions</CardTitle>
            <Link
              href="/transactions"
              className="text-sm font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {isTransactionsLoading ? (
              <SkeletonDashboardTransactionTable />
            ) : (
              <TransactionTable
                transactions={recentTransactions}
                onSelect={setSelectedTransaction}
              />
            )}
          </CardContent>
        </Card>
        <CurrencyBreakdownChart
          data={chartData.currencyBreakdown}
          isLoading={isPeriodLoading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CountryMap data={chartData.countryBreakdown} isLoading={isPeriodLoading} />
        <SuccessRateGauge value={chartData.successRate} isLoading={isPeriodLoading} />
      </div>

      <TransactionDetail
        transaction={selectedTransaction}
        open={Boolean(selectedTransaction)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTransaction(null);
          }
        }}
      />
    </div>
  );
}
