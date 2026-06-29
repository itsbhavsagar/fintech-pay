"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type ChartLoadingShellProps = {
  isLoading?: boolean;
  children: React.ReactNode;
  className?: string;
};

export function ChartLoadingShell({
  isLoading = false,
  children,
  className,
}: ChartLoadingShellProps) {
  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "h-full w-full transition-opacity duration-200",
          isLoading && "pointer-events-none opacity-[0.35]",
        )}
      >
        {children}
      </div>
      {isLoading ? (
        <div className="absolute inset-0 z-10 overflow-hidden rounded-lg">
          <Skeleton variant="chart" className="h-full w-full rounded-lg" />
        </div>
      ) : null}
    </div>
  );
}
