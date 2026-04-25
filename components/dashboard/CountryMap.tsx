import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCompactNumber } from "@/lib/utils";
import type { BreakdownPoint } from "@/types/domain";

type CountryMapProps = {
  data: BreakdownPoint[];
};

function widthClass(percentage: number): string {
  if (percentage >= 92) return "w-full";
  if (percentage >= 83) return "w-11/12";
  if (percentage >= 75) return "w-10/12";
  if (percentage >= 67) return "w-9/12";
  if (percentage >= 58) return "w-8/12";
  if (percentage >= 50) return "w-7/12";
  if (percentage >= 42) return "w-6/12";
  if (percentage >= 33) return "w-5/12";
  if (percentage >= 25) return "w-4/12";
  if (percentage >= 17) return "w-3/12";
  if (percentage >= 8) return "w-2/12";
  return "w-1/12";
}

export function CountryMap({ data }: CountryMapProps) {
  const maxRevenue = Math.max(...data.map((item) => item.revenue), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue by Country</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.slice(0, 6).map((item) => {
          const percentage = (item.revenue / maxRevenue) * 100;

          return (
            <div key={item.name} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{item.name}</span>
                <span className="text-muted-foreground">{formatCompactNumber(item.revenue)}</span>
              </div>
              <div className="h-2 rounded-full bg-secondary">
                <div className={`${widthClass(percentage)} h-2 rounded-full bg-primary`} />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
