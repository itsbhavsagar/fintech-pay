import { CohereClient, type Cohere } from "cohere-ai";
import { prisma } from "@/lib/prisma";

export const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY ?? "",
});

type EmbeddedChunk = {
  id: string;
  text: string;
  score: number;
};

function assertCohereConfigured(): void {
  if (!process.env.COHERE_API_KEY) {
    throw new Error("COHERE_API_KEY is not configured.");
  }
}

export function splitIntoChunks(text: string): string[] {
  const normalized = text.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return [];
  }

  const chunks: string[] = [];
  const words = normalized.split(" ");
  const chunkSize = 180;
  const overlap = 30;

  for (let index = 0; index < words.length; index += chunkSize - overlap) {
    chunks.push(words.slice(index, index + chunkSize).join(" "));
  }

  return chunks;
}

export async function embedTexts(texts: string[], inputType: Cohere.EmbedInputType): Promise<number[][]> {
  assertCohereConfigured();

  if (texts.length === 0) {
    return [];
  }

  const response = await cohere.embed({
    texts,
    model: "embed-english-v3.0",
    inputType,
    embeddingTypes: ["float"],
    truncate: "END",
  });

  if (response.responseType === "embeddings_by_type") {
    return response.embeddings.float ?? [];
  }

  return response.embeddings;
}

export function cosineSimilarity(left: number[], right: number[]): number {
  const length = Math.min(left.length, right.length);
  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;

  for (let index = 0; index < length; index += 1) {
    const leftValue = left[index] ?? 0;
    const rightValue = right[index] ?? 0;
    dot += leftValue * rightValue;
    leftMagnitude += leftValue * leftValue;
    rightMagnitude += rightValue * rightValue;
  }

  if (leftMagnitude === 0 || rightMagnitude === 0) {
    return 0;
  }

  return dot / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude));
}

export async function retrieveRelevantChunks(userId: string, query: string, limit = 3): Promise<EmbeddedChunk[]> {
  const [queryEmbedding] = await embedTexts([query], "search_query");

  if (!queryEmbedding) {
    return [];
  }

  const chunks = await prisma.chunk.findMany({
    where: {
      userId,
    },
    select: {
      id: true,
      text: true,
      embedding: true,
    },
  });

  return chunks
    .map((chunk) => ({
      id: chunk.id,
      text: chunk.text,
      score: cosineSimilarity(queryEmbedding, chunk.embedding),
    }))
    .filter((chunk) => chunk.score > 0.2)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit);
}
