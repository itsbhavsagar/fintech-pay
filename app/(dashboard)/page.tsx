"use client";

import { CreditCard, Link2, Percent, TrendingUp } from "lucide-react";
import { useState } from "react";
import { CountryMap } from "@/components/dashboard/CountryMap";
import { CurrencyBreakdownChart } from "@/components/dashboard/CurrencyBreakdownChart";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { SuccessRateGauge } from "@/components/dashboard/SuccessRateGauge";
import { TransactionTable } from "@/components/dashboard/TransactionTable";
import { TransactionDetail } from "@/components/transactions/TransactionDetail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  SkeletonStatsCard,
  SkeletonChart,
  SkeletonTransactionTable,
} from "@/components/ui/skeleton";
import { useAnalytics } from "@/hooks/useAnalytics";
import {
  useTransactions,
  type TransactionFilters,
} from "@/hooks/useTransactions";
import { formatCompactNumber, formatPercent } from "@/lib/utils";
import type { Period, TransactionDto } from "@/types/domain";

const recentFilters: TransactionFilters = {
  search: "",
  status: "all",
  currency: "all",
  from: "",
  to: "",
};

export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>("30d");
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionDto | null>(null);
  const analytics = useAnalytics(period);
  const transactions = useTransactions(recentFilters);
  const data = analytics.data;
  const isInitialLoading = analytics.isLoading && !data;
  const isRefreshing = analytics.isFetching && Boolean(data);
  const recentTransactions =
    transactions.data?.pages
      .flatMap((page) => page.transactions)
      .slice(0, 10) ?? [];

  if (isInitialLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <SkeletonStatsCard key={index} />
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Card>
            <CardHeader>
              <div className="h-5 w-48" />
            </CardHeader>
            <CardContent>
              <SkeletonTransactionTable />
            </CardContent>
          </Card>
          <SkeletonChart />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <SkeletonChart />
          <SkeletonChart />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <p className="text-sm text-muted-foreground">
        Analytics data is unavailable.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={formatCompactNumber(data.stats.totalRevenue)}
          helper="This month, all currencies"
          icon={TrendingUp}
        />
        <StatsCard
          title="Transactions"
          value={formatCompactNumber(data.stats.totalTransactions)}
          helper="Processed this month"
          icon={CreditCard}
        />
        <StatsCard
          title="Success Rate"
          value={formatPercent(data.stats.successRate)}
          helper="Captured vs total attempts"
          icon={Percent}
        />
        <StatsCard
          title="Active Links"
          value={formatCompactNumber(data.stats.activePaymentLinks)}
          helper="Open payment links"
          icon={Link2}
        />
      </div>

      <RevenueChart
        data={data.dailyRevenue}
        period={period}
        isFetching={isRefreshing}
        onPeriodChange={setPeriod}
      />

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionTable
              transactions={recentTransactions}
              onSelect={setSelectedTransaction}
            />
          </CardContent>
        </Card>
        <CurrencyBreakdownChart data={data.currencyBreakdown} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CountryMap data={data.countryBreakdown} />
        <SuccessRateGauge value={data.successRate} />
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
