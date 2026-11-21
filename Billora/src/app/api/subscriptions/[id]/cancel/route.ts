import { NextRequest, NextResponse } from "next/server";
import { cancelSubscription } from "@/services/subscription.service";
import { getSessionUserId } from "@/lib/session";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const userId = await getSessionUserId();
    const updated = await cancelSubscription(id, userId);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Server error" },
      { status: 400 }
    );
  }
}
