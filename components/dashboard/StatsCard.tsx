import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StatsCardProps = {
  title: string;
  value: string;
  helper: string;
  icon: LucideIcon;
};

export function StatsCard({ title, value, helper, icon: Icon }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-normal">{value}</div>
        <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}
