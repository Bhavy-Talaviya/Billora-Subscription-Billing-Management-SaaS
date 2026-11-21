import { NextRequest, NextResponse } from "next/server";
import {
  getRevenueAnalytics,
  DateRangeFilter,
} from "@/services/dashboard.service";
import { getSessionUserId } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const range = (searchParams.get("range") as DateRangeFilter) || "6m";
    const userId = await getSessionUserId();
    const data = await getRevenueAnalytics(range, userId);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[GET /api/dashboard/revenue]", error);
    return NextResponse.json(
      { error: "Failed to load revenue analytics." },
      { status: 500 }
    );
  }
}
