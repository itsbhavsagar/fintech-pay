"use client";

import { useCallback, useState } from "react";
import { fetchJson } from "@/lib/fetcher";
import type { ChatMessageDto } from "@/types/domain";

type UseAIChatResult = {
  messages: ChatMessageDto[];
  isStreaming: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  uploadDocs: (text: string) => Promise<number>;
};

function createLocalMessage(role: "user" | "assistant", content: string): ChatMessageDto {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    createdAt: new Date().toISOString(),
  };
}

export function useAIChat(): UseAIChatResult {
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      const message = content.trim();

      if (!message || isStreaming) {
        return;
      }

      setError(null);
      setIsStreaming(true);
      setMessages((current) => [...current, createLocalMessage("user", message), createLocalMessage("assistant", "")]);

      try {
        const response = await fetch("/api/ai/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId,
            message,
          }),
        });

        if (!response.ok || !response.body) {
          const payload: unknown = await response.json().catch(() => null);
          const serverMessage =
            typeof payload === "object" &&
            payload !== null &&
            "error" in payload &&
            typeof payload.error === "string"
              ? payload.error
              : "AI request failed";
          throw new Error(serverMessage);
        }

        const responseSessionId = response.headers.get("x-ai-session-id");

        if (responseSessionId) {
          setSessionId(responseSessionId);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { value, done } = await reader.read();

          if (done) {
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          setMessages((current) =>
            current.map((item, index) =>
              index === current.length - 1
                ? {
                    ...item,
                    content: `${item.content}${chunk}`,
                  }
                : item,
            ),
          );
        }
      } catch (caughtError: unknown) {
        const messageText = caughtError instanceof Error ? caughtError.message : "AI request failed";
        setError(messageText);
        setMessages((current) =>
          current.map((item, index) =>
            index === current.length - 1
              ? {
                  ...item,
                  content: messageText,
                }
              : item,
          ),
        );
      } finally {
        setIsStreaming(false);
      }
    },
    [isStreaming, sessionId],
  );

  const uploadDocs = useCallback(async (text: string) => {
    const response = await fetchJson<{ chunks: number }>("/api/ai/embed", {
      method: "POST",
      body: JSON.stringify({
        text,
      }),
    });

    return response.chunks;
  }, []);

  return {
    messages,
    isStreaming,
    error,
    sendMessage,
    uploadDocs,
  };
}
