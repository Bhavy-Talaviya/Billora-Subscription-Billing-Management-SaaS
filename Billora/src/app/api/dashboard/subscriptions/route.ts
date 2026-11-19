import { NextRequest, NextResponse } from "next/server";
import { getSubscriptionDistribution } from "@/services/dashboard.service";

export async function GET() {
  try {
    const distribution = await getSubscriptionDistribution();
    return NextResponse.json(distribution);
  } catch (error: any) {
    console.error("[GET /api/dashboard/subscriptions]", error);
    return NextResponse.json(
      { error: "Failed to load subscription distribution." },
      { status: 500 }
    );
  }
}
