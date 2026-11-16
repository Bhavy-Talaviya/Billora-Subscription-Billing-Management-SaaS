"use client";

import { useState } from "react";
import { Plus, Users, UserCheck, DollarSign, TrendingUp, MoreHorizontal, Mail } from "lucide-react";
import { PageContainer } from "@/components/shared/PageContainer";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { DataTable, Column } from "@/components/shared/DataTable";
import { SearchInput } from "@/components/shared/SearchInput";
import { FilterDropdown } from "@/components/shared/FilterDropdown";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { FormDialog } from "@/components/shared/FormDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface Customer {
  id: string;
  name: string;
  email: string;
  company: string;
  plan: string;
  status: "active" | "trialing" | "past_due" | "canceled";
  invoices: number;
  totalSpent: string;
  joinedDate: string;
}

const mockCustomers: Customer[] = [
  {
    id: "CUST-1001",
    name: "Sarah Jenkins",
    email: "sarah.j@acme.com",
    company: "Acme Technologies",
    plan: "Enterprise Annual",
    status: "active",
    invoices: 14,
    totalSpent: "$28,800.00",
    joinedDate: "Jan 15, 2025",
  },
  {
    id: "CUST-1002",
    name: "David Miller",
    email: "dmiller@starlight.io",
    company: "Starlight Media",
    plan: "Professional Monthly",
    status: "active",
    invoices: 8,
    totalSpent: "$1,032.00",
    joinedDate: "Mar 22, 2025",
  },
  {
    id: "CUST-1003",
    name: "Elena Rostova",
    email: "elena@nexus.dev",
    company: "Nexus Digital Agency",
    plan: "Professional Monthly",
    status: "trialing",
    invoices: 1,
    totalSpent: "$0.00",
    joinedDate: "Nov 02, 2026",
  },
  {
    id: "CUST-1004",
    name: "Marcus Vance",
    email: "marcus@vanguard.co",
    company: "Vanguard Studios",
    plan: "Starter Monthly",
    status: "past_due",
    invoices: 5,
    totalSpent: "$245.00",
    joinedDate: "Jul 10, 2026",
  },
  {
    id: "CUST-1005",
    name: "Alex Thorne",
    email: "alex@hyperion.com",
    company: "Hyperion Labs",
    plan: "Enterprise Monthly",
    status: "active",
    invoices: 12,
    totalSpent: "$2,988.00",
    joinedDate: "Feb 18, 2025",
  },
  {
    id: "CUST-1006",
    name: "Jessica Chen",
    email: "jchen@zenith.ai",
    company: "Zenith Intelligence",
    plan: "Professional Monthly",
    status: "canceled",
    invoices: 4,
    totalSpent: "$516.00",
    joinedDate: "Apr 05, 2026",
  },
];

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [page, setPage] = useState(1);

  // New customer form state
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    company: "",
    plan: "Professional Monthly",
  });

  const filteredCustomers = mockCustomers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.name || !newCustomer.email) {
      toast.error("Please fill in customer name and email");
      return;
    }
    toast.success(`Customer "${newCustomer.name}" added successfully`);
    setDialogOpen(false);
    setNewCustomer({ name: "", email: "", company: "", plan: "Professional Monthly" });
  };

  const columns: Column<Customer>[] = [
    {
      header: "Customer",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-[#2563EB]">
            {row.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-slate-900">{row.name}</div>
            <div className="text-xs text-slate-400">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Company",
      accessorKey: "company",
      cell: (row) => <span className="text-slate-700 font-medium">{row.company}</span>,
    },
    {
      header: "Active Plan",
      accessorKey: "plan",
      cell: (row) => <span className="text-slate-600 text-xs">{row.plan}</span>,
    },
    {
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Invoices",
      accessorKey: "invoices",
      cell: (row) => <span className="text-slate-600 font-medium">{row.invoices}</span>,
    },
    {
      header: "Total Spent",
      accessorKey: "totalSpent",
      cell: (row) => <span className="font-semibold text-slate-900">{row.totalSpent}</span>,
    },
    {
      header: "Joined Date",
      accessorKey: "joinedDate",
      cell: (row) => <span className="text-xs text-slate-500">{row.joinedDate}</span>,
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
            <DropdownMenuItem onClick={() => toast.info(`Viewing profile for ${row.name}`)}>
              View Customer
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info(`Viewing invoices for ${row.name}`)}>
              View Invoices
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info(`Editing details for ${row.name}`)}>
              Edit Details
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
        <Button
          onClick={() => setDialogOpen(true)}
          className="h-9 gap-1.5 bg-[#2563EB] hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4" />
          <span>Add Customer</span>
        </Button>
      </PageHeader>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Customers" value="2,890" change="+5.2%" trend="up" icon={Users} />
        <StatCard title="Active Subscriptions" value="2,640" change="+8.1%" trend="up" icon={UserCheck} />
        <StatCard title="Avg Customer Value" value="$480.00" change="+3.4%" trend="up" icon={DollarSign} />
        <StatCard title="Net Growth Rate" value="14.2%" change="+2.1%" trend="up" icon={TrendingUp} />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Filter by name, email, or company..."
        />
        <div className="flex items-center gap-2">
          <FilterDropdown
            label="Status"
            selectedValue={statusFilter}
            onSelect={setStatusFilter}
            options={[
              { label: "All Statuses", value: "all" },
              { label: "Active", value: "active" },
              { label: "Trialing", value: "trialing" },
              { label: "Past Due", value: "past_due" },
              { label: "Canceled", value: "canceled" },
            ]}
          />
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredCustomers}
        keyExtractor={(item) => item.id}
        emptyTitle="No customers found"
        emptyDescription="Try clearing your search query or adjusting your filters."
        pagination={{
          currentPage: page,
          totalPages: 1,
          totalItems: filteredCustomers.length,
          pageSize: 10,
          onPageChange: setPage,
        }}
      />

      {/* Add Customer Dialog */}
      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Add New Customer"
        description="Enter the customer information to create a customer profile in Billora."
      >
        <form onSubmit={handleCreateCustomer} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700">Full Name</label>
            <Input
              placeholder="e.g. Alex Henderson"
              value={newCustomer.name}
              onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
              className="mt-1"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700">Email Address</label>
            <Input
              type="email"
              placeholder="alex@company.com"
              value={newCustomer.email}
              onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
              className="mt-1"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700">Company Name</label>
            <Input
              placeholder="Company or Organization"
              value={newCustomer.company}
              onChange={(e) => setNewCustomer({ ...newCustomer, company: e.target.value })}
              className="mt-1"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-[#2563EB] hover:bg-blue-700">
              Create Profile
            </Button>
          </div>
        </form>
      </FormDialog>
    </PageContainer>
  );
}
