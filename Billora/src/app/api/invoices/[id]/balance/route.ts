import { NextRequest, NextResponse } from "next/server";
import { getInvoiceBalance } from "@/services/payment.service";
import { getSessionUserId } from "@/lib/session";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const userId = await getSessionUserId();
    const balanceInfo = await getInvoiceBalance(id, userId);
    return NextResponse.json({
      invoiceId: id,
      invoiceNumber: balanceInfo.invoice.invoiceNumber,
      total: Number(balanceInfo.total),
      paidAmount: Number(balanceInfo.paidAmount),
      remainingBalance: Number(balanceInfo.remainingBalance),
      isFullyPaid: balanceInfo.isFullyPaid,
      customer: balanceInfo.invoice.customer,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Invoice balance not found" },
      { status: 404 }
    );
  }
}
