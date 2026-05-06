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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SkeletonChart } from "@/components/ui/skeleton";
import { formatCompactNumber } from "@/lib/utils";
import type { DailyRevenuePoint, Period } from "@/types/domain";

type RevenueChartProps = {
  data: DailyRevenuePoint[];
  period: Period;
  isFetching?: boolean;
  onPeriodChange: (period: Period) => void;
};

const periods: readonly Period[] = ["7d", "30d", "90d"];

export function RevenueChart({
  data,
  period,
  isFetching = false,
  onPeriodChange,
}: RevenueChartProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>Revenue Intelligence</CardTitle>
        <div className="flex rounded-md border p-1">
          {periods.map((item) => (
            <Button
              key={item}
              variant={period === item ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onPeriodChange(item)}
              className="h-7 px-3 text-xs"
              disabled={isFetching}
            >
              {item}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="relative min-h-[320px]">
        {isFetching && (
          <div className="absolute inset-0 z-10 flex flex-col justify-end p-6">
            <SkeletonChart showHeader={false} />
          </div>
        )}
        <div className={`h-72 transition-opacity duration-300 ${isFetching ? "opacity-0 invisible" : "opacity-100 visible"}`}>
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
                contentStyle={{
                  backgroundColor: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  color: "var(--popover-foreground)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}
                itemStyle={{ color: "var(--popover-foreground)", fontSize: "12px", fontWeight: "600" }}
                labelStyle={{ color: "var(--muted-foreground)", fontSize: "10px", marginBottom: "4px" }}
                formatter={(value) => [
                  formatCompactNumber(Number(value)),
                  "Revenue",
                ]}
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
      </CardContent>
    </Card>
  );
}

