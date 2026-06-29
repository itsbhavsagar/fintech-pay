"use client";

import { Button } from "@/components/ui/button";
import {
  ASSISTANT_SUGGESTED_QUESTIONS,
  FLOATING_ASSISTANT_SUGGESTIONS,
} from "@/lib/assistant-suggestions";
import { cn } from "@/lib/utils";

type AssistantSuggestionsProps = {
  onSelect: (question: string) => void;
  className?: string;
  disabled?: boolean;
  variant?: "default" | "compact";
  questions?: readonly string[];
};

export function AssistantSuggestions({
  onSelect,
  className,
  disabled = false,
  variant = "default",
  questions,
}: AssistantSuggestionsProps) {
  const items =
    questions ??
    (variant === "compact"
      ? FLOATING_ASSISTANT_SUGGESTIONS
      : ASSISTANT_SUGGESTED_QUESTIONS);

  const isCompact = variant === "compact";

  return (
    <div
      className={cn(
        isCompact ? "flex w-full flex-col gap-1.5" : "flex flex-wrap justify-center gap-2",
        className,
      )}
    >
      {items.map((question) => (
        <Button
          key={question}
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => onSelect(question)}
          className={cn(
            "h-auto whitespace-normal text-left leading-snug",
            isCompact
              ? "w-full justify-start rounded-lg px-2.5 py-1.5 text-[11px] font-normal"
              : "px-3 py-2 text-xs",
          )}
        >
          {question}
        </Button>
      ))}
    </div>
  );
}
