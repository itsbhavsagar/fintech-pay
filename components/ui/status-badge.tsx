import { Badge } from "@/components/ui/badge";
import { titleCase } from "@/lib/utils";

type StatusBadgeProps = {
  status: string;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const variant =
    status === "success" || status === "paid" || status === "settled"
      ? "success"
      : status === "failed" || status === "expired"
        ? "destructive"
        : status === "pending" || status === "processing"
          ? "warning"
          : "secondary";

  return <Badge variant={variant}>{titleCase(status)}</Badge>;
}
