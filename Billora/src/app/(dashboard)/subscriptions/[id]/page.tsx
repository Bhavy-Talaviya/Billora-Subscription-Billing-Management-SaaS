"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Receipt,
  Activity,
  ArrowUpDown,
  Pause,
  Play,
  XCircle,
  RefreshCw,
  Clock,
  User,
  Building2,
  Mail,
  ShieldAlert,
  CheckCircle2,
  Tag,
} from "lucide-react";
import { PageContainer } from "@/components/shared/PageContainer";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { ChangePlanDialog } from "@/components/subscriptions/ChangePlanDialog";
import {
  SubscriptionActionDialog,
  SubscriptionActionType,
} from "@/components/subscriptions/SubscriptionActionDialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { formatPrice, formatIntervalLabel } from "@/lib/utils/currency";

type Tab = "overview" | "billing-history" | "invoices" | "activity";

interface SubscriptionDetail {
  id: string;
  status: "ACTIVE" | "PAUSED" | "CANCELLED" | "PAST_DUE";
  startDate: string;
  nextBillingDate: string | null;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelledAt: string | null;
  pausedAt: string | null;
  createdAt: string;
  updatedAt: string;
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
  price: {
    id: string;
    amount: string;
    currency: string;
    billingInterval: "MONTHLY" | "YEARLY" | "ONE_TIME";
    product: {
      id: string;
      name: string;
      description: string | null;
    };
  };
  invoices: Array<{
    id: string;
    invoiceNumber: string;
    issueDate: string;
    dueDate: string;
    subtotal: string;
    total: string;
    status: string;
    notes: string | null;
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
  }>;
}

export default function SubscriptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [sub, setSub] = useState<SubscriptionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // Dialogs
  const [changePlanOpen, setChangePlanOpen] = useState(false);
  const [actionOpen, setActionOpen] = useState(false);
  const [actionType, setActionType] = useState<SubscriptionActionType>("PAUSE");

  const fetchSubscription = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/subscriptions/${id}`);
      if (!res.ok) {
        if (res.status === 404) {
          toast.error("Subscription not found.");
          router.push("/subscriptions");
          return;
        }
        throw new Error("Failed to load subscription");
      }
      const data: SubscriptionDetail = await res.json();
      setSub(data);
    } catch {
      toast.error("Failed to load subscription details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [id]);

  const openAction = (type: SubscriptionActionType) => {
    setActionType(type);
    setActionOpen(true);
  };

  if (loading) {
    return (
      <PageContainer>
        <PageSkeleton />
      </PageContainer>
    );
  }

  if (!sub) return null;

  const totalInvoiced = sub.invoices.reduce(
    (sum, inv) => sum + Number(inv.total),
    0
  );
  const totalPaid = sub.invoices.reduce((sum, inv) => {
    const paidPayments = inv.payments
      .filter((p) => p.status === "SUCCEEDED")
      .reduce((pSum, p) => pSum + Number(p.amount), 0);
    return sum + paidPayments;
  }, 0);

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "overview", label: "Overview" },
    { key: "billing-history", label: "Billing History" },
    { key: "invoices", label: "Invoices", count: sub.invoices.length },
    { key: "activity", label: "Activity Timeline" },
  ];

  return (
    <PageContainer>
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/subscriptions")}
            className="h-8 gap-1.5 text-slate-600"
          >
            <ArrowLeft className="h-4 w-4" /> Subscriptions
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">
                {sub.price.product.name}
              </h1>
              <StatusBadge status={sub.status.toLowerCase()} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Customer:{" "}
              <span className="font-semibold text-slate-700">
                {sub.customer.name}
              </span>{" "}
              ({sub.customer.email})
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSubscription}
            className="h-8 gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>

          {sub.status !== "CANCELLED" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setChangePlanOpen(true)}
              className="h-8 gap-1.5 text-slate-700"
            >
              <ArrowUpDown className="h-3.5 w-3.5" /> Change Plan
            </Button>
          )}

          {sub.status === "ACTIVE" && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openAction("PAUSE")}
                className="h-8 gap-1.5 text-amber-700 border-amber-200 hover:bg-amber-50"
              >
                <Pause className="h-3.5 w-3.5" /> Pause
              </Button>
              {sub.price.billingInterval !== "ONE_TIME" && (
                <Button
                  size="sm"
                  onClick={() => openAction("RENEW")}
                  className="h-8 gap-1.5 bg-[#2563EB] hover:bg-blue-700 text-white"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Simulate Renewal
                </Button>
              )}
            </>
          )}

          {sub.status === "PAUSED" && (
            <Button
              size="sm"
              onClick={() => openAction("RESUME")}
              className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Play className="h-3.5 w-3.5" /> Resume
            </Button>
          )}

          {sub.status !== "CANCELLED" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => openAction("CANCEL")}
              className="h-8 gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
            >
              <XCircle className="h-3.5 w-3.5" /> Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Current Tier Amount
          </p>
          <p className="text-2xl font-bold text-[#2563EB] mt-1">
            {formatPrice(
              sub.price.amount,
              sub.price.currency,
              sub.price.billingInterval
            )}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {formatIntervalLabel(sub.price.billingInterval)} cycle
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Next Renewal Date
          </p>
          <p className="text-xl font-bold text-slate-900 mt-1">
            {sub.status === "PAUSED"
              ? "Paused"
              : sub.status === "CANCELLED"
              ? "Cancelled"
              : sub.nextBillingDate
              ? format(new Date(sub.nextBillingDate), "MMM d, yyyy")
              : "None (One-time)"}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {sub.status === "ACTIVE"
              ? "Eligible for renewal"
              : "Renewals halted"}
          </p>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
            Total Revenue Paid
          </p>
          <p className="text-2xl font-bold text-emerald-800 mt-1">
            ${totalPaid.toFixed(2)}
          </p>
          <p className="text-[11px] text-emerald-600 mt-0.5">
            {sub.invoices.length} historical invoices
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Subscription Age
          </p>
          <p className="text-xl font-bold text-slate-800 mt-1">
            {format(new Date(sub.startDate), "MMM d, yyyy")}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Active for customer
          </p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="border-b border-[#E5E7EB]">
        <nav className="flex gap-1 -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-[#2563EB] text-[#2563EB]"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={`inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                    activeTab === tab.key
                      ? "bg-blue-100 text-[#2563EB]"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Card */}
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-slate-400" /> Customer Account
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">Customer Name:</span>
                <span className="font-semibold text-slate-800">
                  {sub.customer.name}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">Email:</span>
                <span className="font-semibold text-slate-800">
                  {sub.customer.email}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">Company:</span>
                <span className="font-medium text-slate-700">
                  {sub.customer.company || "—"}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">Phone:</span>
                <span className="font-medium text-slate-700">
                  {sub.customer.phone || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Billing Country:</span>
                <span className="font-medium text-slate-700">
                  {sub.customer.country || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Plan & Lifecycle Details */}
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Tag className="h-4 w-4 text-slate-400" /> Subscription Plan Details
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">Product:</span>
                <span className="font-semibold text-slate-800">
                  {sub.price.product.name}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">Billing Interval:</span>
                <span className="font-medium text-slate-700">
                  {formatIntervalLabel(sub.price.billingInterval)}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">Current Period Start:</span>
                <span className="font-medium text-slate-700">
                  {format(new Date(sub.currentPeriodStart), "MMMM d, yyyy")}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">Current Period End:</span>
                <span className="font-medium text-slate-700">
                  {sub.price.billingInterval === "ONE_TIME"
                    ? "Lifetime"
                    : format(new Date(sub.currentPeriodEnd), "MMMM d, yyyy")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status Policy:</span>
                <span className="font-semibold text-slate-800">
                  {sub.status === "ACTIVE"
                    ? "Active & Auto-Renewing"
                    : sub.status === "PAUSED"
                    ? "Paused (No Billing)"
                    : sub.status === "CANCELLED"
                    ? "Terminated"
                    : "Past Due"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Billing History */}
      {activeTab === "billing-history" && (
        <div className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">
                Billing Cycles & Ledger Entries
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Every simulated renewal, plan upgrade, and transaction ledger entry.
              </p>
            </div>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-slate-50 text-slate-500 font-semibold uppercase">
                <th className="px-4 py-3 text-left">Invoice Ref</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sub.invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-mono font-semibold text-[#2563EB]">
                    {inv.invoiceNumber}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {format(new Date(inv.issueDate), "MMM d, yyyy")}
                  </td>
                  <td className="px-4 py-3 text-slate-700 max-w-sm truncate">
                    {inv.notes ||
                      `${sub.price.product.name} (${sub.price.billingInterval})`}
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900">
                    ${Number(inv.total).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={inv.status.toLowerCase()} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Invoices */}
      {activeTab === "invoices" && (
        <div className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-slate-50 text-slate-500 font-semibold uppercase">
                <th className="px-4 py-3 text-left">Invoice #</th>
                <th className="px-4 py-3 text-left">Issue Date</th>
                <th className="px-4 py-3 text-left">Due Date</th>
                <th className="px-4 py-3 text-left">Total</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Payments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sub.invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-mono font-semibold text-[#2563EB]">
                    {inv.invoiceNumber}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {format(new Date(inv.issueDate), "MMM d, yyyy")}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {format(new Date(inv.dueDate), "MMM d, yyyy")}
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900">
                    ${Number(inv.total).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={inv.status.toLowerCase()} />
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {inv.payments.length > 0 ? (
                      <span className="text-emerald-700 font-medium">
                        Paid ({inv.payments[0].paymentMethod})
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Unpaid</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: Activity Timeline */}
      {activeTab === "activity" && (
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">
            Subscription Lifecycle Timeline
          </h3>
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {/* Created event */}
            <div className="relative">
              <span className="absolute -left-[27px] top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-blue-600" />
              <div className="text-xs">
                <span className="font-semibold text-slate-900">
                  Subscription Created
                </span>
                <span className="text-slate-400 ml-2">
                  {format(new Date(sub.createdAt), "MMM d, yyyy h:mm a")}
                </span>
                <p className="text-slate-600 mt-1">
                  Enrolled {sub.customer.name} into {sub.price.product.name} (
                  {formatPrice(
                    sub.price.amount,
                    sub.price.currency,
                    sub.price.billingInterval
                  )}
                  ).
                </p>
              </div>
            </div>

            {/* Paused event (if paused) */}
            {sub.pausedAt && (
              <div className="relative">
                <span className="absolute -left-[27px] top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-amber-500" />
                <div className="text-xs">
                  <span className="font-semibold text-slate-900">
                    Subscription Paused
                  </span>
                  <span className="text-slate-400 ml-2">
                    {format(new Date(sub.pausedAt), "MMM d, yyyy h:mm a")}
                  </span>
                  <p className="text-slate-600 mt-1">
                    Automatic renewals suspended. No simulated charges will be
                    billed until resumed.
                  </p>
                </div>
              </div>
            )}

            {/* Cancelled event (if cancelled) */}
            {sub.cancelledAt && (
              <div className="relative">
                <span className="absolute -left-[27px] top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-red-600" />
                <div className="text-xs">
                  <span className="font-semibold text-slate-900">
                    Subscription Cancelled
                  </span>
                  <span className="text-slate-400 ml-2">
                    {format(new Date(sub.cancelledAt), "MMM d, yyyy h:mm a")}
                  </span>
                  <p className="text-slate-600 mt-1">
                    Subscription terminated permanently.
                  </p>
                </div>
              </div>
            )}

            {/* Invoices generated timeline points */}
            {sub.invoices.map((inv) => (
              <div key={inv.id} className="relative">
                <span className="absolute -left-[27px] top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
                <div className="text-xs">
                  <span className="font-semibold text-slate-900">
                    Invoice {inv.invoiceNumber} Generated (${Number(inv.total).toFixed(2)})
                  </span>
                  <span className="text-slate-400 ml-2">
                    {format(new Date(inv.issueDate), "MMM d, yyyy")}
                  </span>
                  <p className="text-slate-600 mt-1">
                    {inv.notes || "Periodic subscription renewal charge."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dialog: Change Plan */}
      <ChangePlanDialog
        open={changePlanOpen}
        onOpenChange={setChangePlanOpen}
        subscriptionId={sub.id}
        currentPriceId={sub.price.id}
        currentPriceAmount={sub.price.amount}
        currentCurrency={sub.price.currency}
        currentInterval={sub.price.billingInterval}
        productId={sub.price.product.id}
        productName={sub.price.product.name}
        onSuccess={fetchSubscription}
      />

      {/* Dialog: Actions */}
      <SubscriptionActionDialog
        open={actionOpen}
        onOpenChange={setActionOpen}
        subscriptionId={sub.id}
        customerName={sub.customer.name}
        productName={sub.price.product.name}
        actionType={actionType}
        onSuccess={fetchSubscription}
      />
    </PageContainer>
  );
}
