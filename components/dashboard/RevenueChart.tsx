"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCompactNumber } from "@/lib/utils";
import type { DailyRevenuePoint, Period } from "@/types/domain";

type RevenueChartProps = {
  data: DailyRevenuePoint[];
  period: Period;
  onPeriodChange: (period: Period) => void;
};

const periods: readonly Period[] = ["7d", "30d", "90d"];

export function RevenueChart({ data, period, onPeriodChange }: RevenueChartProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>Revenue Trend</CardTitle>
        <div className="flex rounded-md border p-1">
          {periods.map((item) => (
            <Button
              key={item}
              variant={period === item ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onPeriodChange(item)}
              className="h-7 px-3"
            >
              {item}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={10} minTickGap={24} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                width={72}
                tickFormatter={(value) => formatCompactNumber(Number(value))}
              />
              <Tooltip
                cursor={{ stroke: "var(--border)" }}
                formatter={(value) => [formatCompactNumber(Number(value)), "Revenue"]}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="var(--chart-1)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
