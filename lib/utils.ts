import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Period } from "@/types/domain";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "INR" ? 0 : 2,
  }).format(amount);
}

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatDate(value: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function formatDateTime(value: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function titleCase(value: string): string {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

export function parsePeriod(value: string | null): Period {
  if (value === "7d" || value === "30d" || value === "90d") {
    return value;
  }

  return "30d";
}

export function periodToDays(period: Period): number {
  const daysByPeriod: Record<Period, number> = {
    "7d": 7,
    "30d": 30,
    "90d": 90,
  };

  return daysByPeriod[period];
}

export function maskSecret(value: string): string {
  if (value.length <= 8) {
    return "••••••••";
  }

  return `${value.slice(0, 4)}••••••••${value.slice(-4)}`;
}

export function amountToMinorUnits(amount: number, currency: string): number {
  const zeroDecimalCurrencies = new Set(["JPY", "KRW"]);
  const multiplier = zeroDecimalCurrencies.has(currency.toUpperCase()) ? 1 : 100;

  return Math.round(amount * multiplier);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
