"use client";

import { Send } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ChatInputProps = {
  disabled: boolean;
  onSend: (message: string) => Promise<void>;
};

export function ChatInput({ disabled, onSend }: ChatInputProps) {
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = message.trim();

    if (!value) {
      return;
    }

    setMessage("");
    await onSend(value);
  }

  return (
    <form className="flex gap-3 border-t bg-background p-4" onSubmit={handleSubmit}>
      <Textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Ask about revenue, failures, success rates, or unusual payment patterns"
        className="min-h-12 resize-none"
        disabled={disabled}
      />
      <Button type="submit" size="icon" disabled={disabled || !message.trim()} aria-label="Send message">
        <Send className="size-4" />
      </Button>
    </form>
  );
}
