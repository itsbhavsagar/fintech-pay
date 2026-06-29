"use client";

import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartLoadingShell } from "@/components/charts/ChartLoadingShell";
import { ChartTooltip } from "@/components/charts/ChartTooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getChartDotClass, getChartFill, pieSliceClass } from "@/lib/chart-colors";
import { formatCompactNumber } from "@/lib/utils";
import type { BreakdownPoint } from "@/types/domain";
import { cn } from "@/lib/utils";

type CurrencyBreakdownChartProps = {
  data: BreakdownPoint[];
  isLoading?: boolean;
};

export function CurrencyBreakdownChart({ data, isLoading = false }: CurrencyBreakdownChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const totalRevenue = data.reduce((acc, item) => acc + item.revenue, 0);
  const activeItem = activeIndex !== null ? data[activeIndex] : null;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Currency Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between">
        <ChartLoadingShell isLoading={isLoading} className="relative h-64 w-full">
          <div className="relative h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="revenue"
                nameKey="name"
                innerRadius={70}
                outerRadius={95}
                paddingAngle={4}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={getChartFill(index)}
                    className={pieSliceClass(activeIndex, index)}
                  />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip valueLabel="Revenue" />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {activeItem ? activeItem.name : "Total Revenue"}
            </span>
            <span className="text-2xl font-bold tracking-tight">
              {formatCompactNumber(activeItem ? activeItem.revenue : totalRevenue)}
            </span>
            {activeItem && (
              <span className="text-[10px] font-medium text-success">
                {((activeItem.revenue / totalRevenue) * 100).toFixed(1)}%
              </span>
            )}
          </div>
          </div>
        </ChartLoadingShell>
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 px-2">
          {data.slice(0, 6).map((item, index) => (
            <div
              key={item.name}
              className={cn(
                "flex items-center justify-between rounded-lg p-1.5 interact-premium",
                activeIndex === index && "bg-accent",
              )}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div className="flex items-center gap-2">
                <div
                  className={cn("size-2.5 rounded-full", getChartDotClass(index))}
                />
                <span className="text-xs font-semibold">{item.name}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatCompactNumber(item.revenue)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
