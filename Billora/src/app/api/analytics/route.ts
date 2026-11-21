import { NextRequest, NextResponse } from "next/server";
import { getDetailedAnalytics } from "@/services/analytics.service";
import { getSessionUserId } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "30d";
    const userId = await getSessionUserId();

    const data = await getDetailedAnalytics(range, userId);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[GET /api/analytics]", error);
    return NextResponse.json(
      { error: "Failed to load live analytics data." },
      { status: 500 }
    );
  }
}
