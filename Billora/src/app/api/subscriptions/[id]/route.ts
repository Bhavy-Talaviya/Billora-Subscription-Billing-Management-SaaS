import { NextRequest, NextResponse } from "next/server";
import { getSubscriptionById } from "@/services/subscription.service";
import prisma from "@/lib/prisma";
import { updateSubscriptionSchema } from "@/lib/validations/subscription";
import { getSessionUserId } from "@/lib/session";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const userId = await getSessionUserId();
    const subscription = await getSubscriptionById(id, userId);
    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found." },
        { status: 404 }
      );
    }
    return NextResponse.json(subscription);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const userId = await getSessionUserId();
    const body = await req.json();
    const parsed = updateSubscriptionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          issues: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const existing = await prisma.subscription.findFirst({
      where: {
        id,
        ...(userId ? { userId } : {}),
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Subscription not found." },
        { status: 404 }
      );
    }

    const updated = await prisma.subscription.update({
      where: { id },
      data: {
        ...(parsed.data.status && { status: parsed.data.status }),
        ...(parsed.data.nextBillingDate !== undefined && {
          nextBillingDate: parsed.data.nextBillingDate
            ? new Date(parsed.data.nextBillingDate)
            : null,
        }),
      },
      include: {
        customer: true,
        price: { include: { product: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Server error" },
      { status: 500 }
    );
  }
}
