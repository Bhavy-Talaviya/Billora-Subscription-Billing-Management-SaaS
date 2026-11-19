"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  Plus,
  RefreshCw,
  MoreHorizontal,
  DollarSign,
  ArrowUpRight,
  Receipt,
  RotateCw,
} from "lucide-react";
import { PageContainer } from "@/components/shared/PageContainer";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { DataTable, Column } from "@/components/shared/DataTable";
import { SearchInput } from "@/components/shared/SearchInput";
import { FilterDropdown } from "@/components/shared/FilterDropdown";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TableSkeleton } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RecordPaymentDialog } from "@/components/payments/RecordPaymentDialog";
import { UpdatePaymentStatusDialog } from "@/components/payments/UpdatePaymentStatusDialog";
import { toast } from "sonner";
import { format } from "date-fns";

interface PaymentRow {
  id: string;
  transactionReference: string;
  amount: string;
  paymentMethod: string;
  status: "SUCCEEDED" | "PENDING" | "FAILED";
  paidAt: string | null;
  createdAt: string;
  customer: {
    id: string;
    name: string;
    email: string;
    company: string | null;
  };
  invoice: {
    id: string;
    invoiceNumber: string;
    total: string;
    status: string;
  };
}

interface PaymentsResponse {
  payments: PaymentRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function PaymentsPage() {
  const router = useRouter();
  const [data, setData] = useState<PaymentsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [page, setPage] = useState(1);

  // Dialog states
  const [recordOpen, setRecordOpen] = useState(false);
  const [updateStatusOpen, setUpdateStatusOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRow | null>(
    null
  );

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search,
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(methodFilter !== "all" && { method: methodFilter }),
      });

      const res = await fetch(`/api/payments?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch payments");
      const json: PaymentsResponse = await res.json();
      setData(json);
    } catch {
      toast.error("Failed to load payment transactions.");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, methodFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchPayments, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchPayments, search]);

  const columns: Column<PaymentRow>[] = [
    {
      header: "Reference",
      cell: (row) => (
        <div>
          <span className="font-mono text-xs font-bold text-slate-900 block">
            {row.transactionReference}
          </span>
          <span className="text-[10px] text-slate-400">
            {format(new Date(row.createdAt), "MMM d, yyyy h:mm a")}
          </span>
        </div>
      ),
    },
    {
      header: "Customer",
      cell: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-[#2563EB]">
            {row.customer.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-xs text-slate-900">
              {row.customer.name}
            </div>
            <div className="text-[11px] text-slate-400">
              {row.customer.company || row.customer.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Invoice",
      cell: (row) => (
        <button
          onClick={() => router.push(`/invoices/${row.invoice.id}`)}
          className="font-mono text-xs text-[#2563EB] hover:underline font-medium"
        >
          {row.invoice.invoiceNumber}
        </button>
      ),
    },
    {
      header: "Amount",
      cell: (row) => (
        <span className="font-bold text-xs text-slate-900 font-mono">
          ${Number(row.amount).toFixed(2)}
        </span>
      ),
    },
    {
      header: "Method",
      cell: (row) => (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
          <CreditCard className="h-3 w-3 text-slate-500" />
          {row.paymentMethod}
        </span>
      ),
    },
    {
      header: "Date Settled",
      cell: (row) => (
        <span className="text-xs text-slate-600">
          {row.paidAt ? format(new Date(row.paidAt), "MMM d, yyyy") : "—"}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (row) => <StatusBadge status={row.status.toLowerCase()} />,
    },
    {
      header: "Actions",
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:text-slate-900"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-white border-[#E5E7EB] shadow-lg w-48"
          >
            <DropdownMenuItem
              onClick={() => router.push(`/invoices/${row.invoice.id}`)}
              className="cursor-pointer"
            >
              <Receipt className="mr-2 h-3.5 w-3.5 text-slate-500" />
              View Parent Invoice
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => {
                setSelectedPayment(row);
                setUpdateStatusOpen(true);
              }}
              className="cursor-pointer"
            >
              <RotateCw className="mr-2 h-3.5 w-3.5 text-[#2563EB]" />
              Update Status
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const totalSucceeded =
    data?.payments
      .filter((p) => p.status === "SUCCEEDED")
      .reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;
  const succeededCount =
    data?.payments.filter((p) => p.status === "SUCCEEDED").length ?? 0;
  const pendingCount =
    data?.payments.filter((p) => p.status === "PENDING").length ?? 0;
  const failedCount =
    data?.payments.filter((p) => p.status === "FAILED").length ?? 0;

  return (
    <PageContainer>
      <PageHeader
        title="Payments"
        description="Monitor simulated transaction histories, record invoice payments, and manage client settlements."
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPayments}
            className="h-9 gap-1.5"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            onClick={() => setRecordOpen(true)}
            className="h-9 gap-1.5 bg-[#2563EB] hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Record Payment
          </Button>
        </div>
      </PageHeader>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Settled"
          value={`$${totalSucceeded.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          change={`${succeededCount} transactions`}
          trend="up"
          icon={DollarSign}
        />
        <StatCard
          title="Succeeded"
          value={succeededCount.toString()}
          change="Paid in full"
          trend="up"
          icon={CheckCircle2}
        />
        <StatCard
          title="Pending Settlement"
          value={pendingCount.toString()}
          change="Awaiting confirmation"
          trend="down"
          icon={Clock}
        />
        <StatCard
          title="Failed Attempts"
          value={failedCount.toString()}
          change="Balance preserved"
          trend="down"
          icon={AlertCircle}
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search by transaction reference, invoice #, customer..."
        />
        <div className="flex flex-wrap items-center gap-2">
          <FilterDropdown
            label="Status"
            selectedValue={statusFilter}
            onSelect={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
            options={[
              { label: "All Statuses", value: "all" },
              { label: "Succeeded", value: "SUCCEEDED" },
              { label: "Pending", value: "PENDING" },
              { label: "Failed", value: "FAILED" },
            ]}
          />
          <FilterDropdown
            label="Payment Method"
            selectedValue={methodFilter}
            onSelect={(v) => {
              setMethodFilter(v);
              setPage(1);
            }}
            options={[
              { label: "All Methods", value: "all" },
              { label: "Card", value: "Card" },
              { label: "Bank Transfer", value: "Bank" },
              { label: "UPI", value: "UPI" },
              { label: "Cash", value: "Cash" },
            ]}
          />
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <TableSkeleton rows={7} cols={7} />
      ) : (
        <DataTable
          columns={columns}
          data={data?.payments ?? []}
          keyExtractor={(item) => item.id}
          emptyTitle="No payment records found"
          emptyDescription={
            search
              ? `No transactions matching "${search}".`
              : "Record your first payment against an invoice."
          }
          pagination={{
            currentPage: page,
            totalPages: data?.totalPages ?? 1,
            totalItems: data?.total ?? 0,
            pageSize: 10,
            onPageChange: setPage,
          }}
        />
      )}

      {/* Record Payment Dialog */}
      <RecordPaymentDialog
        open={recordOpen}
        onOpenChange={setRecordOpen}
        onSuccess={fetchPayments}
      />

      {/* Update Payment Status Dialog */}
      {selectedPayment && (
        <UpdatePaymentStatusDialog
          open={updateStatusOpen}
          onOpenChange={setUpdateStatusOpen}
          paymentId={selectedPayment.id}
          txReference={selectedPayment.transactionReference}
          currentStatus={selectedPayment.status}
          amount={selectedPayment.amount}
          onSuccess={fetchPayments}
        />
      )}
    </PageContainer>
  );
}
