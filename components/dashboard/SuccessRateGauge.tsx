"use client";

import { CheckCircle2 } from "lucide-react";
import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPercent } from "@/lib/utils";

type SuccessRateGaugeProps = {
  value: number;
};

export function SuccessRateGauge({ value }: SuccessRateGaugeProps) {
  const data = [{ value }];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Overall Success Rate</CardTitle>
        <CheckCircle2 className="size-4 text-success" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center">
          <div className="relative h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                innerRadius="80%"
                outerRadius="100%"
                data={data}
                startAngle={180}
                endAngle={0}
              >
                <PolarAngleAxis
                  type="number"
                  domain={[0, 100]}
                  angleAxisId={0}
                  tick={false}
                />
                <RadialBar
                  background
                  dataKey="value"
                  cornerRadius={30}
                  fill="var(--success)"
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
              <span className="text-3xl font-bold tracking-tight">
                {formatPercent(value)}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Captured
              </span>
            </div>
          </div>
          <p className="max-w-[200px] text-center text-xs text-muted-foreground">
            Your success rate is <span className="font-semibold text-foreground">{(value).toFixed(1)}%</span> higher than the industry average this month.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

