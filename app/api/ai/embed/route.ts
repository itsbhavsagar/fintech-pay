import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, parseJsonBody } from "@/lib/api";
import { requireSessionUser } from "@/lib/auth";
import { embedTexts, splitIntoChunks } from "@/lib/cohere";
import { prisma } from "@/lib/prisma";

const embedSchema = z.object({
  text: z.string().min(20).max(20_000),
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const user = await requireSessionUser();
    const input = await parseJsonBody(request, embedSchema);
    const chunks = splitIntoChunks(input.text);
    const embeddings = await embedTexts(chunks, "search_document");

    await prisma.chunk.createMany({
      data: chunks.map((text, index) => ({
        userId: user.id,
        text,
        embedding: embeddings[index] ?? [],
      })),
    });

    return NextResponse.json({
      chunks: chunks.length,
    });
  } catch (error: unknown) {
    return jsonError(error);
  }
}
