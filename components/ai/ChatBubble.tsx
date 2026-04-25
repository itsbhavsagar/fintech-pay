import { cn, formatDateTime } from "@/lib/utils";
import type { ChatMessageDto } from "@/types/domain";

type ChatBubbleProps = {
  message: ChatMessageDto;
};

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-lg border px-4 py-3 text-sm leading-6",
          isUser ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground",
        )}
      >
        <p>{message.content}</p>
        <p className={cn("mt-2 text-xs", isUser ? "text-primary-foreground/70" : "text-muted-foreground")}>
          {formatDateTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}
