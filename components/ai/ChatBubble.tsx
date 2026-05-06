import { Copy, Check } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { cn, formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ChatMessageDto } from "@/types/domain";

type ChatBubbleProps = {
  message: ChatMessageDto;
};

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  async function copyToClipboard() {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    toast.success("Message copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={cn("flex group", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "relative max-w-[85%] rounded-2xl px-5 py-4 text-sm leading-relaxed",
          isUser 
            ? "bg-primary text-primary-foreground rounded-br-sm" 
            : "bg-muted/50 text-foreground border rounded-bl-sm",
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-background prose-pre:border">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}
        
        <div className={cn("mt-2 flex items-center justify-between gap-4")}>
          <span className={cn("text-[10px] font-medium", isUser ? "text-primary-foreground/70" : "text-muted-foreground")}>
            {formatDateTime(message.createdAt)}
          </span>
          
          {!isUser && (
            <Button
              variant="ghost"
              size="icon"
              className="size-6 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => void copyToClipboard()}
              aria-label="Copy message"
            >
              {copied ? <Check className="size-3 text-green-500" /> : <Copy className="size-3 text-muted-foreground" />}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
