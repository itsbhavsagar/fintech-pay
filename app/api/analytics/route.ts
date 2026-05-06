import { type NextRequest, NextResponse } from "next/server";
import { getAnalytics, getDashboardStats } from "@/lib/analytics";
import { jsonError } from "@/lib/api";
import { requireSessionUser } from "@/lib/auth";
import { parsePeriod } from "@/lib/utils";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireSessionUser();
    const period = parsePeriod(request.nextUrl.searchParams.get("period"));
    const [analytics, stats] = await Promise.all([getAnalytics(user.id, period), getDashboardStats(user.id)]);

    return NextResponse.json(
      {
        ...analytics,
        stats,
      },
      {
        headers: {
          "Cache-Control": "private, max-age=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error: unknown) {
    return jsonError(error);
  }
}
