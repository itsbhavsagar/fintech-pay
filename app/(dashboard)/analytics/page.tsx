"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SkeletonChart } from "@/components/ui/skeleton";
import { FloatingAIAssistant } from "@/components/shared/FloatingAIAssistant";
import { useAnalytics } from "@/hooks/useAnalytics";
import { formatCompactNumber } from "@/lib/utils";
import type { Period, BreakdownPoint } from "@/types/domain";

const periods: readonly Period[] = ["7d", "30d", "90d"];
const chartColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--primary)",
  "var(--success)",
] as const;

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const hours = [0, 3, 6, 9, 12, 15, 18, 21] as const;

const chartTooltipStyle = {
  backgroundColor: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  color: "var(--popover-foreground)",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
};

function heatClass(volume: number, max: number): string {
  if (max === 0 || volume === 0) return "bg-secondary/50";
  const ratio = volume / max;
  if (ratio > 0.8) return "bg-primary text-primary-foreground shadow-sm";
  if (ratio > 0.6) return "bg-primary/80 text-primary-foreground";
  if (ratio > 0.4) return "bg-primary/60";
  if (ratio > 0.2) return "bg-primary/40";
  return "bg-primary/20";
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>("30d");
  const [activeMethodIndex, setActiveMethodIndex] = useState<number | null>(null);
  
  const analytics = useAnalytics(period);
  const data = analytics.data;
  const isFetching = analytics.isFetching;
  const isInitialLoading = analytics.isLoading && !data;

  const maxHeatVolume = Math.max(...(data?.peakHours.map((p) => p.volume) ?? [0]), 0);
  const totalPaymentVolume = data?.paymentMethodBreakdown.reduce((acc, p) => acc + p.value, 0) ?? 0;
  const activeMethod = activeMethodIndex !== null ? data?.paymentMethodBreakdown[activeMethodIndex] : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-normal">Analytics Intelligence</h2>
          <p className="text-sm text-muted-foreground">Comprehensive behavioral insights across all transaction vectors.</p>
        </div>
        <div className="flex rounded-md border p-1 bg-card">
          {periods.map((item) => (
            <Button
              key={item}
              size="sm"
              variant={period === item ? "default" : "ghost"}
              onClick={() => setPeriod(item)}
              disabled={isFetching}
              className={`text-xs h-7 px-3 transition-colors ${period === item ? "shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              {item}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
  
        <Card className="relative overflow-hidden">
          <CardHeader>
            <CardTitle>Revenue by Country</CardTitle>
          </CardHeader>
          <CardContent className="min-h-[360px]">
            {isInitialLoading || (isFetching && !data) ? (
              <SkeletonChart showHeader={false} />
            ) : (
              <div className={`h-80 transition-opacity duration-300 ${isFetching ? "opacity-0 invisible" : "opacity-100 visible"}`}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.countryBreakdown ?? []} margin={{ top: 20 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} className="text-[10px] uppercase font-medium" />
                    <YAxis 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => formatCompactNumber(Number(value))} 
                      className="text-[10px]"
                    />
                    <Tooltip
                      contentStyle={chartTooltipStyle}
                      itemStyle={{ color: "var(--popover-foreground)", fontSize: "12px" }}
                      labelStyle={{ color: "var(--muted-foreground)", fontSize: "10px" }}
                      formatter={(value) => [formatCompactNumber(Number(value)), "Revenue"]}
                    />
                    <Bar dataKey="revenue" radius={[4, 4, 0, 0]} fill="var(--chart-1)" barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {isFetching && data && (
              <div className="absolute inset-x-6 bottom-6 top-20 z-10">
                <SkeletonChart showHeader={false} />
              </div>
            )}
          </CardContent>
        </Card>

      
        <Card className="relative overflow-hidden">
          <CardHeader>
            <CardTitle>Success Rate Over Time</CardTitle>
          </CardHeader>
          <CardContent className="min-h-[360px]">
             {isInitialLoading || (isFetching && !data) ? (
              <SkeletonChart showHeader={false} />
            ) : (
              <div className={`h-80 transition-opacity duration-300 ${isFetching ? "opacity-0 invisible" : "opacity-100 visible"}`}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.successRateOverTime ?? []} margin={{ top: 20 }}>
                    <defs>
                      <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--success)" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="var(--success)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} minTickGap={24} className="text-[10px]" />
                    <YAxis 
                      tickLine={false} 
                      axisLine={false} 
                      domain={[0, 100]} 
                      tickFormatter={(value) => `${value}%`} 
                      className="text-[10px]"
                    />
                    <Tooltip
                      contentStyle={chartTooltipStyle}
                      itemStyle={{ color: "var(--popover-foreground)", fontSize: "12px" }}
                      labelStyle={{ color: "var(--muted-foreground)", fontSize: "10px" }}
                      formatter={(value) => [`${Number(value).toFixed(1)}%`, "Success rate"]}
                    />
                    <Area
                      type="linear"
                      dataKey="successRate"
                      stroke="var(--success)"
                      strokeWidth={2.5}
                      fill="url(#successGradient)"
                      activeDot={{ r: 4, strokeWidth: 0, fill: "var(--success)" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
            {isFetching && data && (
              <div className="absolute inset-x-6 bottom-6 top-20 z-10">
                <SkeletonChart showHeader={false} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
  
        <Card className="relative overflow-hidden flex flex-col">
          <CardHeader>
            <CardTitle>Payment Method Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-between min-h-[420px]">
            <div className="relative h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.paymentMethodBreakdown ?? []}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={4}
                    stroke="none"
                    onMouseEnter={(_, index) => setActiveMethodIndex(index)}
                    onMouseLeave={() => setActiveMethodIndex(null)}
                  >
                    {(data?.paymentMethodBreakdown ?? []).map((entry, index) => (
                      <Cell 
                        key={entry.name} 
                        fill={chartColors[index % chartColors.length]} 
                        className="transition-all duration-300 focus:outline-none"
                        style={{
                          filter: activeMethodIndex === index ? "brightness(1.1)" : "none",
                          opacity: activeMethodIndex === null || activeMethodIndex === index ? 1 : 0.6,
                        }}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={() => null} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {activeMethod ? activeMethod.name : "Total Volume"}
                </span>
                <span className="text-2xl font-bold tracking-tight">
                  {formatCompactNumber(activeMethod ? activeMethod.value : totalPaymentVolume)}
                </span>
                {activeMethod && (
                  <span className="text-[10px] font-medium text-primary">
                    {((activeMethod.value / totalPaymentVolume) * 100).toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 px-2">
              {(data?.paymentMethodBreakdown ?? []).slice(0, 6).map((item, index) => (
                <div 
                  key={item.name} 
                  className={`flex items-center justify-between rounded-lg p-2 transition-colors ${
                    activeMethodIndex === index ? "bg-accent" : ""
                  }`}
                  onMouseEnter={() => setActiveMethodIndex(index)}
                  onMouseLeave={() => setActiveMethodIndex(null)}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: chartColors[index % chartColors.length] }}
                    />
                    <span className="text-xs font-semibold capitalize">{item.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatCompactNumber(item.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Peak Hours Heatmap */}
        <Card className="relative overflow-hidden">
          <CardHeader>
            <CardTitle>Peak Hours Heatmap</CardTitle>
          </CardHeader>
          <CardContent className="min-h-[420px]">
            <div className="space-y-4 overflow-x-auto pb-4">
              <div className="grid min-w-[620px] grid-cols-[52px_repeat(8,1fr)] gap-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                <span />
                {hours.map((hour) => (
                  <span key={hour} className="text-center">
                    {String(hour).padStart(2, "0")}:00
                  </span>
                ))}
              </div>
              <div className="space-y-2">
                {days.map((day) => (
                  <div key={day} className="grid min-w-[620px] grid-cols-[52px_repeat(8,1fr)] gap-2">
                    <div className="flex items-center text-[10px] font-bold text-muted-foreground uppercase">{day}</div>
                    {hours.map((hour) => {
                      const point = data?.peakHours.find((item) => item.day === day && item.hour === hour);
                      const volume = point?.volume ?? 0;

                      return (
                        <div
                          key={`${day}-${hour}`}
                          className={`flex h-10 items-center justify-center rounded-lg text-xs font-bold transition-all ${heatClass(volume, maxHeatVolume)}`}
                        >
                          {volume > 0 ? volume : ""}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-2 text-[10px] text-muted-foreground">
              <span>Less Busy</span>
              <div className="flex gap-1">
                {[0.2, 0.4, 0.6, 0.8, 1].map((r) => (
                  <div key={r} className="size-3 rounded-sm bg-primary" style={{ opacity: r }} />
                ))}
              </div>
              <span>More Busy</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <FloatingAIAssistant />
    </div>
  );
}

