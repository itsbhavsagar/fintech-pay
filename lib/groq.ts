import Groq from "groq-sdk";
import type { ChatCompletionMessageParam } from "groq-sdk/resources/chat/completions";

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY ?? "",
});

export type GroqChatMessage = ChatCompletionMessageParam;

function assertGroqConfigured(): void {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured.");
  }
}

export async function streamChat(
  messages: GroqChatMessage[],
  onChunk: (chunk: string) => void,
  onDone?: (content: string) => Promise<void> | void,
): Promise<void> {
  assertGroqConfigured();

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages,
    stream: true,
    temperature: 0.2,
    max_completion_tokens: 300,
  });

  let fullContent = "";

  for await (const part of completion) {
    const chunk = part.choices[0]?.delta.content ?? "";

    if (chunk) {
      fullContent += chunk;
      onChunk(chunk);
    }
  }

  await onDone?.(fullContent);
}
