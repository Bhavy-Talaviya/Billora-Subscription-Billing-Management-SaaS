import { NextRequest, NextResponse } from "next/server";
import {
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
} from "@/services/invoice.service";
import { updateInvoiceSchema } from "@/lib/validations/invoice";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const invoice = await getInvoiceById(id);
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

    const updated = await updateInvoice(id, parsed.data);
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
    await deleteInvoice(id);
    return NextResponse.json({ message: "Invoice deleted successfully." });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Failed to delete invoice" },
      { status: 400 }
    );
  }
}
