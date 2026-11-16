"use client";

import { useState } from "react";
import { Plus, FileText, CheckCircle2, Clock, AlertTriangle, Download, Send, MoreHorizontal } from "lucide-react";
import { PageContainer } from "@/components/shared/PageContainer";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { DataTable, Column } from "@/components/shared/DataTable";
import { SearchInput } from "@/components/shared/SearchInput";
import { FilterDropdown } from "@/components/shared/FilterDropdown";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface Invoice {
  id: string;
  customer: string;
  email: string;
  amount: string;
  status: "paid" | "open" | "past_due" | "draft";
  issuedDate: string;
  dueDate: string;
}

const mockInvoices: Invoice[] = [
  {
    id: "INV-2026-001",
    customer: "Acme Technologies",
    email: "billing@acme.com",
    amount: "$2,400.00",
    status: "paid",
    issuedDate: "Nov 01, 2026",
    dueDate: "Nov 15, 2026",
  },
  {
    id: "INV-2026-002",
    customer: "Starlight Media",
    email: "finance@starlight.io",
    amount: "$129.00",
    status: "paid",
    issuedDate: "Nov 05, 2026",
    dueDate: "Nov 19, 2026",
  },
  {
    id: "INV-2026-003",
    customer: "Nexus Digital Agency",
    email: "accounts@nexus.dev",
    amount: "$129.00",
    status: "open",
    issuedDate: "Nov 10, 2026",
    dueDate: "Nov 24, 2026",
  },
  {
    id: "INV-2026-004",
    customer: "Vanguard Studios",
    email: "payments@vanguard.co",
    amount: "$49.00",
    status: "past_due",
    issuedDate: "Oct 25, 2026",
    dueDate: "Nov 08, 2026",
  },
  {
    id: "INV-2026-005",
    customer: "Hyperion Labs",
    email: "alex@hyperion.com",
    amount: "$249.00",
    status: "paid",
    issuedDate: "Nov 12, 2026",
    dueDate: "Nov 26, 2026",
  },
  {
    id: "INV-2026-006",
    customer: "CloudSphere Corp",
    email: "ap@cloudsphere.net",
    amount: "$1,250.00",
    status: "draft",
    issuedDate: "Nov 15, 2026",
    dueDate: "Nov 29, 2026",
  },
];

export default function InvoicesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = mockInvoices.filter((inv) => {
    const matchesSearch =
      inv.id.toLowerCase().includes(search.toLowerCase()) ||
      inv.customer.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns: Column<Invoice>[] = [
    {
      header: "Invoice #",
      accessorKey: "id",
      cell: (row) => <span className="font-semibold text-slate-900">{row.id}</span>,
    },
    {
      header: "Customer",
      cell: (row) => (
        <div>
          <div className="font-medium text-slate-900">{row.customer}</div>
          <div className="text-xs text-slate-400">{row.email}</div>
        </div>
      ),
    },
    {
      header: "Total Amount",
      accessorKey: "amount",
      cell: (row) => <span className="font-semibold text-slate-900">{row.amount}</span>,
    },
    {
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Issued Date",
      accessorKey: "issuedDate",
      cell: (row) => <span className="text-xs text-slate-500">{row.issuedDate}</span>,
    },
    {
      header: "Due Date",
      accessorKey: "dueDate",
      cell: (row) => (
        <span
          className={`text-xs ${
            row.status === "past_due" ? "text-[#EF4444] font-semibold" : "text-slate-500"
          }`}
        >
          {row.dueDate}
        </span>
      ),
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toast.success(`Downloading PDF statement for ${row.id}`)}
            className="h-8 w-8 text-slate-500 hover:text-slate-900"
            title="Download PDF"
          >
            <Download className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border-[#E5E7EB] shadow-md">
              <DropdownMenuItem onClick={() => toast.info(`Viewing ${row.id}`)}>
                View Invoice
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.success(`Payment reminder sent to ${row.email}`)}>
                Send Payment Reminder
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info(`Marking ${row.id} as paid...`)}>
                Record Manual Payment
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Invoices"
        description="Review generated billing statements, manage outstanding receivables, and download receipts."
      >
        <Button
          onClick={() => toast.success("Opening new invoice generator...")}
          className="h-9 gap-1.5 bg-[#2563EB] hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4" />
          <span>New Invoice</span>
        </Button>
      </PageHeader>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Invoiced" value="$54,290.00" change="+14.5%" trend="up" icon={FileText} />
        <StatCard title="Collected & Paid" value="$49,850.00" change="91.8% success" trend="up" icon={CheckCircle2} />
        <StatCard title="Pending / Open" value="$3,420.00" change="Due within 14d" trend="neutral" icon={Clock} />
        <StatCard title="Overdue Balance" value="$1,020.00" change="3 accounts" trend="down" icon={AlertTriangle} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by invoice number or customer..."
        />
        <FilterDropdown
          label="Status"
          selectedValue={statusFilter}
          onSelect={setStatusFilter}
          options={[
            { label: "All Invoices", value: "all" },
            { label: "Paid", value: "paid" },
            { label: "Open / Pending", value: "open" },
            { label: "Past Due", value: "past_due" },
            { label: "Draft", value: "draft" },
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
    </PageContainer>
  );
}
