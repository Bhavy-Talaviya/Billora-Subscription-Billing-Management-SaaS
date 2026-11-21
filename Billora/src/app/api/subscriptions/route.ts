import { NextRequest, NextResponse } from "next/server";
import {
  getSubscriptions,
  createSubscription,
} from "@/services/subscription.service";
import { createSubscriptionSchema } from "@/lib/validations/subscription";
import { getSessionUserId } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";
    const status = searchParams.get("status") ?? undefined;
    const customerId = searchParams.get("customerId") ?? undefined;
    const productId = searchParams.get("productId") ?? undefined;
    const interval = searchParams.get("interval") ?? undefined;
    const upcomingDays = searchParams.get("upcomingDays")
      ? parseInt(searchParams.get("upcomingDays")!, 10)
      : undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10))
    );

    const userId = await getSessionUserId();

    const result = await getSubscriptions(
      {
        search,
        status,
        customerId,
        productId,
        interval,
        upcomingDays,
        page,
        limit,
      },
      userId
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[GET /api/subscriptions]", error);
    return NextResponse.json(
      { error: "Failed to fetch subscriptions." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createSubscriptionSchema.safeParse(body);
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
    const subscription = await createSubscription(parsed.data, userId);
    return NextResponse.json(subscription, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/subscriptions]", error);
    return NextResponse.json(
      { error: error.message ?? "Server error" },
      { status: 400 }
    );
  }
}
