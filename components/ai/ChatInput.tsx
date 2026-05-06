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

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void submitMessage();
    }
  }

  async function submitMessage() {
    const value = message.trim();
    if (!value) return;
    setMessage("");
    await onSend(value);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitMessage();
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const target = e.target;
    target.style.height = "auto";
    target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
    setMessage(target.value);
  }

  return (
    <form className="flex gap-3 border-t bg-background p-4" onSubmit={handleSubmit}>
      <Textarea
        value={message}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder="Ask about revenue, failures, success rates, or unusual payment patterns"
        className="min-h-12 max-h-[200px] resize-none overflow-y-auto"
        disabled={disabled}
      />
      <Button type="submit" size="icon" disabled={disabled || !message.trim()} aria-label="Send message">
        <Send className="size-4" />
      </Button>
    </form>
  );
}
