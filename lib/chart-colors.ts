import { cn } from "@/lib/utils";

export const CHART_FILLS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--primary)",
  "var(--success)",
] as const;

export const CHART_DOT_CLASSES = [
  "bg-chart-1",
  "bg-chart-2",
  "bg-chart-3",
  "bg-chart-4",
  "bg-chart-5",
  "bg-primary",
  "bg-success",
] as const;

export const HEAT_LEGEND_OPACITY_CLASSES = [
  "opacity-20",
  "opacity-40",
  "opacity-60",
  "opacity-80",
  "opacity-100",
] as const;

export function getChartFill(index: number): string {
  return CHART_FILLS[index % CHART_FILLS.length] ?? CHART_FILLS[0];
}

export function getChartDotClass(index: number): string {
  return CHART_DOT_CLASSES[index % CHART_DOT_CLASSES.length] ?? CHART_DOT_CLASSES[0];
}

export function pieSliceClass(
  activeIndex: number | null,
  index: number,
): string {
  return cn(
    "interact-premium",
    activeIndex === index && "brightness-110",
    activeIndex !== null && activeIndex !== index && "opacity-60",
  );
}
