"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartLoadingShell } from "@/components/charts/ChartLoadingShell";
import { ChartTooltip } from "@/components/charts/ChartTooltip";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCompactNumber } from "@/lib/utils";
import type { DailyRevenuePoint, Period } from "@/types/domain";
import { cn } from "@/lib/utils";

type RevenueChartProps = {
  data: DailyRevenuePoint[];
  period: Period;
  isLoading?: boolean;
  onPeriodChange: (period: Period) => void;
};

const periods: readonly Period[] = ["7d", "30d", "90d"];

export function RevenueChart({
  data,
  period,
  isLoading = false,
  onPeriodChange,
}: RevenueChartProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>Revenue Intelligence</CardTitle>
        <div className="flex rounded-md border p-1 bg-card">
          {periods.map((item) => (
            <Button
              key={item}
              variant={period === item ? "default" : "ghost"}
              size="sm"
              onClick={() => onPeriodChange(item)}
              className={cn(
                "text-xs h-7 px-3 interact-premium",
                period === item ? "shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="relative min-h-[320px]">
        <ChartLoadingShell isLoading={isLoading} className="h-72">
          <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ left: -20, right: 12, top: 8, bottom: 0 }}
            >
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                minTickGap={24}
                className="text-[10px] text-muted-foreground uppercase"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                width={72}
                tickFormatter={(value) => formatCompactNumber(Number(value))}
                className="text-[10px] text-muted-foreground"
              />
              <Tooltip
                cursor={{ stroke: "var(--chart-1)", strokeWidth: 1, strokeDasharray: "4 4" }}
                content={<ChartTooltip valueLabel="Revenue" />}
              />
              <Area
                type="linear"
                dataKey="revenue"
                stroke="var(--chart-1)"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#revenueGradient)"
                activeDot={{ r: 5, strokeWidth: 0, fill: "var(--chart-1)" }}
              />
            </AreaChart>
          </ResponsiveContainer>
          </div>
        </ChartLoadingShell>
      </CardContent>
    </Card>
  );
}
