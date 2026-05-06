import { z } from "zod";
import { requireSessionUser } from "@/lib/auth";
import { jsonError, parseJsonBody } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { streamChat, type GroqChatMessage } from "@/lib/groq";
import type { Transaction } from "@prisma/client";

const querySchema = z.object({
  query: z.string().min(1).max(500),
  date: z.string().optional(),
});

function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}


function addDays(date: Date, days: number): Date {
  const dayInMs = 24 * 60 * 60 * 1000;
  return new Date(date.getTime() + days * dayInMs);
}

function buildTransactionContext(transactions: Transaction[]): string {
  if (transactions.length === 0) {
    return "No transactions found for this period.";
  }

  const successful = transactions.filter(
    (t) => t.status === "captured" || t.status === "success",
  ).length;
  const failed = transactions.length - successful;
  const successRate = ((successful / transactions.length) * 100).toFixed(1);

  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

  const byCountry = new Map<string, number>();
  const byMethod = new Map<string, number>();
  const byCurrency = new Map<string, number>();

  for (const tx of transactions) {
    byCountry.set(tx.country, (byCountry.get(tx.country) ?? 0) + 1);
    byMethod.set(tx.paymentMethod, (byMethod.get(tx.paymentMethod) ?? 0) + 1);
    byCurrency.set(tx.currency, (byCurrency.get(tx.currency) ?? 0) + 1);
  }

  const topCountries = Array.from(byCountry.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([country, count]) => `${country} (${count})`)
    .join(", ");

  const topMethods = Array.from(byMethod.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([method, count]) => `${method} (${count})`)
    .join(", ");

  const topCurrencies = Array.from(byCurrency.entries())
    .map(([currency, count]) => `${currency} (${count})`)
    .join(", ");

  const failureReasons = new Map<string, number>();
  for (const tx of transactions) {
    if (tx.status !== "captured" && tx.status !== "success") {
      const reason = tx.description ?? tx.status;
      failureReasons.set(reason, (failureReasons.get(reason) ?? 0) + 1);
    }
  }

  const reasonsText =
    failed > 0
      ? "\nFailure reasons: " +
        Array.from(failureReasons.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([reason, count]) => `${reason} (${count})`)
          .join(", ")
      : "";

  return `Transaction Summary:
- Total: ${transactions.length} transactions
- Successful: ${successful} (${successRate}%)
- Failed: ${failed}
- Total Amount: ${totalAmount.toFixed(2)}
- Top Countries: ${topCountries}
- Top Payment Methods: ${topMethods}
- Currencies: ${topCurrencies}${reasonsText}`;
}

export async function POST(request: Request): Promise<Response> {
  try {
    const user = await requireSessionUser();
    const input = await parseJsonBody(request, querySchema);

    let transactions: Transaction[] = [];

    if (input.date) {
      let targetDate = new Date(input.date);
      if (isNaN(targetDate.getTime())) {
        targetDate = new Date(input.date);
      }

      if (isNaN(targetDate.getTime())) {
        targetDate = new Date();
      }

      const startOfDay = startOfUtcDay(targetDate);
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

      transactions = await prisma.transaction.findMany({
        where: {
          userId: user.id,
          createdAt: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
      });
    } else {
      const today = startOfUtcDay(new Date());
      const sevenDaysAgo = addDays(today, -6);

      transactions = await prisma.transaction.findMany({
        where: {
          userId: user.id,
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
      });
    }

    const context = buildTransactionContext(transactions);

    const systemPrompt = `You are the PaySense Intelligence AI, a specialized financial data analyst. 
STRICT RULES:
1. Answer ONLY based on the provided "Transaction Summary" context. 
2. If the user asks something unrelated to this data, politely inform them that you can only analyze their PaySense transaction patterns.
3. Use Markdown for clarity: Use **bold** for key metrics, and bullet points for lists.
4. Be concise and executive: focus on trends, anomalies, and specific numbers.
5. Ground all statements in the actual numbers provided. 
6. Keep response under 120 words.`;

    const messages: GroqChatMessage[] = [
      {
        role: "system",
        content: `${systemPrompt}\n\n${context}`,
      },
      {
        role: "user",
        content: input.query,
      },
    ];

    let fullContent = "";

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
              const data = `data: ${JSON.stringify({ done: true, fullContent })}\n\n`;
              controller.enqueue(encoder.encode(data));
              controller.close();
            },
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
