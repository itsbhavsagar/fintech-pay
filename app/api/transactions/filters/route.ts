import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api";
import { requireSessionUserId } from "@/lib/auth";
import { getTransactionFilters } from "@/lib/transactions";

export async function GET(): Promise<NextResponse> {
  try {
    const userId = await requireSessionUserId();
    const filters = await getTransactionFilters(userId);

    return NextResponse.json(filters, {
      headers: {
        "Cache-Control": "private, max-age=120, stale-while-revalidate=300",
      },
    });
  } catch (error: unknown) {
    return jsonError(error);
  }
}
