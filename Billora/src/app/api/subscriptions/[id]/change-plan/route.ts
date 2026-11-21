import { NextRequest, NextResponse } from "next/server";
import { changeSubscriptionPlan } from "@/services/subscription.service";
import { changePlanSchema } from "@/lib/validations/subscription";
import { getSessionUserId } from "@/lib/session";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = changePlanSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          issues: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const userId = await getSessionUserId();
    const updated = await changeSubscriptionPlan(id, parsed.data, userId);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Server error" },
      { status: 400 }
    );
  }
}
