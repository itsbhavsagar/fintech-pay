"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Send, Sparkles, X, Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AssistantSuggestions } from "@/components/assistant/AssistantSuggestions";
import { AI_NUDGE_DISMISSED_KEY } from "@/lib/brand";
import { cn } from "@/lib/utils";

const NUDGE_DELAY_MS = 1800;

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

function renderMessageContent(content: string) {
  return content.split(/(\*\*.*?\*\*)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export function FloatingAIAssistant() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  function dismissNudge() {
    setShowNudge(false);
    localStorage.setItem(AI_NUDGE_DISMISSED_KEY, "1");
  }

  function openAssistant() {
    dismissNudge();
    setIsOpen(true);
  }

  useEffect(() => {
    if (pathname !== "/" || isOpen) {
      setShowNudge(false);
      return;
    }

    if (localStorage.getItem(AI_NUDGE_DISMISSED_KEY)) {
      return;
    }

    const timer = window.setTimeout(() => {
      setShowNudge(true);
    }, NUDGE_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [pathname, isOpen]);

  useEffect(() => {
    if (isOpen) {
      dismissNudge();
    }
  }, [isOpen]);

  function closePanel() {
    setIsOpen(false);
    setMessages([]);
    setQuery("");
    setIsStreaming(false);
  }

  const handleQuerySubmit = async (questionText?: string) => {
    const prompt = (questionText ?? query).trim();
    if (!prompt || isStreaming) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: prompt,
    };
    const assistantId = crypto.randomUUID();

    setMessages((prev) => [
      ...prev,
      userMessage,
      { id: assistantId, role: "assistant", content: "" },
    ]);
    setIsStreaming(true);
    setQuery("");

    try {
      const response = await fetch("/api/intelligence/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: prompt }),
      });

      if (!response.ok) throw new Error("Failed to fetch response");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let result = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        for (const line of decoder.decode(value).split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const parsed = JSON.parse(line.slice(6)) as {
            token?: string;
            done?: boolean;
            error?: string;
          };
          if (parsed.error) throw new Error(parsed.error);
          if (parsed.token) {
            result += parsed.token;
            setMessages((prev) =>
              prev.map((message) =>
                message.id === assistantId
                  ? { ...message, content: result }
                  : message,
              ),
            );
          }
          if (parsed.done) setIsStreaming(false);
        }
      }
    } catch (error) {
      const errorText = `Error: ${error instanceof Error ? error.message : "Failed to get response"}. Please try again.`;
      setMessages((prev) =>
        prev.map((message) =>
          message.id === assistantId ? { ...message, content: errorText } : message,
        ),
      );
      setIsStreaming(false);
    }
  };

  const showEmptyState = messages.length === 0 && !isStreaming;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {showNudge && !isOpen ? (
        <div
          className={cn(
            "relative w-[min(280px,calc(100vw-3rem))]",
            "animate-in fade-in-0 slide-in-from-bottom-2 duration-300",
          )}
          role="status"
          aria-live="polite"
        >
          <div className="rounded-xl border border-primary/20 bg-card p-3.5 shadow-lg">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="size-4 shrink-0 text-primary" />
                <p className="text-sm font-semibold">AI Assistant</p>
              </div>
              <button
                type="button"
                onClick={dismissNudge}
                className="rounded-md p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Dismiss"
              >
                <X className="size-4" />
              </button>
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Ask about revenue, failed payments, or anomalies — in plain English.
            </p>
            <Button
              type="button"
              size="sm"
              className="mt-2.5 h-8 px-3 text-sm"
              onClick={openAssistant}
            >
              Try it
            </Button>
          </div>
          <div
            className="absolute -bottom-1.5 right-5 size-2.5 rotate-45 border-r border-b border-primary/20 bg-card"
            aria-hidden
          />
        </div>
      ) : null}

      {isOpen ? (
        <div
          className={cn(
            "flex w-[min(360px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-primary/20 bg-card shadow-2xl",
            "h-[min(480px,calc(100vh-7rem))] animate-in fade-in-0 slide-in-from-bottom-4 duration-200",
          )}
        >
          <div className="flex shrink-0 items-center justify-between border-b bg-secondary/30 px-3.5 py-2.5">
            <div className="flex min-w-0 items-center gap-2">
              <Sparkles className="size-4 shrink-0 text-primary" />
              <span className="truncate text-sm font-semibold text-foreground">
                Assistant
              </span>
              <Badge variant="secondary" className="h-4 shrink-0 px-1.5 text-[10px] uppercase">
                Beta
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 rounded-md hover:bg-destructive/10 hover:text-destructive"
              onClick={closePanel}
              aria-label="Close chat"
            >
              <X className="size-4" />
            </Button>
          </div>

          <div
            ref={scrollRef}
            className={cn(
              "min-h-0 flex-1 overflow-y-auto overscroll-contain p-3.5 custom-scrollbar",
              showEmptyState && "flex items-center justify-center",
            )}
            onWheel={(event) => event.stopPropagation()}
            onTouchMove={(event) => event.stopPropagation()}
          >
            {showEmptyState ? (
              <div className="w-full space-y-2.5 px-0.5">
                <p className="text-sm text-muted-foreground">
                  Ask about revenue, transactions, or payment links.
                </p>
                <AssistantSuggestions
                  variant="compact"
                  disabled={isStreaming}
                  onSelect={(question) => void handleQuerySubmit(question)}
                />
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((message, index) => {
                  const isLastAssistant =
                    message.role === "assistant" &&
                    index === messages.length - 1 &&
                    isStreaming;

                  if (message.role === "user") {
                    return (
                      <div
                        key={message.id}
                        className="ml-6 rounded-xl rounded-tr-sm bg-primary px-3 py-2 text-primary-foreground"
                      >
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      </div>
                    );
                  }

                  if (!message.content && !isLastAssistant) {
                    return null;
                  }

                  return (
                    <div
                      key={message.id}
                      className="mr-6 rounded-xl rounded-tl-sm border border-border/50 bg-secondary/50 px-3 py-2"
                    >
                      <div className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                        {renderMessageContent(message.content)}
                        {isLastAssistant ? (
                          <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-primary align-middle" />
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="shrink-0 border-t bg-secondary/20 p-3">
            <div className="relative">
              <Input
                placeholder="Type a message…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void handleQuerySubmit();
                  }
                }}
                className="h-10 rounded-lg border-primary/20 bg-card pr-11 text-sm"
                disabled={isStreaming}
              />
              <Button
                onClick={() => void handleQuerySubmit()}
                disabled={!query.trim() || isStreaming}
                size="icon"
                className="absolute right-1 top-1 size-8 rounded-md"
                aria-label="Send message"
              >
                {isStreaming ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <Button
        onClick={() => (isOpen ? closePanel() : openAssistant())}
        className={cn(
          "interact-premium size-14 rounded-full shadow-2xl",
          isOpen
            ? "bg-muted text-foreground hover:bg-muted/80"
            : "bg-primary text-primary-foreground hover:bg-primary/90",
        )}
        aria-label={isOpen ? "Close chat" : "Open AI assistant"}
      >
        {isOpen ? <X className="size-5" /> : <MessageCircle className="size-5" />}
      </Button>
    </div>
  );
}
