import { NextResponse } from "next/server";
import { getSubscriptionDistribution } from "@/services/dashboard.service";
import { getSessionUserId } from "@/lib/session";

export async function GET() {
  try {
    const userId = await getSessionUserId();
    const data = await getSubscriptionDistribution(userId);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[GET /api/dashboard/subscriptions]", error);
    return NextResponse.json(
      { error: "Failed to load subscription distribution." },
      { status: 500 }
    );
  }
}
