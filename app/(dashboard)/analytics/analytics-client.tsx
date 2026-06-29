"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { AnalyticsContentLoader } from "@/components/layout/ContentAreaLoader";
import { Button } from "@/components/ui/button";
import { SkeletonChart } from "@/components/ui/skeleton";
import { useAnalytics } from "@/hooks/useAnalytics";
import { isPeriodTransitioning } from "@/lib/query-config";
import { cn } from "@/lib/utils";
import type { Period } from "@/types/domain";

const AnalyticsCharts = dynamic(
  () =>
    import("@/components/analytics/AnalyticsCharts").then(
      (mod) => mod.AnalyticsCharts,
    ),
  { ssr: false, loading: () => <SkeletonChart /> },
);

const periods: readonly Period[] = ["7d", "30d", "90d"];

export function AnalyticsClient() {
  const [period, setPeriod] = useState<Period>("30d");
  const [activeMethodIndex, setActiveMethodIndex] = useState<number | null>(null);

  const analytics = useAnalytics(period);
  const data = analytics.data;
  const isPeriodLoading = isPeriodTransitioning(analytics);

  if (!data && analytics.isLoading) {
    return <AnalyticsContentLoader />;
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-normal">
            Analytics Intelligence
          </h1>
          <p className="text-sm text-muted-foreground">
            Comprehensive behavioral insights across all transaction vectors.
          </p>
        </div>
        <div className="flex rounded-md border p-1 bg-card">
          {periods.map((item) => (
            <Button
              key={item}
              size="sm"
              variant={period === item ? "default" : "ghost"}
              onClick={() => setPeriod(item)}
              className={cn(
                "text-xs h-7 px-3 interact-premium",
                period === item ? "shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item}
            </Button>
          ))}
        </div>
      </div>

      <AnalyticsCharts
        data={data}
        activeMethodIndex={activeMethodIndex}
        onMethodIndexChange={setActiveMethodIndex}
        isPeriodLoading={isPeriodLoading}
      />
    </div>
  );
}
