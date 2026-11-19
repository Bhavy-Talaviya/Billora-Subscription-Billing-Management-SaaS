"use client";

import { useEffect, useState, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  Printer,
  Pencil,
  RefreshCw,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { PageContainer } from "@/components/shared/PageContainer";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { InvoiceFormDialog } from "@/components/invoices/InvoiceFormDialog";
import { toast } from "sonner";
import { format } from "date-fns";

interface InvoiceDetail {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  subtotal: string;
  discount: string;
  tax: string;
  total: string;
  status: "DRAFT" | "PENDING" | "PAID" | "OVERDUE";
  notes: string | null;
  customer: {
    id: string;
    name: string;
    email: string;
    company: string | null;
    phone: string | null;
    billingAddress: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
  };
  subscription?: {
    id: string;
    price: {
      billingInterval: string;
      product: {
        name: string;
      };
    };
  } | null;
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: string;
    amount: string;
  }>;
  payments: Array<{
    id: string;
    amount: string;
    paymentMethod: string;
    status: string;
    paidAt: string | null;
    transactionReference: string;
  }>;
}

export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  const fetchInvoice = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/invoices/${id}`);
      if (!res.ok) {
        if (res.status === 404) {
          toast.error("Invoice not found.");
          router.push("/invoices");
          return;
        }
        throw new Error("Failed to load invoice");
      }
      const data: InvoiceDetail = await res.json();
      setInvoice(data);
    } catch {
      toast.error("Failed to load invoice details.");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  const handleDownloadPDF = async () => {
    if (!invoice) return;
    try {
      toast.info(`Generating PDF for #${invoice.invoiceNumber}...`);
      const res = await fetch(`/api/invoices/${invoice.id}/pdf`);
      if (!res.ok) throw new Error("Failed to generate PDF");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("PDF downloaded successfully.");
    } catch (err: any) {
      toast.error(err.message || "Failed to download PDF.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <PageContainer>
        <PageSkeleton />
      </PageContainer>
    );
  }

  if (!invoice) return null;

  return (
    <PageContainer>
      {/* Top action bar - Hidden when printing */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 print:hidden">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/invoices")}
            className="h-8 gap-1.5 text-slate-600"
          >
            <ArrowLeft className="h-4 w-4" /> Invoices
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono text-slate-900">
              #{invoice.invoiceNumber}
            </h1>
            <StatusBadge status={invoice.status.toLowerCase()} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchInvoice}
            className="h-8 gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          {invoice.status !== "PAID" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditOpen(true)}
              className="h-8 gap-1.5"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="h-8 gap-1.5"
          >
            <Printer className="h-3.5 w-3.5" /> Print
          </Button>
          <Button
            size="sm"
            onClick={handleDownloadPDF}
            className="h-8 gap-1.5 bg-[#2563EB] hover:bg-blue-700 text-white"
          >
            <Download className="h-3.5 w-3.5" /> Download PDF
          </Button>
        </div>
      </div>

      {/* Printable Invoice Paper Container */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-8 sm:p-12 shadow-sm max-w-4xl mx-auto print:border-none print:shadow-none print:p-0">
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row justify-between pb-8 border-b border-slate-100 gap-6">
          <div>
            <div className="text-2xl font-black text-[#2563EB] tracking-tight">
              BILLORA
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Subscription Billing & Management SaaS
            </p>
            <div className="text-xs text-slate-500 mt-2 space-y-0.5">
              <p>100 Montgomery Street, Suite 1500</p>
              <p>San Francisco, CA 94104</p>
              <p>billing@billora.com | +1 (800) 555-BILL</p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <h2 className="text-2xl font-bold uppercase tracking-wider text-slate-800">
              INVOICE
            </h2>
            <p className="font-mono text-sm font-bold text-[#2563EB] mt-1">
              #{invoice.invoiceNumber}
            </p>
            <div className="mt-3 inline-block">
              <StatusBadge status={invoice.status.toLowerCase()} />
            </div>
          </div>
        </div>

        {/* Customer & Date Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-8 border-b border-slate-100 text-xs">
          <div>
            <h3 className="font-bold uppercase tracking-wider text-slate-400 text-[10px] mb-2">
              Billed To
            </h3>
            <p className="text-sm font-bold text-slate-900">
              {invoice.customer.name}
            </p>
            {invoice.customer.company && (
              <p className="text-slate-700 font-medium">
                {invoice.customer.company}
              </p>
            )}
            <p className="text-slate-500 mt-1">{invoice.customer.email}</p>
            {invoice.customer.billingAddress && (
              <p className="text-slate-500">
                {invoice.customer.billingAddress}
              </p>
            )}
            <p className="text-slate-500">
              {[
                invoice.customer.city,
                invoice.customer.state,
                invoice.customer.country,
              ]
                .filter(Boolean)
                .join(", ")}
            </p>
          </div>

          <div className="sm:text-right space-y-2">
            <div>
              <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px] block">
                Issue Date
              </span>
              <span className="font-semibold text-slate-800 text-xs">
                {format(new Date(invoice.issueDate), "MMMM d, yyyy")}
              </span>
            </div>
            <div>
              <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px] block">
                Due Date
              </span>
              <span className="font-semibold text-slate-800 text-xs">
                {format(new Date(invoice.dueDate), "MMMM d, yyyy")}
              </span>
            </div>
            {invoice.subscription && (
              <div>
                <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px] block">
                  Subscription Reference
                </span>
                <span className="font-semibold text-[#2563EB] text-xs">
                  {invoice.subscription.price.product.name} (
                  {invoice.subscription.price.billingInterval})
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Line Items Table */}
        <div className="py-6">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="py-3 text-left w-12">#</th>
                <th className="py-3 text-left">Item Description</th>
                <th className="py-3 text-center w-20">Qty</th>
                <th className="py-3 text-right w-28">Unit Price</th>
                <th className="py-3 text-right w-28">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.items.map((item, index) => (
                <tr key={item.id} className="text-slate-800">
                  <td className="py-3 text-slate-400">{index + 1}</td>
                  <td className="py-3 font-medium">{item.description}</td>
                  <td className="py-3 text-center text-slate-600">
                    {item.quantity}
                  </td>
                  <td className="py-3 text-right text-slate-600 font-mono">
                    ${Number(item.unitPrice).toFixed(2)}
                  </td>
                  <td className="py-3 text-right font-bold text-slate-900 font-mono">
                    ${Number(item.amount).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary and Calculation Totals */}
        <div className="flex flex-col sm:flex-row justify-between pt-6 border-t border-slate-100 gap-6">
          {/* Notes */}
          <div className="sm:max-w-xs text-xs text-slate-500">
            {invoice.notes ? (
              <div>
                <span className="font-bold text-slate-700 block mb-1 uppercase text-[10px] tracking-wide">
                  Notes & Terms
                </span>
                <p className="leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 whitespace-pre-line">
                  {invoice.notes}
                </p>
              </div>
            ) : (
              <p className="italic text-slate-400">
                Payment is due within 14 days of issue date. Standard terms apply.
              </p>
            )}
          </div>

          {/* Totals Table */}
          <div className="sm:w-72 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600 py-1">
              <span>Subtotal:</span>
              <span className="font-mono font-medium text-slate-900">
                ${Number(invoice.subtotal).toFixed(2)}
              </span>
            </div>

            {Number(invoice.discount) > 0 && (
              <div className="flex justify-between text-emerald-600 py-1">
                <span>Discount:</span>
                <span className="font-mono font-medium">
                  -${Number(invoice.discount).toFixed(2)}
                </span>
              </div>
            )}

            {Number(invoice.tax) > 0 && (
              <div className="flex justify-between text-slate-600 py-1">
                <span>Tax / VAT:</span>
                <span className="font-mono font-medium text-slate-900">
                  +${Number(invoice.tax).toFixed(2)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-baseline border-t border-slate-200 pt-3 text-base font-bold text-slate-900">
              <span>Grand Total:</span>
              <span className="text-[#2563EB] font-mono text-xl">
                ${Number(invoice.total).toFixed(2)}
              </span>
            </div>

            {/* Payment Record Badge */}
            {invoice.payments.length > 0 && (
              <div className="mt-4 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center justify-between">
                <span className="flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Fully Paid
                </span>
                <span className="font-mono">
                  {format(
                    new Date(invoice.payments[0].paidAt || invoice.issueDate),
                    "MMM d, yyyy"
                  )}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-slate-100 text-center text-[11px] text-slate-400">
          <p>
            Billora SaaS Platform · Electronic Invoicing · Generated automatically
            from ledger records.
          </p>
        </div>
      </div>

      {/* Edit Dialog */}
      <InvoiceFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        initialData={invoice}
        onSuccess={fetchInvoice}
      />
    </PageContainer>
  );
}
