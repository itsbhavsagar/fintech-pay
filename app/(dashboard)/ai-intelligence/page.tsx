"use client";

import {
  AlertCircle,
  Info,
  Loader2,
  Send,
  Star,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FloatingAIAssistant } from "@/components/shared/FloatingAIAssistant";
import { Skeleton, SkeletonChart, SkeletonStatsCard } from "@/components/ui/skeleton";
import {
  useIntelligence,
  type Anomaly,
  type Insight,
} from "@/hooks/useIntelligence";
import { formatCompactNumber } from "@/lib/utils";

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-500/10 text-red-700 border-red-200",
  warning: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
  info: "bg-blue-500/10 text-blue-700 border-blue-200",
};

const ANOMALY_ICONS: Record<string, React.ReactNode> = {
  success_rate: <AlertCircle className="size-4 text-red-500" />,
  failure_rate: <AlertCircle className="size-4 text-red-500" />,
  volume_spike: <TrendingUp className="size-4 text-blue-500" />,
};

const INSIGHT_ICONS: Record<string, React.ReactNode> = {
  star: <Star className="size-5 text-yellow-500" />,
  trending: <TrendingUp className="size-5 text-green-500" />,
  alert: <AlertCircle className="size-5 text-orange-500" />,
};

const chartTooltipStyle = {
  backgroundColor: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  color: "var(--popover-foreground)",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
};

function AnomalyRow({ anomaly }: { anomaly: Anomaly }) {
  return (
    <div className="flex items-center justify-between rounded-xl border bg-card/50 p-4 transition-all hover:border-primary/50 group">
      <div className="flex items-center gap-4">
        <div className="size-8 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
          {ANOMALY_ICONS[anomaly.type] ?? <Info className="size-4 text-muted-foreground" />}
        </div>
        <div className="space-y-0.5">
          <p className="text-sm font-semibold leading-relaxed">
            {anomaly.description}
          </p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Detected recently
          </p>
        </div>
      </div>
      <Badge variant="outline" className={`${SEVERITY_COLORS[anomaly.severity]} text-[10px] px-2 h-5`}>
        {anomaly.severity}
      </Badge>
    </div>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  return (
    <Card className="hover:border-primary/30 transition-all">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {insight.title}
        </CardTitle>
        {INSIGHT_ICONS[insight.icon]}
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold tracking-tight">{insight.value}</p>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
          {insight.description}
        </p>
      </CardContent>
    </Card>
  );
}

function buildChartData(
  forecast: { date: string; revenue: number; isForecast: boolean }[],
) {
  const data = forecast.map((d) => ({
    date: d.date,
    actual: d.isForecast ? null : d.revenue,
    forecast: d.isForecast ? d.revenue : null,
  }));

  const lastActualIndex = [...forecast]
    .map((d, i) => (!d.isForecast ? i : -1))
    .filter((i) => i !== -1)
    .pop();

  if (lastActualIndex !== undefined) {
    data[lastActualIndex].forecast = data[lastActualIndex].actual;
  }

  return data;
}

export default function AIIntelligencePage() {
  const intelligence = useIntelligence();
  const data = intelligence.data;
  const isInitialLoading = intelligence.isLoading && !data;
  const isRefreshing = intelligence.isFetching && Boolean(data);

  if (isInitialLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <SkeletonStatsCard />
          <SkeletonStatsCard />
          <SkeletonStatsCard />
        </div>
        <Card className="p-6">
          <SkeletonChart />
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Unable to load intelligence data. Please try again later.
        </CardContent>
      </Card>
    );
  }

  const chartData = buildChartData(data.forecast);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Payment Intelligence</h1>
            <Sparkles className="size-5 text-primary animate-pulse" />
          </div>
          <p className="text-sm text-muted-foreground">
            AI-generated behavioral insights and predictive forecasting.
          </p>
        </div>
        {isRefreshing && (
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {data.anomalies.some((a) => a.severity === "critical") && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-600 flex items-center gap-3">
          <AlertCircle className="size-4" />
          <span className="font-semibold">Critical payment anomalies detected.</span>
          <span className="opacity-80">Check the report below for immediate mitigation steps.</span>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {data.insights.map((insight) => (
          <InsightCard key={insight.title} insight={insight} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card className="relative overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>7-Day Revenue Forecast</CardTitle>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Predicted total</p>
                <p className="text-xl font-bold">
                  ₹{formatCompactNumber(data.forecastTotal)}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="min-h-[360px]">
            {isRefreshing && (
              <div className="absolute inset-x-6 bottom-6 top-20 z-10 bg-card/50 backdrop-blur-[2px]">
                <SkeletonChart showHeader={false} />
              </div>
            )}
            <div className={`h-80 transition-opacity duration-300 ${isRefreshing ? "opacity-0" : "opacity-100"}`}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ left: -20, right: 12, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--muted-foreground)" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="var(--muted-foreground)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10 }}
                    interval="preserveStartEnd"
                    className="text-[10px] uppercase text-muted-foreground"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => "₹" + formatCompactNumber(Number(v))}
                    className="text-[10px]"
                  />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    itemStyle={{ fontSize: "12px", fontWeight: "600" }}
                    labelStyle={{ fontSize: "10px", color: "var(--muted-foreground)", marginBottom: "4px" }}
                    formatter={(value, name) => [
                      "₹" + formatCompactNumber(Number(value)),
                      name === "actual" ? "Actual Revenue" : "AI Forecast",
                    ]}
                  />
                  <Area
                    type="linear"
                    dataKey="actual"
                    stroke="var(--primary)"
                    strokeWidth={2.5}
                    fill="url(#actualGradient)"
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0, fill: "var(--primary)" }}
                  />
                  <Area
                    type="linear"
                    dataKey="forecast"
                    stroke="var(--muted-foreground)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fill="url(#forecastGradient)"
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0, fill: "var(--muted-foreground)" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-4 flex items-center justify-center gap-6 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="h-0.5 w-6 bg-primary" />
                  <span>Historical Trend</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-0.5 w-6 border-t-2 border-dashed border-muted-foreground" />
                  <span>AI Prediction</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Anomalies Detected</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 space-y-3">
            {data.anomalies.length > 0 ? (
              data.anomalies.map((anomaly, i) => (
                <AnomalyRow key={i} anomaly={anomaly} />
              ))
            ) : (
              <div className="flex h-full flex-col items-center justify-center space-y-2 opacity-50">
                <Sparkles className="size-8" />
                <p className="text-sm">No anomalies found.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <FloatingAIAssistant />
    </div>
  );
}
