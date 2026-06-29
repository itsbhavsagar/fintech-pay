import { z } from "zod";
import { buildAssistantMessages } from "@/lib/assistant";
import { requireSessionUser } from "@/lib/auth";
import { jsonError, parseJsonBody } from "@/lib/api";
import { streamChat } from "@/lib/groq";

const querySchema = z.object({
  query: z.string().min(1).max(500),
  date: z.string().optional(),
});

export async function POST(request: Request): Promise<Response> {
  try {
    const user = await requireSessionUser();
    const input = await parseJsonBody(request, querySchema);

    const messages = await buildAssistantMessages(user.id, input.query, {
      focusDate: input.date,
    });

    const encoder = new TextEncoder();
    const customStream = new ReadableStream({
      async start(controller) {
        try {
          await streamChat(
            messages,
            (chunk) => {
              const data = `data: ${JSON.stringify({ token: chunk })}\n\n`;
              controller.enqueue(encoder.encode(data));
            },
            async () => {
              const data = `data: ${JSON.stringify({ done: true })}\n\n`;
              controller.enqueue(encoder.encode(data));
              controller.close();
            },
            { maxCompletionTokens: 500 },
          );
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : "Unknown error";
          const data = `data: ${JSON.stringify({ error: errorMsg })}\n\n`;
          controller.enqueue(encoder.encode(data));
          controller.close();
        }
      },
    });

    return new Response(customStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: unknown) {
    return jsonError(error);
  }
}
