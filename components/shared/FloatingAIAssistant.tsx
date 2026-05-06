"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, X, Loader2, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function FloatingAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [position, setPosition] = useState({ x: -1, y: -1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);

  useEffect(() => {
    if (position.x === -1 && typeof window !== "undefined") {
      const width = containerRef.current?.offsetWidth ?? 200;
      setPosition({
        x: (window.innerWidth - width) / 2,
        y: window.innerHeight - 80
      });
    }
  }, [position.x]);
  
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [streamingResponse, setStreamingResponse] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setHasMoved(false);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const deltaX = Math.abs(e.clientX - (dragStart.x + position.x));
      const deltaY = Math.abs(e.clientY - (dragStart.y + position.y));
      
      if (deltaX > 5 || deltaY > 5) {
        setHasMoved(true);
      }

      const rect = containerRef.current?.getBoundingClientRect();
      const width = rect?.width ?? 200;
      const height = rect?.height ?? 50;
      
      const padding = 16;
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      const minX = padding;
      const maxX = window.innerWidth - width - padding;
      const minY = padding;
      const maxY = window.innerHeight - height - padding;

      setPosition({
        x: Math.max(minX, Math.min(maxX, newX)),
        y: Math.max(minY, Math.min(maxY, newY))
      });
    };

    const onMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging, dragStart]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [streamingResponse]);

  const handleQuerySubmit = async () => {
    if (!query.trim()) return;
    setSubmittedQuery(query);
    setStreamingResponse("");
    setIsStreaming(true);
    setQuery("");
    if (!isExpanded) setIsExpanded(true);

    try {
      const response = await fetch("/api/intelligence/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
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
        `Error: ${error instanceof Error ? error.message : "Failed to get response"}. Please try again.`
      );
      setIsStreaming(false);
    }
  };

  if (!isOpen) {
    return (
      <div 
        ref={containerRef}
        className="fixed z-50 select-none top-0 left-0"
        style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
        onMouseDown={onMouseDown}
      >
        <Button
          onClick={() => !hasMoved && setIsOpen(true)}
          className={`h-12 px-6 rounded-full shadow-2xl bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-3 border border-white/10 group transition-all active:scale-95 ${
            isDragging ? "cursor-grabbing opacity-80 scale-105" : "cursor-grab"
          }`}
        >
          <Sparkles className="size-4 group-hover:animate-pulse" />
          <span className="text-sm font-medium">Ask PaySense Intelligence</span>
        </Button>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`fixed top-0 left-0 z-50 transition-all duration-300 ease-in-out ${
        isDragging ? "transition-none" : ""
      } ${
        isExpanded ? "w-[90vw] max-w-2xl h-[500px]" : "w-[90vw] max-w-xl h-auto"
      }`}
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
    >
      <div className="bg-card/80 backdrop-blur-xl border border-primary/20 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] rounded-2xl flex flex-col overflow-hidden h-full">
        {/* Header - Now Draggable */}
        <div 
          className={`px-4 py-3 border-b flex items-center justify-between bg-secondary/30 select-none ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          onMouseDown={onMouseDown}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest">Intelligence Assistant</span>
            <Badge variant="secondary" className="text-[9px] h-4 uppercase">AI Beta</Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="size-8 rounded-lg" 
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="size-8 rounded-lg hover:bg-destructive/10 hover:text-destructive" 
              onClick={() => {
                setIsOpen(false);
                setIsExpanded(false);
                setSubmittedQuery("");
                setStreamingResponse("");
              }}
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div 
          ref={scrollRef}
          className={`flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar ${
            !submittedQuery && !isStreaming ? "flex items-center justify-center opacity-40" : ""
          }`}
        >
          {!submittedQuery && !isStreaming ? (
            <div className="text-center space-y-2">
              <Sparkles className="size-8 mx-auto text-primary/50" />
              <p className="text-sm font-medium">How can I help with your analytics today?</p>
              <p className="text-xs opacity-70">Try: "Why did success rate drop?"</p>
            </div>
          ) : (
            <>
              {submittedQuery && (
                <div className="space-y-1 bg-secondary/50 rounded-xl p-3 border border-border/50">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Your Question</p>
                  <p className="text-sm">{submittedQuery}</p>
                </div>
              )}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                    <Sparkles className="size-3" />
                    PaySense Intelligence
                  </p>
                  <div className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                    {streamingResponse.split(/(\*\*.*?\*\*)/g).map((part, i) => {
                      if (part.startsWith("**") && part.endsWith("**")) {
                        return <strong key={i} className="font-bold text-foreground">{part.slice(2, -2)}</strong>;
                      }
                      return part;
                    })}
                    {isStreaming && <span className="inline-block w-1.5 h-4 ml-1 bg-primary animate-pulse align-middle" />}
                  </div>
                </div>
            </>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-secondary/20">
          <div className="relative group">
            <Input
              placeholder="Ask anything about your transaction patterns..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleQuerySubmit();
                }
              }}
              className="pr-12 h-12 bg-card/50 border-primary/20 focus-visible:ring-primary/30 rounded-xl"
              disabled={isStreaming}
            />
            <Button
              onClick={handleQuerySubmit}
              disabled={!query.trim() || isStreaming}
              size="icon"
              className="absolute right-1.5 top-1.5 h-9 w-9 rounded-lg shadow-lg"
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
    </div>
  );
}
