import { type NextRequest, NextResponse } from "next/server";
import { jsonError } from "@/lib/api";
import { requireSessionUserId } from "@/lib/auth";
import { normalizeDateRange } from "@/lib/date-range";
import { getTransactionsPage } from "@/lib/transactions";
import { getPaginationParams } from "@/lib/utils";
import type { TransactionStatus } from "@/types/domain";

const statuses: readonly TransactionStatus[] = ["success", "failed", "pending"];

function getStatus(value: string | null): TransactionStatus | null {
  return statuses.find((status) => status === value) ?? null;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = await requireSessionUserId();
    const params = request.nextUrl.searchParams;
    const { limit, cursor } = getPaginationParams(request, 10);
    const search = params.get("search")?.trim();
    const currency = params.get("currency")?.trim();
    const from = params.get("from");
    const to = params.get("to");
    const status = getStatus(params.get("status"));
    const dateRange = normalizeDateRange(from ?? undefined, to ?? undefined);

    const page = await getTransactionsPage(userId, {
      search,
      currency,
      from: dateRange.from,
      to: dateRange.to,
      status: status ?? "all",
      limit,
      cursor,
    });

    return NextResponse.json(page, {
      headers: {
        "Cache-Control": "private, max-age=60, stale-while-revalidate=300",
      },
    });
  } catch (error: unknown) {
    return jsonError(error);
  }
}
