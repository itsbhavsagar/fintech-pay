import { cn } from "@/lib/utils";

type SkeletonProps = {
  className?: string;
  variant?: "text" | "card" | "avatar" | "line" | "paragraph" | "chart";
};

export function Skeleton({ className, variant = "text" }: SkeletonProps) {
  const variants = {
    text: "h-4 w-full rounded",
    card: "h-32 w-full rounded-lg",
    avatar: "size-10 rounded-full",
    line: "h-2 w-full rounded-full",
    paragraph: "space-y-2",
    chart: "h-80 w-full rounded-lg",
  };

  if (variant === "paragraph") {
    return (
      <div className="space-y-2">
        <div className="h-4 w-3/4 rounded bg-secondary animate-shimmer" />
        <div className="h-4 w-full rounded bg-secondary animate-shimmer" />
        <div className="h-4 w-5/6 rounded bg-secondary animate-shimmer" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-secondary animate-shimmer",
        variants[variant as keyof typeof variants],
        className,
      )}
    />
  );
}

/**
 * Skeleton for stats card
 */
export function SkeletonStatsCard() {
  return (
    <div className="space-y-4 rounded-lg border bg-card p-6">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

/**
 * Skeleton for transaction table
 */
export function SkeletonTransactionRow() {
  return (
    <div className="flex items-center gap-4 border-b py-4 px-2">
      <Skeleton className="size-4 rounded" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-20" />
      <Skeleton className="size-6 rounded" />
    </div>
  );
}

/**
 * Skeleton for full transaction table
 */
export function SkeletonTransactionTable() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <SkeletonTransactionRow key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton for chart
 */
export function SkeletonChart() {
  return <Skeleton variant="chart" />;
}
