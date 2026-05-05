import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, parseJsonBody } from "@/lib/api";
import { requireSessionUser } from "@/lib/auth";
import { toPaymentLinkDto } from "@/lib/mappers";
import { prisma } from "@/lib/prisma";

const updatePaymentLinkSchema = z.object({
  status: z.enum(["active", "expired"]),
});

type RouteParams = {
  params: {
    id: string;
  };
};

export async function PATCH(
  request: Request,
  { params }: RouteParams,
): Promise<NextResponse> {
  try {
    const user = await requireSessionUser();
    const input = await parseJsonBody(request, updatePaymentLinkSchema);

    // Verify link ownership
    const link = await prisma.paymentLink.findUnique({
      where: { id: params.id },
    });

    if (!link) {
      return NextResponse.json(
        { error: "Payment link not found" },
        { status: 404 },
      );
    }

    if (link.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update status
    const updated = await prisma.paymentLink.update({
      where: { id: params.id },
      data: {
        status: input.status,
      },
    });

    return NextResponse.json({
      paymentLink: toPaymentLinkDto(updated),
    });
  } catch (error: unknown) {
    return jsonError(error);
  }
}
