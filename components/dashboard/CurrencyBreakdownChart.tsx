"use client";

import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCompactNumber } from "@/lib/utils";
import type { BreakdownPoint } from "@/types/domain";

type CurrencyBreakdownChartProps = {
  data: BreakdownPoint[];
};

const chartColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--primary)",
  "var(--success)",
] as const;

export function CurrencyBreakdownChart({ data }: CurrencyBreakdownChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const totalRevenue = data.reduce((acc, item) => acc + item.revenue, 0);
  const activeItem = activeIndex !== null ? data[activeIndex] : null;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Currency Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between">
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
                    fill={chartColors[index % chartColors.length]}
                    className="transition-all duration-300 focus:outline-none"
                    style={{
                      filter: activeIndex === index ? "brightness(1.1)" : "none",
                      opacity: activeIndex === null || activeIndex === index ? 1 : 0.6,
                    }}
                  />
                ))}
              </Pie>
              <Tooltip
                content={() => null} // We use the center text instead of a tooltip
              />
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
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 px-2">
          {data.slice(0, 6).map((item, index) => (
            <div
              key={item.name}
              className={`flex items-center justify-between rounded-lg p-1.5 transition-colors ${
                activeIndex === index ? "bg-accent" : ""
              }`}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div className="flex items-center gap-2">
                <div
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: chartColors[index % chartColors.length] }}
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

