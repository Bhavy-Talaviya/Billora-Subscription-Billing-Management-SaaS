import { NextRequest, NextResponse } from "next/server";
import {
  getRevenueAnalytics,
  DateRangeFilter,
} from "@/services/dashboard.service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const range = (searchParams.get("range") as DateRangeFilter) || "6m";
    const data = await getRevenueAnalytics(range);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[GET /api/dashboard/revenue]", error);
    return NextResponse.json(
      { error: "Failed to load revenue analytics." },
      { status: 500 }
    );
  }
}
