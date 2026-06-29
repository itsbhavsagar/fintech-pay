import { NextResponse } from "next/server";
import { revalidateUserDashboard } from "@/lib/cache";
import { jsonError } from "@/lib/api";
import { requireSessionUserId } from "@/lib/auth";
import { toTransactionDto } from "@/lib/mappers";
import { prisma } from "@/lib/prisma";

type TransactionRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  context: TransactionRouteContext,
): Promise<NextResponse> {
  try {
    const userId = await requireSessionUserId();
    const { id } = await context.params;
    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: userId,
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ transaction: toTransactionDto(transaction) });
  } catch (error: unknown) {
    return jsonError(error);
  }
}

export async function POST(
  _request: Request,
  context: TransactionRouteContext,
): Promise<NextResponse> {
  try {
    const userId = await requireSessionUserId();
    const { id } = await context.params;

    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: userId,
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found." },
        { status: 404 },
      );
    }

    if (transaction.paymentState === "captured") {
      return NextResponse.json({
        transaction: toTransactionDto(transaction),
      });
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        paymentState: "captured",
        status: "success",
      },
    });

    revalidateUserDashboard(userId);

    return NextResponse.json({
      transaction: toTransactionDto(updated),
    });
  } catch (error: unknown) {
    return jsonError(error);
  }
}
