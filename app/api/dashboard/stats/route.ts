import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api";
import { requireSessionUserId } from "@/lib/auth";
import { getDashboardStats } from "@/lib/analytics";

export async function GET(): Promise<NextResponse> {
  try {
    const userId = await requireSessionUserId();
    const stats = await getDashboardStats(userId);

    return NextResponse.json(stats, {
      headers: {
        "Cache-Control": "private, max-age=60, stale-while-revalidate=300",
      },
    });
  } catch (error: unknown) {
    return jsonError(error);
  }
}
