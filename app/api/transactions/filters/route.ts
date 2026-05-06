import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { requireSessionUser } from "@/lib/auth";
import { jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  try {
    const user = await requireSessionUser();
    
    const getFilters = unstable_cache(
      async (uid: string) => {
        const [currencies, statuses] = await Promise.all([
          prisma.transaction.groupBy({
            by: ["currency"],
            where: { userId: uid },
          }),
          prisma.transaction.groupBy({
            by: ["status"],
            where: { userId: uid },
          }),
        ]);

        return {
          currencies: currencies.map((c) => c.currency).sort(),
          statuses: statuses.map((s) => s.status).sort(),
        };
      },
      ["transaction-filters"],
      { revalidate: 300, tags: [`transaction-filters-${user.id}`] }
    );

    const filters = await getFilters(user.id);

    return NextResponse.json(filters, {
      headers: {
        "Cache-Control": "private, max-age=60, stale-while-revalidate=300",
      },
    });
  } catch (error: unknown) {
    return jsonError(error);
  }
}
