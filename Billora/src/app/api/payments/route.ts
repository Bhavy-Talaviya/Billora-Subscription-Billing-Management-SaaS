import { NextRequest, NextResponse } from "next/server";
import { getPayments, recordPayment } from "@/services/payment.service";
import { createPaymentSchema } from "@/lib/validations/payment";
import { getSessionUserId } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";
    const status = searchParams.get("status") ?? undefined;
    const method = searchParams.get("method") ?? undefined;
    const customerId = searchParams.get("customerId") ?? undefined;
    const invoiceId = searchParams.get("invoiceId") ?? undefined;
    const startDate = searchParams.get("startDate") ?? undefined;
    const endDate = searchParams.get("endDate") ?? undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10))
    );

    const userId = await getSessionUserId();

    const result = await getPayments(
      {
        search,
        status,
        method,
        customerId,
        invoiceId,
        startDate,
        endDate,
        page,
        limit,
      },
      userId
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[GET /api/payments]", error);
    return NextResponse.json(
      { error: "Failed to fetch payment records." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.amount !== undefined) {
      body.amount = Number(body.amount);
    }
    const parsed = createPaymentSchema.safeParse(body);
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
    const payment = await recordPayment(parsed.data, userId);
    return NextResponse.json(payment, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/payments]", error);
    return NextResponse.json(
      { error: error.message ?? "Server error" },
      { status: 400 }
    );
  }
}
