"use client";

import { useState } from "react";
import { CreditCard, CheckCircle2, AlertCircle, RotateCcw, Download, MoreHorizontal } from "lucide-react";
import { PageContainer } from "@/components/shared/PageContainer";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { DataTable, Column } from "@/components/shared/DataTable";
import { SearchInput } from "@/components/shared/SearchInput";
import { FilterDropdown } from "@/components/shared/FilterDropdown";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface PaymentTransaction {
  id: string;
  customer: string;
  amount: string;
  method: string;
  status: "succeeded" | "pending" | "failed" | "refunded";
  timestamp: string;
}

const mockPayments: PaymentTransaction[] = [
  {
    id: "TXN-9021-US",
    customer: "Acme Technologies",
    amount: "$2,400.00",
    method: "Visa •••• 4242",
    status: "succeeded",
    timestamp: "Nov 15, 2026 - 14:32",
  },
  {
    id: "TXN-9022-US",
    customer: "Starlight Media",
    amount: "$129.00",
    method: "Mastercard •••• 8812",
    status: "succeeded",
    timestamp: "Nov 14, 2026 - 09:15",
  },
  {
    id: "TXN-9023-US",
    customer: "Nexus Digital Agency",
    amount: "$129.00",
    method: "ACH Direct Debit",
    status: "pending",
    timestamp: "Nov 14, 2026 - 08:00",
  },
  {
    id: "TXN-9024-US",
    customer: "Vanguard Studios",
    amount: "$49.00",
    method: "Visa •••• 1099",
    status: "failed",
    timestamp: "Nov 13, 2026 - 19:44",
  },
  {
    id: "TXN-9025-US",
    customer: "Hyperion Labs",
    amount: "$249.00",
    method: "Amex •••• 3001",
    status: "succeeded",
    timestamp: "Nov 12, 2026 - 11:20",
  },
  {
    id: "TXN-9026-US",
    customer: "Krypton Web Services",
    amount: "$129.00",
    method: "Visa •••• 7731",
    status: "refunded",
    timestamp: "Nov 10, 2026 - 16:05",
  },
];

export default function PaymentsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState<PaymentTransaction | null>(null);

  const filtered = mockPayments.filter((p) => {
    const matchesSearch =
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.customer.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRefund = () => {
    if (selectedTxn) {
      toast.success(`Refund of ${selectedTxn.amount} processed for transaction ${selectedTxn.id}.`);
      setRefundModalOpen(false);
      setSelectedTxn(null);
    }
  };

  const columns: Column<PaymentTransaction>[] = [
    {
      header: "Transaction ID",
      accessorKey: "id",
      cell: (row) => <span className="font-semibold text-slate-900">{row.id}</span>,
    },
    {
      header: "Customer",
      accessorKey: "customer",
      cell: (row) => <span className="font-medium text-slate-900">{row.customer}</span>,
    },
    {
      header: "Amount Charged",
      accessorKey: "amount",
      cell: (row) => <span className="font-semibold text-slate-900">{row.amount}</span>,
    },
    {
      header: "Payment Method",
      accessorKey: "method",
      cell: (row) => (
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
          <CreditCard className="h-3 w-3 text-slate-500" />
          {row.method}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Timestamp",
      accessorKey: "timestamp",
      cell: (row) => <span className="text-xs text-slate-500">{row.timestamp}</span>,
    },
    {
      header: "Actions",
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white border-[#E5E7EB] shadow-md">
            <DropdownMenuItem onClick={() => toast.info(`Viewing receipt for ${row.id}`)}>
              View Receipt
            </DropdownMenuItem>
            {row.status === "succeeded" && (
              <DropdownMenuItem
                className="text-[#EF4444] focus:text-red-600 cursor-pointer"
                onClick={() => {
                  setSelectedTxn(row);
                  setRefundModalOpen(true);
                }}
              >
                Issue Refund
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Payments"
        description="Review simulated customer transactions, track settlement status, and issue refunds."
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Volume Processed" value="$68,400.00" change="+18.2%" trend="up" icon={CreditCard} />
        <StatCard title="Success Rate" value="98.6%" change="+0.4%" trend="up" icon={CheckCircle2} />
        <StatCard title="Pending Settlements" value="$2,140.00" change="ACH pending" trend="neutral" icon={AlertCircle} />
        <StatCard title="Refund Rate" value="0.5%" change="Very low (< 1%)" trend="up" icon={RotateCcw} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Filter by transaction reference or customer..."
        />
        <FilterDropdown
          label="Status"
          selectedValue={statusFilter}
          onSelect={setStatusFilter}
          options={[
            { label: "All Transactions", value: "all" },
            { label: "Succeeded", value: "succeeded" },
            { label: "Pending", value: "pending" },
            { label: "Failed", value: "failed" },
            { label: "Refunded", value: "refunded" },
          ]}
        />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(item) => item.id}
        pagination={{
          currentPage: 1,
          totalPages: 1,
          totalItems: filtered.length,
          pageSize: 10,
          onPageChange: () => {},
        }}
      />

      <ConfirmDialog
        open={refundModalOpen}
        onOpenChange={setRefundModalOpen}
        title="Issue Transaction Refund"
        description={`Are you sure you want to refund ${selectedTxn?.amount} to ${selectedTxn?.customer}? This action is irreversible.`}
        confirmLabel="Issue Full Refund"
        variant="destructive"
        onConfirm={handleRefund}
      />
    </PageContainer>
  );
}
