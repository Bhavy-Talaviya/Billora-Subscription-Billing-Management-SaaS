"use client";

import { useEffect, useState } from "react";
import { FormDialog } from "@/components/shared/FormDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  CreditCard,
  Building,
  Smartphone,
  Banknote,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { format } from "date-fns";

interface RecordPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  preselectedInvoiceId?: string;
}

interface InvoiceOption {
  id: string;
  invoiceNumber: string;
  total: number;
  status: string;
  customer: {
    name: string;
    company: string | null;
  };
}

export function RecordPaymentDialog({
  open,
  onOpenChange,
  onSuccess,
  preselectedInvoiceId,
}: RecordPaymentDialogProps) {
  const [invoices, setInvoices] = useState<InvoiceOption[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  // Selected invoice balance details
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const [balanceData, setBalanceData] = useState<{
    total: number;
    paidAmount: number;
    remainingBalance: number;
    isFullyPaid: boolean;
    customer: { name: string; email: string };
  } | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  // Payment form states
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<
    "CARD" | "BANK_TRANSFER" | "UPI" | "CASH"
  >("CARD");
  const [maskedDetails, setMaskedDetails] = useState("Visa •••• 4242");
  const [paymentDate, setPaymentDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [simulatedStatus, setSimulatedStatus] = useState<
    "SUCCEEDED" | "PENDING" | "FAILED"
  >("SUCCEEDED");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch pending / overdue invoices eligible for payment
  useEffect(() => {
    if (!open) return;
    const fetchInvoices = async () => {
      setLoadingInvoices(true);
      try {
        const res = await fetch("/api/invoices?limit=100");
        if (res.ok) {
          const data = await res.json();
          // Filter out DRAFT invoices; list invoices that need payment or all
          const eligible = (data.invoices || []).filter(
            (inv: any) => inv.status !== "DRAFT"
          );
          setInvoices(eligible);

          if (preselectedInvoiceId) {
            setSelectedInvoiceId(preselectedInvoiceId);
          } else if (eligible.length > 0) {
            setSelectedInvoiceId(eligible[0].id);
          }
        }
      } catch {
        toast.error("Failed to load invoice list.");
      } finally {
        setLoadingInvoices(false);
      }
    };
    fetchInvoices();
  }, [open, preselectedInvoiceId]);

  // Fetch live balance for the selected invoice
  useEffect(() => {
    if (!selectedInvoiceId) {
      setBalanceData(null);
      return;
    }
    const fetchBalance = async () => {
      setLoadingBalance(true);
      try {
        const res = await fetch(`/api/invoices/${selectedInvoiceId}/balance`);
        if (res.ok) {
          const data = await res.json();
          setBalanceData(data);
          // Default amount to remaining balance
          setAmount(data.remainingBalance);
        }
      } catch {
        console.error("Failed to load invoice balance");
      } finally {
        setLoadingBalance(false);
      }
    };
    fetchBalance();
  }, [selectedInvoiceId]);

  // Handle method change and update default masked text
  const handleMethodChange = (
    method: "CARD" | "BANK_TRANSFER" | "UPI" | "CASH"
  ) => {
    setPaymentMethod(method);
    switch (method) {
      case "CARD":
        setMaskedDetails("Visa •••• 4242");
        break;
      case "BANK_TRANSFER":
        setMaskedDetails("ACH Direct Debit (•••• 9012)");
        break;
      case "UPI":
        setMaskedDetails("billora.pay@okhdfcbank");
        break;
      case "CASH":
        setMaskedDetails("Cash on Delivery / Counter");
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedInvoiceId) {
      toast.error("Please select an invoice.");
      return;
    }

    if (amount <= 0) {
      toast.error("Payment amount must be greater than zero.");
      return;
    }

    if (
      balanceData &&
      simulatedStatus === "SUCCEEDED" &&
      amount > balanceData.remainingBalance + 0.001
    ) {
      toast.error(
        `Overpayment blocked: payment amount ($${amount.toFixed(
          2
        )}) exceeds invoice balance ($${balanceData.remainingBalance.toFixed(2)}).`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: selectedInvoiceId,
          amount,
          paymentMethod,
          maskedDetails,
          paymentDate: new Date(paymentDate).toISOString(),
          status: simulatedStatus,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to record payment");
      }

      toast.success(
        simulatedStatus === "SUCCEEDED"
          ? `Payment of $${amount.toFixed(2)} recorded successfully.`
          : simulatedStatus === "PENDING"
          ? `Payment of $${amount.toFixed(2)} recorded as PENDING.`
          : `Simulated FAILED payment logged. Invoice balance unchanged.`
      );

      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Record Payment"
      description="Simulate a client payment transaction against an invoice. No real financial credentials are required or stored."
      maxWidth="lg"
    >
      {loadingInvoices ? (
        <div className="py-8 text-center text-sm text-slate-500">
          Loading invoice data...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Step 1: Select Invoice */}
          <div>
            <label className="text-xs font-semibold text-slate-700">
              Select Invoice <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedInvoiceId}
              onChange={(e) => setSelectedInvoiceId(e.target.value)}
              className="mt-1 flex h-9 w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
              required
            >
              {invoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoiceNumber} — {inv.customer.name} (Total: $
                  {Number(inv.total).toFixed(2)}) [{inv.status}]
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Invoice Balance Details Card */}
          {balanceData && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-xs space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="font-semibold text-slate-700">
                  Customer: {balanceData.customer.name}
                </span>
                <span
                  className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                    balanceData.isFullyPaid
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-[#2563EB]"
                  }`}
                >
                  {balanceData.isFullyPaid ? "Fully Paid" : "Balance Due"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="bg-white p-2 rounded border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Invoice Total
                  </span>
                  <span className="font-bold text-slate-900 text-sm">
                    ${balanceData.total.toFixed(2)}
                  </span>
                </div>
                <div className="bg-white p-2 rounded border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Already Paid
                  </span>
                  <span className="font-bold text-emerald-600 text-sm">
                    ${balanceData.paidAmount.toFixed(2)}
                  </span>
                </div>
                <div className="bg-white p-2 rounded border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Remaining
                  </span>
                  <span className="font-bold text-[#2563EB] text-sm">
                    ${balanceData.remainingBalance.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Enter Payment Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">
                Payment Amount ($) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                max={balanceData ? balanceData.remainingBalance : undefined}
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="mt-1 text-sm font-semibold"
                required
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Supports partial payments up to the balance.
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">
                Payment Date
              </label>
              <Input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="mt-1 text-xs"
                required
              />
            </div>
          </div>

          {/* Step 4: Select Payment Method */}
          <div>
            <label className="text-xs font-semibold text-slate-700">
              Payment Method (Simulated)
            </label>
            <div className="mt-1.5 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "CARD", label: "Card", icon: CreditCard },
                { id: "BANK_TRANSFER", label: "Bank Transfer", icon: Building },
                { id: "UPI", label: "UPI", icon: Smartphone },
                { id: "CASH", label: "Cash", icon: Banknote },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleMethodChange(m.id as any)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-medium transition-all ${
                      isSelected
                        ? "border-[#2563EB] bg-blue-50/70 text-[#2563EB]"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <Icon className="h-4 w-4 mb-1" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Masked reference display (no real credentials) */}
          <div>
            <label className="text-xs font-semibold text-slate-700">
              Masked Display Description
            </label>
            <Input
              type="text"
              value={maskedDetails}
              onChange={(e) => setMaskedDetails(e.target.value)}
              placeholder="Masked payment label"
              className="mt-1 text-xs text-slate-600"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Educational simulation only. Never enter real account or card numbers.
            </p>
          </div>

          {/* Step 5: Choose Simulated Outcome */}
          <div>
            <label className="text-xs font-semibold text-slate-700">
              Simulated Payment Outcome
            </label>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              <label
                className={`p-2 rounded-lg border text-xs cursor-pointer text-center font-medium flex items-center justify-center gap-1.5 transition-all ${
                  simulatedStatus === "SUCCEEDED"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="outcome"
                  value="SUCCEEDED"
                  checked={simulatedStatus === "SUCCEEDED"}
                  onChange={() => setSimulatedStatus("SUCCEEDED")}
                  className="sr-only"
                />
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Succeeded
              </label>

              <label
                className={`p-2 rounded-lg border text-xs cursor-pointer text-center font-medium flex items-center justify-center gap-1.5 transition-all ${
                  simulatedStatus === "PENDING"
                    ? "border-amber-500 bg-amber-50 text-amber-800"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="outcome"
                  value="PENDING"
                  checked={simulatedStatus === "PENDING"}
                  onChange={() => setSimulatedStatus("PENDING")}
                  className="sr-only"
                />
                <Clock className="h-3.5 w-3.5 text-amber-600" />
                Pending
              </label>

              <label
                className={`p-2 rounded-lg border text-xs cursor-pointer text-center font-medium flex items-center justify-center gap-1.5 transition-all ${
                  simulatedStatus === "FAILED"
                    ? "border-red-500 bg-red-50 text-red-800"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="outcome"
                  value="FAILED"
                  checked={simulatedStatus === "FAILED"}
                  onChange={() => setSimulatedStatus("FAILED")}
                  className="sr-only"
                />
                <XCircle className="h-3.5 w-3.5 text-red-600" />
                Failed
              </label>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Failed payments will NOT reduce the invoice balance.
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || amount <= 0}
              className="bg-[#2563EB] hover:bg-blue-700 text-white min-w-[130px]"
            >
              {isSubmitting ? "Processing..." : "Record Payment"}
            </Button>
          </div>
        </form>
      )}
    </FormDialog>
  );
}
