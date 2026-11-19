"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Receipt,
  Download,
  Eye,
  Pencil,
  Trash2,
  RefreshCw,
  MoreHorizontal,
  Clock,
  CheckCircle2,
  AlertCircle,
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InvoiceFormDialog } from "@/components/invoices/InvoiceFormDialog";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { toast } from "sonner";
import { format } from "date-fns";

interface InvoiceRow {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  subtotal: string;
  discount: string;
  tax: string;
  total: string;
  status: "DRAFT" | "PENDING" | "PAID" | "OVERDUE";
  customer: {
    id: string;
    name: string;
    email: string;
    company: string | null;
  };
  subscription?: {
    id: string;
    price: {
      product: {
        name: string;
      };
    };
  } | null;
}

interface InvoicesResponse {
  invoices: InvoiceRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function InvoicesPage() {
  const router = useRouter();
  const [data, setData] = useState<InvoicesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [page, setPage] = useState(1);

  // Dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRow | null>(
    null
  );

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search,
        ...(statusFilter !== "all" && { status: statusFilter }),
      });

      // Date range filtering
      const now = new Date();
      if (dateFilter === "thisMonth") {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        params.append("startDate", start.toISOString());
      } else if (dateFilter === "last30") {
        const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        params.append("startDate", start.toISOString());
      }

      const res = await fetch(`/api/invoices?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch invoices");
      const json: InvoicesResponse = await res.json();
      setData(json);
    } catch {
      toast.error("Failed to load invoices.");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, dateFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchInvoices, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchInvoices, search]);

  const handleDownloadPDF = async (inv: InvoiceRow) => {
    try {
      toast.info(`Generating PDF for #${inv.invoiceNumber}...`);
      const res = await fetch(`/api/invoices/${inv.id}/pdf`);
      if (!res.ok) throw new Error("Failed to generate PDF");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${inv.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Invoice #${inv.invoiceNumber} downloaded.`);
    } catch (err: any) {
      toast.error(err.message || "Failed to download PDF.");
    }
  };

  const columns: Column<InvoiceRow>[] = [
    {
      header: "Invoice #",
      cell: (row) => (
        <button
          onClick={() => router.push(`/invoices/${row.id}`)}
          className="font-mono text-xs font-bold text-[#2563EB] hover:underline"
        >
          {row.invoiceNumber}
        </button>
      ),
    },
    {
      header: "Customer",
      cell: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
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
      header: "Issue Date",
      cell: (row) => (
        <span className="text-xs text-slate-600">
          {format(new Date(row.issueDate), "MMM d, yyyy")}
        </span>
      ),
    },
    {
      header: "Due Date",
      cell: (row) => (
        <span className="text-xs text-slate-600">
          {format(new Date(row.dueDate), "MMM d, yyyy")}
        </span>
      ),
    },
    {
      header: "Amount",
      cell: (row) => (
        <div className="text-xs">
          <span className="font-bold text-slate-900">
            ${Number(row.total).toFixed(2)}
          </span>
          {Number(row.discount) > 0 && (
            <span className="text-[10px] text-emerald-600 ml-1">
              (-${Number(row.discount).toFixed(2)})
            </span>
          )}
        </div>
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
              onClick={() => router.push(`/invoices/${row.id}`)}
              className="cursor-pointer"
            >
              <Eye className="mr-2 h-3.5 w-3.5 text-slate-500" />
              View Invoice
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => handleDownloadPDF(row)}
              className="cursor-pointer"
            >
              <Download className="mr-2 h-3.5 w-3.5 text-[#2563EB]" />
              Download PDF
            </DropdownMenuItem>

            {row.status !== "PAID" && (
              <DropdownMenuItem
                onClick={() => {
                  setSelectedInvoice(row);
                  setEditOpen(true);
                }}
                className="cursor-pointer"
              >
                <Pencil className="mr-2 h-3.5 w-3.5 text-slate-500" />
                Edit Invoice
              </DropdownMenuItem>
            )}

            {row.status === "DRAFT" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedInvoice(row);
                    setDeleteOpen(true);
                  }}
                  className="cursor-pointer text-[#EF4444] focus:text-[#EF4444] focus:bg-red-50"
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Delete Draft
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const paidCount =
    data?.invoices.filter((i) => i.status === "PAID").length ?? 0;
  const overdueCount =
    data?.invoices.filter((i) => i.status === "OVERDUE").length ?? 0;
  const pendingCount =
    data?.invoices.filter((i) => i.status === "PENDING").length ?? 0;

  return (
    <PageContainer>
      <PageHeader
        title="Invoices"
        description="Generate, track, and download professional client billing statements and payment records."
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchInvoices}
            className="h-9 gap-1.5"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            onClick={() => setCreateOpen(true)}
            className="h-9 gap-1.5 bg-[#2563EB] hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Create Invoice
          </Button>
        </div>
      </PageHeader>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Invoices"
          value={data?.total?.toString() ?? "—"}
          change="All ledger statements"
          trend="up"
          icon={Receipt}
        />
        <StatCard
          title="Paid Invoices"
          value={paidCount.toString()}
          change="Settled transactions"
          trend="up"
          icon={CheckCircle2}
        />
        <StatCard
          title="Pending Collection"
          value={pendingCount.toString()}
          change="Awaiting payment"
          trend="down"
          icon={Clock}
        />
        <StatCard
          title="Overdue Invoices"
          value={overdueCount.toString()}
          change="Requires follow-up"
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
          placeholder="Search by invoice #, customer name, email..."
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
              { label: "Draft", value: "DRAFT" },
              { label: "Pending", value: "PENDING" },
              { label: "Paid", value: "PAID" },
              { label: "Overdue", value: "OVERDUE" },
            ]}
          />
          <FilterDropdown
            label="Date Range"
            selectedValue={dateFilter}
            onSelect={(v) => {
              setDateFilter(v);
              setPage(1);
            }}
            options={[
              { label: "All Time", value: "all" },
              { label: "This Month", value: "thisMonth" },
              { label: "Past 30 Days", value: "last30" },
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
          data={data?.invoices ?? []}
          keyExtractor={(item) => item.id}
          emptyTitle="No invoices found"
          emptyDescription={
            search
              ? `No invoice records matching "${search}".`
              : "Create your first invoice to begin tracking billing history."
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

      {/* Create Invoice Dialog */}
      <InvoiceFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={fetchInvoices}
      />

      {/* Edit Invoice Dialog */}
      {selectedInvoice && (
        <InvoiceFormDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          initialData={selectedInvoice}
          onSuccess={fetchInvoices}
        />
      )}

      {/* Delete Draft Confirm Dialog */}
      {selectedInvoice && (
        <DeleteConfirmDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title="Delete Draft Invoice"
          description={`Are you sure you want to delete draft invoice #${selectedInvoice.invoiceNumber}?`}
          policyNote="Only DRAFT invoices can be deleted. Once an invoice becomes PENDING, OVERDUE, or PAID, it cannot be deleted to preserve accounting ledger compliance."
          apiUrl={`/api/invoices/${selectedInvoice.id}`}
          onSuccess={() => {
            setSelectedInvoice(null);
            fetchInvoices();
          }}
        />
      )}
    </PageContainer>
  );
}
