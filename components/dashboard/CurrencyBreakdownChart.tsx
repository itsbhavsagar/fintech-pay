"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCompactNumber } from "@/lib/utils";
import type { BreakdownPoint } from "@/types/domain";

type CurrencyBreakdownChartProps = {
  data: BreakdownPoint[];
};

const chartColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"] as const;

function legendClass(index: number): string {
  const classes = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"] as const;
  return classes[index % classes.length];
}

export function CurrencyBreakdownChart({ data }: CurrencyBreakdownChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Currency Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="revenue" nameKey="name" innerRadius={64} outerRadius={96} paddingAngle={2}>
                {data.map((entry, index) => (
                  <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [formatCompactNumber(Number(value)), "Revenue"]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {data.slice(0, 6).map((item, index) => (
            <div key={item.name} className="flex items-center gap-2 text-sm">
              <span className={`${legendClass(index)} size-2 rounded-full`} />
              <span className="font-medium">{item.name}</span>
              <span className="text-muted-foreground">{formatCompactNumber(item.revenue)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
