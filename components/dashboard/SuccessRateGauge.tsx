import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPercent } from "@/lib/utils";

type SuccessRateGaugeProps = {
  value: number;
};

function widthClass(value: number): string {
  if (value >= 95) return "w-full";
  if (value >= 90) return "w-11/12";
  if (value >= 80) return "w-10/12";
  if (value >= 70) return "w-9/12";
  if (value >= 60) return "w-8/12";
  if (value >= 50) return "w-7/12";
  if (value >= 40) return "w-6/12";
  if (value >= 30) return "w-5/12";
  if (value >= 20) return "w-4/12";
  if (value >= 10) return "w-3/12";
  return "w-2/12";
}

export function SuccessRateGauge({ value }: SuccessRateGaugeProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Success Rate</CardTitle>
        <CheckCircle2 className="size-4 text-success" />
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-semibold tracking-normal">{formatPercent(value)}</div>
        <div className="mt-5 h-3 rounded-full bg-secondary">
          <div className={`${widthClass(value)} h-3 rounded-full bg-success`} />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">Successful payments across the selected period</p>
      </CardContent>
    </Card>
  );
}
