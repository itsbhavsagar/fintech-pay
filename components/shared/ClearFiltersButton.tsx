"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ClearFiltersButtonProps = {
  visible?: boolean;
  onClear: () => void;
  className?: string;
};

export function ClearFiltersButton({
  visible = true,
  onClear,
  className,
}: ClearFiltersButtonProps) {
  if (!visible) {
    return null;
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClear}
      className={cn(
        "h-10 gap-1.5 shrink-0 text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      <X className="size-4" />
      Clear
    </Button>
  );
}
