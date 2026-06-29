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

export function FloatingAIAssistant() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [streamingResponse, setStreamingResponse] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [streamingResponse]);

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
    setSubmittedQuery("");
    setStreamingResponse("");
    setQuery("");
  }

  const handleQuerySubmit = async (questionText?: string) => {
    const prompt = (questionText ?? query).trim();
    if (!prompt || isStreaming) return;

    setSubmittedQuery(prompt);
    setStreamingResponse("");
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
            setStreamingResponse(result);
          }
          if (parsed.done) setIsStreaming(false);
        }
      }
    } catch (error) {
      setStreamingResponse(
        `Error: ${error instanceof Error ? error.message : "Failed to get response"}. Please try again.`,
      );
      setIsStreaming(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {showNudge && !isOpen ? (
        <div
          className={cn(
            "relative w-[min(260px,calc(100vw-3rem))]",
            "animate-in fade-in-0 slide-in-from-bottom-2 duration-300",
          )}
          role="status"
          aria-live="polite"
        >
          <div className="rounded-xl border border-primary/20 bg-card p-3 shadow-lg">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="size-3.5 shrink-0 text-primary" />
                <p className="text-[11px] font-semibold">AI Assistant</p>
              </div>
              <button
                type="button"
                onClick={dismissNudge}
                className="rounded-md p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Dismiss"
              >
                <X className="size-3.5" />
              </button>
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
              Ask about revenue, failed payments, or anomalies — in plain English.
            </p>
            <Button
              type="button"
              size="sm"
              className="mt-2 h-7 px-3 text-[11px]"
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
            "flex w-[min(360px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-primary/20 bg-card/95 shadow-2xl backdrop-blur-xl",
            "h-[min(480px,calc(100vh-7rem))] animate-in fade-in-0 slide-in-from-bottom-4 duration-200",
          )}
        >
          <div className="flex items-center justify-between border-b bg-secondary/30 px-3 py-2">
            <div className="flex min-w-0 items-center gap-1.5">
              <Sparkles className="size-3.5 shrink-0 text-primary" />
              <span className="truncate text-[11px] font-semibold text-foreground">
                Assistant
              </span>
              <Badge variant="secondary" className="h-3.5 shrink-0 px-1 text-[8px] uppercase">
                Beta
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 shrink-0 rounded-md hover:bg-destructive/10 hover:text-destructive"
              onClick={closePanel}
              aria-label="Close chat"
            >
              <X className="size-3.5" />
            </Button>
          </div>

          <div
            ref={scrollRef}
            className={cn(
              "flex-1 overflow-y-auto p-3 custom-scrollbar",
              !submittedQuery && !isStreaming && "flex items-center justify-center",
            )}
          >
            {!submittedQuery && !isStreaming ? (
              <div className="w-full space-y-2 px-0.5">
                <p className="text-[11px] text-muted-foreground">
                  Ask about revenue, transactions, or payment links.
                </p>
                <AssistantSuggestions
                  variant="compact"
                  disabled={isStreaming}
                  onSelect={(question) => void handleQuerySubmit(question)}
                />
              </div>
            ) : (
              <div className="space-y-2">
                {submittedQuery ? (
                  <div className="ml-4 rounded-lg rounded-tr-sm bg-primary px-2.5 py-1.5 text-primary-foreground">
                    <p className="text-[11px] leading-relaxed">{submittedQuery}</p>
                  </div>
                ) : null}
                <div className="mr-4 rounded-lg rounded-tl-sm border border-border/50 bg-secondary/50 px-2.5 py-1.5">
                  <div className="text-[11px] leading-relaxed text-foreground/90 whitespace-pre-wrap">
                    {streamingResponse.split(/(\*\*.*?\*\*)/g).map((part, i) => {
                      if (part.startsWith("**") && part.endsWith("**")) {
                        return (
                          <strong key={i} className="font-bold text-foreground">
                            {part.slice(2, -2)}
                          </strong>
                        );
                      }
                      return part;
                    })}
                    {isStreaming ? (
                      <span className="ml-1 inline-block h-3 w-1 animate-pulse bg-primary align-middle" />
                    ) : null}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border-t bg-secondary/20 p-2.5">
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
                className="h-9 rounded-lg border-primary/20 bg-card/50 pr-10 text-[11px]"
                disabled={isStreaming}
              />
              <Button
                onClick={() => void handleQuerySubmit()}
                disabled={!query.trim() || isStreaming}
                size="icon"
                className="absolute right-1 top-1 size-7 rounded-md"
                aria-label="Send message"
              >
                {isStreaming ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Send className="size-3.5" />
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
