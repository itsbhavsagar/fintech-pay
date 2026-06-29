"use client";

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
import { useMemo } from "react";
import { ChartLoadingShell } from "@/components/charts/ChartLoadingShell";
import { ChartTooltip } from "@/components/charts/ChartTooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getChartDotClass,
  getChartFill,
  HEAT_LEGEND_OPACITY_CLASSES,
  pieSliceClass,
} from "@/lib/chart-colors";
import { cn, formatCompactNumber } from "@/lib/utils";
import type { AnalyticsDto } from "@/types/domain";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const hours = [0, 3, 6, 9, 12, 15, 18, 21] as const;

function heatClass(volume: number, max: number): string {
  if (max === 0 || volume === 0) return "bg-secondary/50";
  const ratio = volume / max;
  if (ratio > 0.8) return "bg-primary text-primary-foreground shadow-sm";
  if (ratio > 0.6) return "bg-primary/80 text-primary-foreground";
  if (ratio > 0.4) return "bg-primary/60";
  if (ratio > 0.2) return "bg-primary/40";
  return "bg-primary/20";
}

type AnalyticsChartsProps = {
  data: AnalyticsDto;
  activeMethodIndex: number | null;
  onMethodIndexChange: (index: number | null) => void;
  isPeriodLoading: boolean;
};

export function AnalyticsCharts({
  data,
  activeMethodIndex,
  onMethodIndexChange,
  isPeriodLoading,
}: AnalyticsChartsProps) {
  const maxHeatVolume = Math.max(...data.peakHours.map((p) => p.volume), 0);
  const totalPaymentVolume = data.paymentMethodBreakdown.reduce(
    (acc, p) => acc + p.value,
    0,
  );
  const activeMethod =
    activeMethodIndex !== null
      ? data.paymentMethodBreakdown[activeMethodIndex]
      : null;

  const peakHoursMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const point of data.peakHours) {
      map.set(`${point.day}-${point.hour}`, point.volume);
    }
    return map;
  }, [data.peakHours]);

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="relative overflow-hidden">
          <CardHeader>
            <CardTitle>Revenue by Country</CardTitle>
          </CardHeader>
          <CardContent className="min-h-[360px]">
            <ChartLoadingShell isLoading={isPeriodLoading} className="h-80">
              <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.countryBreakdown} margin={{ top: 20 }}>
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    opacity={0.5}
                  />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    className="text-[10px] uppercase font-medium"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => formatCompactNumber(Number(value))}
                    className="text-[10px]"
                  />
                  <Tooltip content={<ChartTooltip valueLabel="Revenue" />} />
                  <Bar
                    dataKey="revenue"
                    radius={[4, 4, 0, 0]}
                    fill="var(--chart-1)"
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
              </div>
            </ChartLoadingShell>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader>
            <CardTitle>Success Rate Over Time</CardTitle>
          </CardHeader>
          <CardContent className="min-h-[360px]">
            <ChartLoadingShell isLoading={isPeriodLoading} className="h-80">
              <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.successRateOverTime} margin={{ top: 20 }}>
                  <defs>
                    <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--success)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="var(--success)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    opacity={0.5}
                  />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    minTickGap={24}
                    className="text-[10px]"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                    className="text-[10px]"
                  />
                  <Tooltip
                    content={
                      <ChartTooltip
                        valueLabel="Success rate"
                        formatValue={(value) => `${value.toFixed(1)}%`}
                      />
                    }
                  />
                  <Area
                    type="linear"
                    dataKey="successRate"
                    stroke="var(--success)"
                    strokeWidth={2.5}
                    fill="url(#successGradient)"
                    activeDot={{
                      r: 4,
                      strokeWidth: 0,
                      fill: "var(--success)",
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
              </div>
            </ChartLoadingShell>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card className="relative overflow-hidden flex flex-col">
          <CardHeader>
            <CardTitle>Payment Method Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-between min-h-[420px]">
            <ChartLoadingShell isLoading={isPeriodLoading} className="relative h-64 w-full">
              <div className="relative h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.paymentMethodBreakdown}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={4}
                    stroke="none"
                    onMouseEnter={(_, index) => onMethodIndexChange(index)}
                    onMouseLeave={() => onMethodIndexChange(null)}
                  >
                    {data.paymentMethodBreakdown.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={getChartFill(index)}
                        className={pieSliceClass(activeMethodIndex, index)}
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
                  {formatCompactNumber(
                    activeMethod ? activeMethod.value : totalPaymentVolume,
                  )}
                </span>
                {activeMethod && (
                  <span className="text-[10px] font-medium text-primary">
                    {((activeMethod.value / totalPaymentVolume) * 100).toFixed(1)}%
                  </span>
                )}
              </div>
              </div>
            </ChartLoadingShell>
            <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 px-2">
              {data.paymentMethodBreakdown.slice(0, 6).map((item, index) => (
                <div
                  key={item.name}
                  className={cn(
                    "flex items-center justify-between rounded-lg p-2 interact-premium",
                    activeMethodIndex === index && "bg-accent",
                  )}
                  onMouseEnter={() => onMethodIndexChange(index)}
                  onMouseLeave={() => onMethodIndexChange(null)}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={cn("size-2.5 rounded-full", getChartDotClass(index))}
                    />
                    <span className="text-xs font-semibold capitalize">{item.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatCompactNumber(item.value)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader>
            <CardTitle>Peak Hours Heatmap</CardTitle>
          </CardHeader>
          <CardContent className="min-h-[420px]">
            <ChartLoadingShell isLoading={isPeriodLoading}>
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
                  <div
                    key={day}
                    className="grid min-w-[620px] grid-cols-[52px_repeat(8,1fr)] gap-2"
                  >
                    <div className="flex items-center text-[10px] font-bold text-muted-foreground uppercase">
                      {day}
                    </div>
                    {hours.map((hour) => {
                      const volume = peakHoursMap.get(`${day}-${hour}`) ?? 0;

                      return (
                        <div
                          key={`${day}-${hour}`}
                          className={cn(
                            "flex h-10 items-center justify-center rounded-lg text-xs font-bold interact-premium",
                            heatClass(volume, maxHeatVolume),
                          )}
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
                {HEAT_LEGEND_OPACITY_CLASSES.map((opacityClass) => (
                  <div
                    key={opacityClass}
                    className={cn("size-3 rounded-sm bg-primary", opacityClass)}
                  />
                ))}
              </div>
              <span>More Busy</span>
            </div>
            </ChartLoadingShell>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
