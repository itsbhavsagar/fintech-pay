import { Loader2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type SettingsActionProps = {
  label: string;
  tooltip: string;
  icon: LucideIcon;
  onClick: () => void;
  isPending?: boolean;
  disabled?: boolean;
  variant?: "default" | "outline" | "destructive" | "secondary" | "ghost" | "link";
};

export function SettingsAction({
  label,
  tooltip,
  icon: Icon,
  onClick,
  isPending = false,
  disabled = false,
  variant = "default",
}: SettingsActionProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant={variant}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClick();
          }}
          disabled={disabled || isPending}
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Icon className="size-4" />
          )}
          {label}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}
