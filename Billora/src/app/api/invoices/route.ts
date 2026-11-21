import { NextRequest, NextResponse } from "next/server";
import { getInvoices, createInvoice } from "@/services/invoice.service";
import { createInvoiceSchema } from "@/lib/validations/invoice";
import { getSessionUserId } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";
    const status = searchParams.get("status") ?? undefined;
    const customerId = searchParams.get("customerId") ?? undefined;
    const startDate = searchParams.get("startDate") ?? undefined;
    const endDate = searchParams.get("endDate") ?? undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10))
    );

    const userId = await getSessionUserId();

    const result = await getInvoices(
      {
        search,
        status,
        customerId,
        startDate,
        endDate,
        page,
        limit,
      },
      userId
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[GET /api/invoices]", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createInvoiceSchema.safeParse(body);
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
    const invoice = await createInvoice(parsed.data, userId);
    return NextResponse.json(invoice, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/invoices]", error);
    return NextResponse.json(
      { error: error.message ?? "Server error" },
      { status: 400 }
    );
  }
}
