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
import { useAnalytics } from "@/hooks/useAnalytics";
import { cn, formatCompactNumber } from "@/lib/utils";
import type { Period } from "@/types/domain";

const periods: readonly Period[] = ["7d", "30d", "90d"];
const chartColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"] as const;
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const hours = [0, 3, 6, 9, 12, 15, 18, 21] as const;

function heatClass(volume: number, max: number): string {
  if (max === 0 || volume === 0) return "bg-secondary";
  const ratio = volume / max;
  if (ratio > 0.8) return "bg-primary";
  if (ratio > 0.6) return "bg-primary/80";
  if (ratio > 0.4) return "bg-primary/60";
  if (ratio > 0.2) return "bg-primary/40";
  return "bg-primary/20";
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>("30d");
  const analytics = useAnalytics(period);
  const data = analytics.data;
  const maxHeatVolume = Math.max(...(data?.peakHours.map((point) => point.volume) ?? [0]), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-normal">Analytics</h2>
          <p className="text-sm text-muted-foreground">Revenue, reliability, and payment behavior across real transactions.</p>
        </div>
        <div className="flex rounded-md border p-1">
          {periods.map((item) => (
            <Button key={item} size="sm" variant={period === item ? "secondary" : "ghost"} onClick={() => setPeriod(item)}>
              {item}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Country</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.countryBreakdown ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => formatCompactNumber(Number(value))} />
                  <Tooltip formatter={(value) => [formatCompactNumber(Number(value)), "Revenue"]} />
                  <Bar dataKey="revenue" radius={[6, 6, 0, 0]} fill="var(--chart-1)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Success Rate Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.successRateOverTime ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} minTickGap={24} />
                  <YAxis tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                  <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, "Success rate"]} />
                  <Area
                    type="monotone"
                    dataKey="successRate"
                    stroke="var(--chart-2)"
                    fill="var(--chart-2)"
                    fillOpacity={0.18}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Payment Method Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data?.paymentMethodBreakdown ?? []} dataKey="value" nameKey="name" innerRadius={64} outerRadius={96}>
                    {(data?.paymentMethodBreakdown ?? []).map((entry, index) => (
                      <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [formatCompactNumber(Number(value)), "Transactions"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Peak Hours Heatmap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 overflow-x-auto">
              <div className="grid min-w-[620px] grid-cols-[52px_repeat(8,1fr)] gap-2 text-xs text-muted-foreground">
                <span />
                {hours.map((hour) => (
                  <span key={hour} className="text-center">
                    {String(hour).padStart(2, "0")}:00
                  </span>
                ))}
              </div>
              {days.map((day) => (
                <div key={day} className="grid min-w-[620px] grid-cols-[52px_repeat(8,1fr)] gap-2">
                  <div className="flex items-center text-xs font-medium text-muted-foreground">{day}</div>
                  {hours.map((hour) => {
                    const point = data?.peakHours.find((item) => item.day === day && item.hour === hour);
                    const volume = point?.volume ?? 0;

                    return (
                      <div
                        key={`${day}-${hour}`}
                        className={cn("flex h-10 items-center justify-center rounded-md text-xs font-medium", heatClass(volume, maxHeatVolume))}
                      >
                        {volume}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
