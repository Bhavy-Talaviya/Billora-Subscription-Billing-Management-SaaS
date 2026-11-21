import { NextRequest, NextResponse } from "next/server";
import {
  getDashboardStats,
  DateRangeFilter,
} from "@/services/dashboard.service";
import { getSessionUserId } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const range = (searchParams.get("range") as DateRangeFilter) || "30d";
    const userId = await getSessionUserId();
    const stats = await getDashboardStats(range, userId);
    return NextResponse.json(stats);
  } catch (error: any) {
    console.error("[GET /api/dashboard/stats]", error);
    return NextResponse.json(
      { error: "Failed to load dashboard KPIs." },
      { status: 500 }
    );
  }
}
