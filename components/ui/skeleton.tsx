import { cn } from "@/lib/utils";

type SkeletonProps = {
  className?: string;
  variant?: "text" | "card" | "avatar" | "line" | "paragraph" | "chart";
};

export function Skeleton({ className, variant = "text" }: SkeletonProps) {
  const variants = {
    text: "h-4 w-full rounded",
    card: "h-[160px] w-full rounded-lg",
    avatar: "size-10 rounded-full",
    line: "h-2 w-full rounded-full",
    paragraph: "space-y-3",
    chart: "h-[300px] w-full rounded-lg",
  };

  if (variant === "paragraph") {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="h-4 w-[85%] rounded animate-shimmer" />
        <div className="h-4 w-full rounded animate-shimmer" />
        <div className="h-4 w-[70%] rounded animate-shimmer" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "animate-shimmer",
        variants[variant as keyof typeof variants],
        className,
      )}
    />
  );
}

export function SkeletonStatsCard() {
  return (
    <div className="space-y-5 rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="size-8 rounded-lg" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-3 w-44" />
      </div>
    </div>
  );
}

export function SkeletonTransactionRow() {
  return (
    <div className="flex items-center justify-between border-b py-4 px-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-4 w-12 font-mono" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="flex items-center gap-8">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

export function SkeletonTransactionTable() {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonTransactionRow key={i} />
      ))}
    </div>
  );
}

export function SkeletonChart({ showHeader = true }: { showHeader?: boolean }) {
  return (
    <div className="space-y-4">
      {showHeader && <Skeleton className="h-5 w-40" />}
      <Skeleton variant="chart" className="h-[240px]" />
    </div>
  );
}
