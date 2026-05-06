"use client";

import { FileText, Loader2, Sparkles } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { AITypingIndicator } from "@/components/ai/AITypingIndicator";
import { ChatBubble } from "@/components/ai/ChatBubble";
import { ChatInput } from "@/components/ai/ChatInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useAIChat } from "@/hooks/useAIChat";

const suggestions = [
  "Why did my success rate drop this week?",
  "Which country has the highest failure rate?",
  "What's my best performing currency?",
  "Show me my revenue trend",
] as const;

export default function AiAssistantPage() {
  const { messages, isStreaming, error, sendMessage, uploadDocs } = useAIChat();
  const [docs, setDocs] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  async function handleUpload() {
    if (!docs.trim()) {
      return;
    }

    setUploading(true);
    setUploadResult(null);

    try {
      const chunks = await uploadDocs(docs);
      setDocs("");
      setUploadResult(`${chunks} chunks embedded`);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="grid h-[calc(100vh-6.5rem)] gap-5 xl:grid-cols-[1fr_340px]">
      <div className="flex min-h-0 flex-col overflow-hidden rounded-lg border bg-card">
        <div className="flex items-center gap-3 border-b px-5 py-4">
          <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="size-5" />
          </div>
          <div>
            <h1 className="font-semibold tracking-normal">AI Assistant</h1>
            <p className="text-sm text-muted-foreground">Payment analytics, grounded in your transaction data.</p>
          </div>
        </div>
        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-4 p-5">
            {messages.length === 0 ? (
              <div className="mx-auto flex max-w-2xl flex-col items-center justify-center py-16 text-center">
                <Sparkles className="mb-4 size-8 text-primary" />
                <h3 className="text-lg font-semibold tracking-normal">Ask PaySense about your payments</h3>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {suggestions.map((question) => (
                    <Button key={question} variant="outline" onClick={() => void sendMessage(question)}>
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message) =>
                message.role === "assistant" && message.content.length === 0 ? (
                  <AITypingIndicator key={message.id} />
                ) : (
                  <ChatBubble key={message.id} message={message} />
                ),
              )
            )}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <div ref={bottomRef} className="h-1" />
          </div>
        </ScrollArea>
        <ChatInput disabled={isStreaming} onSend={sendMessage} />
      </div>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="size-4" />
            Merchant Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={docs}
            onChange={(event) => setDocs(event.target.value)}
            placeholder="Paste refund rules, payment ops notes, routing policies, or support macros"
            className="min-h-56 resize-none"
          />
          {uploadResult ? <p className="text-sm text-muted-foreground">{uploadResult}</p> : null}
          <Button className="w-full" onClick={() => void handleUpload()} disabled={uploading || !docs.trim()}>
            {uploading ? <Loader2 className="size-4 animate-spin" /> : <FileText className="size-4" />}
            Embed Notes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
