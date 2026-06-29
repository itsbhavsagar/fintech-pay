import { type NextRequest, NextResponse } from "next/server";
import { getAnalytics, getDashboardStats } from "@/lib/analytics";
import { jsonError } from "@/lib/api";
import { requireSessionUserId } from "@/lib/auth";
import { parsePeriod } from "@/lib/utils";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = await requireSessionUserId();
    const period = parsePeriod(request.nextUrl.searchParams.get("period"));
    const [analytics, stats] = await Promise.all([
      getAnalytics(userId, period),
      getDashboardStats(userId),
    ]);

    return NextResponse.json(
      {
        ...analytics,
        stats,
      },
      {
        headers: {
          "Cache-Control": "private, max-age=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (error: unknown) {
    return jsonError(error);
  }
}
