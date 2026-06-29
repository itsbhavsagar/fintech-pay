import type { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatsCardProps = {
  title: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  isLoading?: boolean;
};

export function StatsCard({
  title,
  value,
  helper,
  icon: Icon,
  isLoading = false,
}: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="mb-2 h-8 w-24" />
        ) : (
          <div
            className={cn(
              "min-h-8 text-2xl font-semibold tracking-normal tabular-nums",
              "transition-opacity duration-200",
            )}
          >
            {value}
          </div>
        )}
        <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}
