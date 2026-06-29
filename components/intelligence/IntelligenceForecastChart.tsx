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
import { ChartTooltip } from "@/components/charts/ChartTooltip";
import { formatCompactNumber } from "@/lib/utils";

type ForecastPoint = {
  date: string;
  actual: number | null;
  forecast: number | null;
};

type IntelligenceForecastChartProps = {
  chartData: ForecastPoint[];
};

export function IntelligenceForecastChart({
  chartData,
}: IntelligenceForecastChartProps) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ left: -20, right: 12, top: 10, bottom: 0 }}
        >
          <defs>
            <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--muted-foreground)"
                stopOpacity={0.1}
              />
              <stop
                offset="95%"
                stopColor="var(--muted-foreground)"
                stopOpacity={0}
              />
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
            tick={{ fontSize: 10 }}
            interval="preserveStartEnd"
            className="text-[10px] uppercase text-muted-foreground"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => "₹" + formatCompactNumber(Number(v))}
            className="text-[10px]"
          />
          <Tooltip
            content={
              <ChartTooltip
                valueLabel="Revenue"
                formatValue={(value) => "₹" + formatCompactNumber(value)}
              />
            }
          />
          <Area
            type="linear"
            dataKey="actual"
            stroke="var(--primary)"
            strokeWidth={2.5}
            fill="url(#actualGradient)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0, fill: "var(--primary)" }}
          />
          <Area
            type="linear"
            dataKey="forecast"
            stroke="var(--muted-foreground)"
            strokeWidth={2}
            strokeDasharray="5 5"
            fill="url(#forecastGradient)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0, fill: "var(--muted-foreground)" }}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="mt-4 flex items-center justify-center gap-6 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-0.5 w-6 bg-primary" />
          <span>Historical Trend</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-0.5 w-6 border-t-2 border-dashed border-muted-foreground" />
          <span>AI Prediction</span>
        </div>
      </div>
    </div>
  );
}
