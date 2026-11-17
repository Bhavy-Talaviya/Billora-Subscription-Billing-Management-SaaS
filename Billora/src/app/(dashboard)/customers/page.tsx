"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Users,
  UserCheck,
  TrendingUp,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Building2,
  Phone,
  Calendar,
  Receipt,
  RefreshCw,
} from "lucide-react";
import { PageContainer } from "@/components/shared/PageContainer";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { DataTable, Column } from "@/components/shared/DataTable";
import { SearchInput } from "@/components/shared/SearchInput";
import { FilterDropdown } from "@/components/shared/FilterDropdown";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TableSkeleton } from "@/components/shared/LoadingSkeleton";
import { CustomerFormDialog } from "@/components/customers/CustomerFormDialog";
import { CustomerDeleteDialog } from "@/components/customers/CustomerDeleteDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { format } from "date-fns";
import { CustomerInput } from "@/lib/validations/customer";

interface CustomerRow {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  country: string | null;
  createdAt: string;
  _count: {
    subscriptions: number;
    invoices: number;
    payments: number;
  };
}

interface CustomersResponse {
  customers: CustomerRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function CustomersPage() {
  const router = useRouter();
  const [data, setData] = useState<CustomersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [page, setPage] = useState(1);

  // Dialog state
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<
    (CustomerInput & { id: string }) | null
  >(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingName, setDeletingName] = useState<string>("");

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search,
        ...(countryFilter !== "all" && { country: countryFilter }),
      });
      const res = await fetch(`/api/customers?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json: CustomersResponse = await res.json();
      setData(json);
    } catch {
      toast.error("Failed to load customers. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, [page, search, countryFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchCustomers, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchCustomers, search]);

  const handleEdit = (customer: CustomerRow) => {
    setSelectedCustomer({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone ?? "",
      company: customer.company ?? "",
      billingAddress: "",
      city: "",
      state: "",
      postalCode: "",
      country: customer.country ?? "",
      notes: "",
    });
    setEditOpen(true);
  };

  const handleDeleteClick = (customer: CustomerRow) => {
    setDeletingId(customer.id);
    setDeletingName(customer.name);
    setDeleteOpen(true);
  };

  const columns: Column<CustomerRow>[] = [
    {
      header: "Customer",
      cell: (row) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-[#2563EB] border border-blue-100">
            {row.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <button
              onClick={() => router.push(`/customers/${row.id}`)}
              className="font-semibold text-slate-900 hover:text-[#2563EB] transition-colors truncate block"
            >
              {row.name}
            </button>
            <div className="text-xs text-slate-400 truncate">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Company",
      cell: (row) => (
        <div className="flex items-center gap-1.5 text-slate-700">
          {row.company ? (
            <>
              <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="font-medium text-sm truncate">{row.company}</span>
            </>
          ) : (
            <span className="text-slate-400 text-xs italic">—</span>
          )}
        </div>
      ),
    },
    {
      header: "Phone",
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          {row.phone ? (
            <>
              <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="text-sm text-slate-600">{row.phone}</span>
            </>
          ) : (
            <span className="text-slate-400 text-xs italic">—</span>
          )}
        </div>
      ),
    },
    {
      header: "Subscriptions",
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
              row._count.subscriptions > 0
                ? "bg-blue-50 text-blue-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {row._count.subscriptions}
          </span>
        </div>
      ),
    },
    {
      header: "Invoices",
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <Receipt className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-sm font-medium text-slate-700">
            {row._count.invoices}
          </span>
        </div>
      ),
    },
    {
      header: "Created",
      cell: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          {format(new Date(row.createdAt), "MMM d, yyyy")}
        </div>
      ),
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
          <DropdownMenuContent align="end" className="bg-white border-[#E5E7EB] shadow-lg w-44">
            <DropdownMenuItem
              onClick={() => router.push(`/customers/${row.id}`)}
              className="cursor-pointer"
            >
              <Eye className="mr-2 h-3.5 w-3.5 text-slate-500" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleEdit(row)}
              className="cursor-pointer"
            >
              <Pencil className="mr-2 h-3.5 w-3.5 text-slate-500" />
              Edit Customer
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleDeleteClick(row)}
              className="cursor-pointer text-[#EF4444] focus:text-[#EF4444] focus:bg-red-50"
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Delete Customer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Customers"
        description="Manage client directory, track subscriptions, and review lifetime billing histories."
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCustomers}
            className="h-9 gap-1.5"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            onClick={() => setAddOpen(true)}
            className="h-9 gap-1.5 bg-[#2563EB] hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Customers"
          value={data?.total?.toString() ?? "—"}
          change="+5.2%"
          trend="up"
          icon={Users}
        />
        <StatCard
          title="Active Subscriptions"
          value={
            data
              ? data.customers
                  .reduce((s, c) => s + c._count.subscriptions, 0)
                  .toString()
              : "—"
          }
          change="+8.1%"
          trend="up"
          icon={UserCheck}
        />
        <StatCard
          title="Total Invoices"
          value={
            data
              ? data.customers
                  .reduce((s, c) => s + c._count.invoices, 0)
                  .toString()
              : "—"
          }
          change="+3.4%"
          trend="up"
          icon={Receipt}
        />
        <StatCard
          title="Avg Invoices / Customer"
          value={
            data && data.total > 0
              ? (
                  data.customers.reduce(
                    (s, c) => s + c._count.invoices,
                    0
                  ) / data.customers.length
                ).toFixed(1)
              : "—"
          }
          change="+2.1%"
          trend="up"
          icon={TrendingUp}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search by name, email, company, or phone..."
        />
        <FilterDropdown
          label="Country"
          selectedValue={countryFilter}
          onSelect={(v) => {
            setCountryFilter(v);
            setPage(1);
          }}
          options={[
            { label: "All Countries", value: "all" },
            { label: "United States", value: "United States" },
            { label: "United Kingdom", value: "United Kingdom" },
            { label: "Canada", value: "Canada" },
            { label: "Australia", value: "Australia" },
            { label: "Germany", value: "Germany" },
            { label: "India", value: "India" },
          ]}
        />
      </div>

      {/* Table */}
      {loading ? (
      <TableSkeleton rows={8} cols={7} />
      ) : (
        <DataTable
          columns={columns}
          data={data?.customers ?? []}
          keyExtractor={(item) => item.id}
          emptyTitle="No customers found"
          emptyDescription={
            search
              ? `No results for "${search}". Try a different search term.`
              : "Get started by adding your first customer."
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

      {/* Add Customer Dialog */}
      <CustomerFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSuccess={fetchCustomers}
        initialData={null}
      />

      {/* Edit Customer Dialog */}
      <CustomerFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={fetchCustomers}
        initialData={selectedCustomer}
      />

      {/* Delete Confirm Dialog */}
      <CustomerDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        customerId={deletingId ?? ""}
        customerName={deletingName}
        onSuccess={() => {
          fetchCustomers();
          setDeletingId(null);
        }}
      />
    </PageContainer>
  );
}
