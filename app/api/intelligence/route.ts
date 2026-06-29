import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api";
import { requireSessionUserId } from "@/lib/auth";
import { getIntelligence } from "@/lib/intelligence";

export async function GET(): Promise<NextResponse> {
  try {
    const userId = await requireSessionUserId();
    const data = await getIntelligence(userId);

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "private, max-age=60, stale-while-revalidate=300",
      },
    });
  } catch (error: unknown) {
    return jsonError(error);
  }
}
