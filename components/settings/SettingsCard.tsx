import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

type SettingsCardProps = {
  title: string;
  icon?: LucideIcon;
  children: ReactNode;
};

export function SettingsCard({ title, icon: Icon, children }: SettingsCardProps) {
  return (
    <Card className="bg-card/50 shadow-sm border-border/60 transition-colors hover:border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          {Icon && <Icon className="size-4 text-muted-foreground" />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </Card>
  );
}
