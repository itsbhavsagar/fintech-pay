import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

export function SkeletonPageHeader({
  titleWidth = "w-56",
  subtitleWidth = "w-80",
}: {
  titleWidth?: string;
  subtitleWidth?: string;
}) {
  return (
    <div className="space-y-2">
      <Skeleton className={cn("h-7", titleWidth)} />
      <Skeleton className={cn("h-4 max-w-full", subtitleWidth)} />
    </div>
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

export function SkeletonDashboardTransactionTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Country</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 6 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
            <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
            <TableCell><Skeleton className="h-4 w-10" /></TableCell>
            <TableCell><Skeleton className="h-4 w-28" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function SkeletonChart({ showHeader = true }: { showHeader?: boolean }) {
  return (
    <div className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
      {showHeader && <Skeleton className="h-5 w-40" />}
      <Skeleton variant="chart" className="h-[240px]" />
    </div>
  );
}

export function SkeletonPaymentLinkCard() {
  return (
    <Card className="overflow-hidden border-border/50">
      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b border-border/40 p-5">
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <div className="flex items-end justify-between gap-4 p-5">
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-56" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="size-9 rounded-lg" />
            <Skeleton className="size-9 rounded-lg" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SkeletonPaymentLinkTable() {
  return (
    <Card className="overflow-hidden border-border/50">
      <Table>
        <TableHeader className="bg-secondary/20">
          <TableRow className="hover:bg-transparent">
            <TableHead>Title</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-center">Enable/Disable</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 6 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-4 w-36" /></TableCell>
              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
              <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
              <TableCell><Skeleton className="h-4 w-28" /></TableCell>
              <TableCell className="text-center"><Skeleton className="mx-auto h-6 w-11 rounded-full" /></TableCell>
              <TableCell className="text-right"><Skeleton className="ml-auto h-8 w-20 rounded-md" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

export function SkeletonAnomalyList({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center justify-between rounded-xl border bg-card/50 p-4">
          <div className="flex items-center gap-4">
            <Skeleton className="size-8 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonHeatmap() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, row) => (
        <div key={row} className="grid grid-cols-8 gap-2">
          <Skeleton className="h-10 rounded-lg" />
          {Array.from({ length: 7 }).map((_, col) => (
            <Skeleton key={col} className="h-10 rounded-lg" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonSettingsCard() {
  return (
    <div className="space-y-5 rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <Skeleton className="size-5 rounded" />
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="flex items-center gap-4">
        <Skeleton variant="avatar" className="size-16" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-44" />
        </div>
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      ))}
      <Skeleton className="h-10 w-32 rounded-md" />
    </div>
  );
}

export function SkeletonSettingsPage() {
  return (
    <div className="grid max-w-5xl gap-6 xl:grid-cols-2">
      <SkeletonSettingsCard />
      <SkeletonSettingsCard />
    </div>
  );
}

export function SkeletonSettlementSummary() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <SkeletonStatsCard />
      <SkeletonStatsCard />
    </div>
  );
}
