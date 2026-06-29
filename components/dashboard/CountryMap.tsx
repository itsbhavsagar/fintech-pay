"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartLoadingShell } from "@/components/charts/ChartLoadingShell";
import { ChartTooltip } from "@/components/charts/ChartTooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BreakdownPoint } from "@/types/domain";

type CountryMapProps = {
  data: BreakdownPoint[];
  isLoading?: boolean;
};

export function CountryMap({ data, isLoading = false }: CountryMapProps) {
  const chartData = data.slice(0, 6).map((item) => ({
    name: item.name,
    revenue: item.revenue,
    transactions: item.value,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue by Country</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartLoadingShell isLoading={isLoading} className="h-[240px] w-full">
          <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ left: -20, right: 20 }}
            >
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                axisLine={false}
                width={60}
                className="text-xs font-medium"
              />
              <Tooltip content={<ChartTooltip valueLabel="Revenue" />} />
              <Bar
                dataKey="revenue"
                fill="var(--chart-1)"
                radius={[0, 4, 4, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
          </div>
        </ChartLoadingShell>
      </CardContent>
    </Card>
  );
}
