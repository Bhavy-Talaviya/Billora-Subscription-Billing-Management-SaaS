import { NextResponse } from "next/server";
import { getDashboardActivity } from "@/services/dashboard.service";

export async function GET() {
  try {
    const activity = await getDashboardActivity();
    return NextResponse.json(activity);
  } catch (error: any) {
    console.error("[GET /api/dashboard/renewals]", error);
    return NextResponse.json(
      { error: "Failed to load activity and renewals." },
      { status: 500 }
    );
  }
}
