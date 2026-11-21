import { NextResponse } from "next/server";
import { getDashboardActivity } from "@/services/dashboard.service";
import { getSessionUserId } from "@/lib/session";

export async function GET() {
  try {
    const userId = await getSessionUserId();
    const activity = await getDashboardActivity(userId);
    return NextResponse.json(activity);
  } catch (error: any) {
    console.error("[GET /api/dashboard/renewals]", error);
    return NextResponse.json(
      { error: "Failed to load activity and renewals." },
      { status: 500 }
    );
  }
}
