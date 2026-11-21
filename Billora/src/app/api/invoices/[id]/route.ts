import { NextRequest, NextResponse } from "next/server";
import {
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
} from "@/services/invoice.service";
import { updateInvoiceSchema } from "@/lib/validations/invoice";
import { getSessionUserId } from "@/lib/session";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const userId = await getSessionUserId();
    const invoice = await getInvoiceById(id, userId);
    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found." },
        { status: 404 }
      );
    }
    return NextResponse.json(invoice);
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
    const body = await req.json();
    const parsed = updateInvoiceSchema.safeParse(body);
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
    const updated = await updateInvoice(id, parsed.data, userId);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Server error" },
      { status: 400 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const userId = await getSessionUserId();
    await deleteInvoice(id, userId);
    return NextResponse.json({ message: "Invoice deleted successfully." });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Server error" },
      { status: 400 }
    );
  }
}
