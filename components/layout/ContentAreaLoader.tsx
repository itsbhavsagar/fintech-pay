import {
  Skeleton,
  SkeletonAnomalyList,
  SkeletonChart,
  SkeletonDashboardTransactionTable,
  SkeletonHeatmap,
  SkeletonPageHeader,
  SkeletonPaymentLinkCard,
  SkeletonPaymentLinkTable,
  SkeletonSettingsPage,
  SkeletonSettlementSummary,
  SkeletonStatsCard,
} from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function DashboardContentLoader() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <SkeletonStatsCard key={index} />
        ))}
      </div>
      <SkeletonChart />
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-16" />
          </CardHeader>
          <CardContent>
            <SkeletonDashboardTransactionTable />
          </CardContent>
        </Card>
        <SkeletonChart />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <SkeletonChart />
        <SkeletonChart showHeader={false} />
      </div>
    </div>
  );
}

export function AnalyticsContentLoader() {
  return (
    <div className="space-y-6">
      <SkeletonPageHeader titleWidth="w-64" subtitleWidth="w-96" />
      <div className="grid gap-6 xl:grid-cols-2">
        <SkeletonChart />
        <SkeletonChart />
      </div>
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <SkeletonChart />
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-44" />
          </CardHeader>
          <CardContent>
            <SkeletonHeatmap />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function IntelligenceContentLoader() {
  return (
    <div className="space-y-6 pb-12">
      <SkeletonPageHeader titleWidth="w-72" subtitleWidth="w-[28rem]" />
      <div className="grid gap-4 md:grid-cols-3">
        <SkeletonStatsCard />
        <SkeletonStatsCard />
        <SkeletonStatsCard />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <Skeleton className="h-5 w-44" />
            <div className="space-y-1 text-right">
              <Skeleton className="ml-auto h-3 w-20" />
              <Skeleton className="ml-auto h-7 w-24" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton variant="chart" className="h-80" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-36" />
          </CardHeader>
          <CardContent>
            <SkeletonAnomalyList />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function PaymentLinksContentLoader({ viewMode }: { viewMode: "grid" | "list" }) {
  if (viewMode === "list") {
    return <SkeletonPaymentLinkTable />;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {Array.from({ length: 4 }, (_, index) => (
        <SkeletonPaymentLinkCard key={index} />
      ))}
    </div>
  );
}

export { SkeletonSettingsPage, SkeletonSettlementSummary };
