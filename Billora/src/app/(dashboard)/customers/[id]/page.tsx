"use client";

import { useEffect, useState, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  CreditCard,
  Receipt,
  RefreshCw,
  Pencil,
} from "lucide-react";
import { PageContainer } from "@/components/shared/PageContainer";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CustomerFormDialog } from "@/components/customers/CustomerFormDialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { CustomerInput } from "@/lib/validations/customer";

type Tab = "overview" | "subscriptions" | "invoices" | "payments";

interface CustomerDetail {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  billingAddress: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  stats: {
    totalAmountPaid: number;
    activeSubscriptionsCount: number;
    totalInvoicesCount: number;
    totalPaymentsCount: number;
  };
  subscriptions: Array<{
    id: string;
    status: string;
    startDate: string;
    currentPeriodEnd: string;
    nextBillingDate: string | null;
    price: {
      amount: string;
      currency: string;
      billingInterval: string;
      product: { name: string };
    };
  }>;
  invoices: Array<{
    id: string;
    invoiceNumber: string;
    issueDate: string;
    dueDate: string;
    total: string;
    status: string;
  }>;
  payments: Array<{
    id: string;
    amount: string;
    paymentMethod: string;
    status: string;
    paidAt: string | null;
    createdAt: string;
    invoice: { invoiceNumber: string; total: string };
  }>;
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-0">
      <Icon className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-sm text-slate-700 font-medium mt-0.5 break-words">{value}</p>
      </div>
    </div>
  );
}

function StatBadge({
  label,
  value,
  color = "blue",
}: {
  label: string;
  value: string | number;
  color?: "blue" | "green" | "slate" | "purple";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    green: "bg-green-50 text-green-700 border-green-100",
    slate: "bg-slate-50 text-slate-700 border-slate-200",
    purple: "bg-purple-50 text-purple-700 border-purple-100",
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [editOpen, setEditOpen] = useState(false);

  const fetchCustomer = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/customers/${id}`);
      if (!res.ok) {
        if (res.status === 404) {
          toast.error("Customer not found.");
          router.push("/customers");
          return;
        }
        throw new Error("Failed to load");
      }
      setCustomer(await res.json());
    } catch {
      toast.error("Failed to load customer details.");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "overview", label: "Overview" },
    { key: "subscriptions", label: "Subscriptions", count: customer?.subscriptions.length },
    { key: "invoices", label: "Invoices", count: customer?.invoices.length },
    { key: "payments", label: "Payments", count: customer?.payments.length },
  ];

  const editData: (CustomerInput & { id: string }) | null = customer
    ? {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone ?? "",
        company: customer.company ?? "",
        billingAddress: customer.billingAddress ?? "",
        city: customer.city ?? "",
        state: customer.state ?? "",
        postalCode: customer.postalCode ?? "",
        country: customer.country ?? "",
        notes: customer.notes ?? "",
      }
    : null;

  if (loading) {
    return (
      <PageContainer>
        <PageSkeleton />
      </PageContainer>
    );
  }

  if (!customer) return null;

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/customers")}
            className="h-8 gap-1.5 text-slate-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Customers
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-lg font-bold text-[#2563EB] border border-blue-100">
              {customer.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{customer.name}</h1>
              <p className="text-sm text-slate-500">{customer.email}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCustomer}
            className="h-8 gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            onClick={() => setEditOpen(true)}
            className="h-8 gap-1.5 bg-[#2563EB] hover:bg-blue-700 text-white"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatBadge
          label="Total Paid"
          value={`$${customer.stats.totalAmountPaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          color="green"
        />
        <StatBadge
          label="Active Subscriptions"
          value={customer.stats.activeSubscriptionsCount}
          color="blue"
        />
        <StatBadge
          label="Total Invoices"
          value={customer.stats.totalInvoicesCount}
          color="purple"
        />
        <StatBadge
          label="Payments Made"
          value={customer.stats.totalPaymentsCount}
          color="slate"
        />
      </div>

      {/* Tabs */}
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

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Info */}
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-slate-400" /> Contact Information
            </h3>
            <div>
              <InfoRow icon={Mail} label="Email" value={customer.email} />
              <InfoRow icon={Phone} label="Phone" value={customer.phone} />
              <InfoRow icon={Building2} label="Company" value={customer.company} />
              <InfoRow icon={MapPin} label="Billing Address" value={customer.billingAddress} />
              <InfoRow
                icon={MapPin}
                label="Location"
                value={
                  [customer.city, customer.state, customer.postalCode, customer.country]
                    .filter(Boolean)
                    .join(", ") || null
                }
              />
              <InfoRow
                icon={Calendar}
                label="Customer Since"
                value={format(new Date(customer.createdAt), "MMMM d, yyyy")}
              />
            </div>
          </div>
          {/* Notes */}
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Account Notes</h3>
            {customer.notes ? (
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                {customer.notes}
              </p>
            ) : (
              <p className="text-sm text-slate-400 italic">No notes added for this customer.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === "subscriptions" && (
        <div className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Product</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Interval</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Start Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Next Billing</th>
              </tr>
            </thead>
            <tbody>
              {customer.subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">
                    No subscriptions found for this customer.
                  </td>
                </tr>
              ) : (
                customer.subscriptions.map((sub) => (
                  <tr key={sub.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">{sub.price.product.name}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      ${Number(sub.price.amount).toFixed(2)} {sub.price.currency}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        {sub.price.billingInterval}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={sub.status.toLowerCase()} />
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {format(new Date(sub.startDate), "MMM d, yyyy")}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {sub.nextBillingDate
                        ? format(new Date(sub.nextBillingDate), "MMM d, yyyy")
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "invoices" && (
        <div className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Invoice #</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Issue Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Due Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Total</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {customer.invoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-400">
                    No invoices found for this customer.
                  </td>
                </tr>
              ) : (
                customer.invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-[#2563EB]">
                      {inv.invoiceNumber}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {format(new Date(inv.issueDate), "MMM d, yyyy")}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {format(new Date(inv.dueDate), "MMM d, yyyy")}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      ${Number(inv.total).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={inv.status.toLowerCase()} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "payments" && (
        <div className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Invoice</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Method</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Paid At</th>
              </tr>
            </thead>
            <tbody>
              {customer.payments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-400">
                    No payments found for this customer.
                  </td>
                </tr>
              ) : (
                customer.payments.map((pmt) => (
                  <tr key={pmt.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-[#2563EB]">
                      {pmt.invoice.invoiceNumber}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      ${Number(pmt.amount).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 capitalize">
                      {pmt.paymentMethod.replace(/_/g, " ")}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={pmt.status.toLowerCase()} />
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {pmt.paidAt
                        ? format(new Date(pmt.paidAt), "MMM d, yyyy")
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Customer Dialog */}
      <CustomerFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={fetchCustomer}
        initialData={editData}
      />
    </PageContainer>
  );
}
