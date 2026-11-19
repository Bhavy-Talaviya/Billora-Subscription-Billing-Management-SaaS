import { NextRequest, NextResponse } from "next/server";
import { getInvoiceById } from "@/services/invoice.service";
import { generateInvoicePDF } from "@/lib/utils/invoicePdf";

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

    const doc = generateInvoicePDF({
      invoiceNumber: invoice.invoiceNumber,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      status: invoice.status,
      subtotal: Number(invoice.subtotal),
      discount: Number(invoice.discount),
      tax: Number(invoice.tax),
      total: Number(invoice.total),
      notes: invoice.notes,
      customer: {
        name: invoice.customer.name,
        email: invoice.customer.email,
        company: invoice.customer.company,
        phone: invoice.customer.phone,
        billingAddress: invoice.customer.billingAddress,
        city: invoice.customer.city,
        state: invoice.customer.state,
        country: invoice.customer.country,
      },
      items: invoice.items.map((it) => ({
        description: it.description,
        quantity: it.quantity,
        unitPrice: Number(it.unitPrice),
        amount: Number(it.amount),
      })),
    });

    const pdfBuffer = doc.output("arraybuffer");

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${invoice.invoiceNumber}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("[GET /api/invoices/[id]/pdf]", error);
    return NextResponse.json(
      { error: "Failed to generate PDF document." },
      { status: 500 }
    );
  }
}
