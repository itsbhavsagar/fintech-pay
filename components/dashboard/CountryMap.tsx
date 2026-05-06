"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCompactNumber } from "@/lib/utils";
import type { BreakdownPoint } from "@/types/domain";

type CountryMapProps = {
  data: BreakdownPoint[];
};

export function CountryMap({ data }: CountryMapProps) {
  const chartData = data.slice(0, 6).map(item => ({
    name: item.name,
    revenue: item.revenue,
    transactions: item.value
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue by Country</CardTitle>
      </CardHeader>
      <CardContent>
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
              <Tooltip
                cursor={{ fill: "var(--secondary)", opacity: 0.4 }}
                contentStyle={{
                  backgroundColor: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  color: "var(--popover-foreground)",
                }}
                itemStyle={{ color: "var(--popover-foreground)" }}
                formatter={(value) => [formatCompactNumber(Number(value)), "Revenue"]}
              />
              <Bar
                dataKey="revenue"
                fill="var(--chart-1)"
                radius={[0, 4, 4, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

