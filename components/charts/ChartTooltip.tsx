"use client";

import type { TooltipProps } from "recharts";
import { formatCompactNumber } from "@/lib/utils";

type ChartTooltipProps = TooltipProps<number, string> & {
  valueLabel?: string;
  formatValue?: (value: number) => string;
};

export function ChartTooltip({
  active,
  payload,
  label,
  valueLabel = "Value",
  formatValue = (value) => formatCompactNumber(value),
}: ChartTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const entry = payload[0];
  if (!entry || entry.value === undefined) {
    return null;
  }

  return (
    <div className="chart-tooltip">
      {label ? <p className="chart-tooltip-label">{label}</p> : null}
      <p className="chart-tooltip-item">
        {formatValue(Number(entry.value))} · {valueLabel}
      </p>
    </div>
  );
}
