import { NextRequest, NextResponse } from "next/server";
import { resumeSubscription } from "@/services/subscription.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const updated = await resumeSubscription(id);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Server error" },
      { status: 400 }
    );
  }
}
