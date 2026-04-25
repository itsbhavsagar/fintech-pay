import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api";
import { requireSessionUser } from "@/lib/auth";

export async function GET(): Promise<NextResponse> {
  try {
    const user = await requireSessionUser();
    return NextResponse.json({ user });
  } catch (error: unknown) {
    return jsonError(error);
  }
}
