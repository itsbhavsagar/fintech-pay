import { NextResponse } from "next/server";
import { z } from "zod";
import { buildMerchantContext } from "@/lib/analytics";
import { jsonError, parseJsonBody } from "@/lib/api";
import { requireSessionUser } from "@/lib/auth";
import { retrieveRelevantChunks } from "@/lib/cohere";
import { streamChat, type GroqChatMessage } from "@/lib/groq";
import { prisma } from "@/lib/prisma";

const chatSchema = z.object({
  sessionId: z.string().min(1).optional(),
  message: z.string().min(1).max(1_000),
});

const baseSystemPrompt = `You are a payment analytics assistant for PaySense.
You have access to this merchant's transaction data.
Answer questions about revenue, success rates, unusual patterns, and payment insights.
Only answer payment-related questions.
Keep answers under 100 words. No markdown.`;

function toGroqHistoryMessage(
  role: string,
  content: string,
): GroqChatMessage | null {
  if (role === "user" || role === "assistant") {
    return {
      role,
      content,
    };
  }

  return null;
}

export async function POST(request: Request): Promise<Response> {
  try {
    const user = await requireSessionUser();
    const input = await parseJsonBody(request, chatSchema);
    const session = input.sessionId
      ? await prisma.aiSession.findFirst({
          where: {
            id: input.sessionId,
            userId: user.id,
          },
        })
      : await prisma.aiSession.create({
          data: {
            userId: user.id,
          },
        });

    if (!session) {
      return NextResponse.json(
        { error: "Chat session not found." },
        { status: 404 },
      );
    }

    await prisma.aiMessage.create({
      data: {
        sessionId: session.id,
        role: "user",
        content: input.message,
      },
    });

    const [merchantContext, chunkCount] = await Promise.all([
      buildMerchantContext(user.id),
      prisma.chunk.count({
        where: {
          userId: user.id,
        },
      }),
    ]);
    const relevantChunks =
      chunkCount > 0
        ? await retrieveRelevantChunks(user.id, input.message, 3)
        : [];
    const ragContext =
      relevantChunks.length > 0
        ? `\nMerchant docs:\n${relevantChunks.map((chunk) => chunk.text).join("\n---\n")}`
        : "";
    const history = await prisma.aiMessage.findMany({
      where: {
        sessionId: session.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 12,
    });
    const historyMessages = history
      .reverse()
      .map((message) => toGroqHistoryMessage(message.role, message.content))
      .filter((message): message is GroqChatMessage => message !== null);
    const messages: GroqChatMessage[] = [
      {
        role: "system",
        content: `${baseSystemPrompt}\n\nCurrent merchant context:\n${merchantContext}${ragContext}`,
      },
      ...historyMessages,
    ];
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          await streamChat(
            messages,
            (chunk) => {
              controller.enqueue(encoder.encode(chunk));
            },
            async (content) => {
              await prisma.aiMessage.create({
                data: {
                  sessionId: session.id,
                  role: "assistant",
                  content,
                },
              });
            },
          );
          controller.close();
        } catch (error: unknown) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "x-ai-session-id": session.id,
      },
    });
  } catch (error: unknown) {
    return jsonError(error);
  }
}
