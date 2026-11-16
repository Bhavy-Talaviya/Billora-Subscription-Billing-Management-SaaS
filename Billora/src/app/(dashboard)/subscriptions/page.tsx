"use client";

import { useState } from "react";
import { Plus, Repeat, DollarSign, Clock, AlertCircle, MoreHorizontal } from "lucide-react";
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

interface Subscription {
  id: string;
  customer: string;
  plan: string;
  billingInterval: "monthly" | "yearly";
  amount: string;
  status: "active" | "trialing" | "past_due" | "canceled" | "paused";
  startDate: string;
  nextBillingDate: string;
}

const mockSubscriptions: Subscription[] = [
  {
    id: "SUB-8012",
    customer: "Acme Technologies",
    plan: "Enterprise Suite",
    billingInterval: "yearly",
    amount: "$2,400.00 / yr",
    status: "active",
    startDate: "Jan 15, 2025",
    nextBillingDate: "Jan 15, 2027",
  },
  {
    id: "SUB-8013",
    customer: "Starlight Media",
    plan: "Professional Tier",
    billingInterval: "monthly",
    amount: "$129.00 / mo",
    status: "active",
    startDate: "Mar 22, 2025",
    nextBillingDate: "Dec 22, 2026",
  },
  {
    id: "SUB-8014",
    customer: "Nexus Digital Agency",
    plan: "Professional Tier",
    billingInterval: "monthly",
    amount: "$129.00 / mo",
    status: "trialing",
    startDate: "Nov 02, 2026",
    nextBillingDate: "Nov 16, 2026",
  },
  {
    id: "SUB-8015",
    customer: "Vanguard Studios",
    plan: "Starter Plan",
    billingInterval: "monthly",
    amount: "$49.00 / mo",
    status: "past_due",
    startDate: "Jul 10, 2026",
    nextBillingDate: "Nov 10, 2026",
  },
  {
    id: "SUB-8016",
    customer: "Hyperion Labs",
    plan: "Enterprise Suite",
    billingInterval: "monthly",
    amount: "$249.00 / mo",
    status: "active",
    startDate: "Feb 18, 2025",
    nextBillingDate: "Dec 18, 2026",
  },
  {
    id: "SUB-8017",
    customer: "Zenith Intelligence",
    plan: "Professional Tier",
    billingInterval: "monthly",
    amount: "$129.00 / mo",
    status: "paused",
    startDate: "Apr 05, 2026",
    nextBillingDate: "Paused",
  },
];

export default function SubscriptionsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);

  const filtered = mockSubscriptions.filter((s) => {
    const matchesSearch =
      s.customer.toLowerCase().includes(search.toLowerCase()) ||
      s.plan.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCancelSubscription = () => {
    if (selectedSub) {
      toast.success(`Subscription ${selectedSub.id} has been canceled.`);
      setCancelModalOpen(false);
      setSelectedSub(null);
    }
  };

  const columns: Column<Subscription>[] = [
    {
      header: "Subscription ID",
      accessorKey: "id",
      cell: (row) => <span className="font-semibold text-slate-900">{row.id}</span>,
    },
    {
      header: "Customer",
      accessorKey: "customer",
      cell: (row) => <span className="font-medium text-slate-900">{row.customer}</span>,
    },
    {
      header: "Plan Name",
      accessorKey: "plan",
      cell: (row) => <span className="text-slate-700">{row.plan}</span>,
    },
    {
      header: "Recurring Rate",
      accessorKey: "amount",
      cell: (row) => <span className="font-semibold text-slate-900">{row.amount}</span>,
    },
    {
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Next Billing",
      accessorKey: "nextBillingDate",
      cell: (row) => <span className="text-xs text-slate-500">{row.nextBillingDate}</span>,
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
            <DropdownMenuItem onClick={() => toast.info(`Viewing details for ${row.id}`)}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info(`Changing plan tier for ${row.id}`)}>
              Upgrade / Downgrade
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-[#EF4444] focus:text-red-600 cursor-pointer"
              onClick={() => {
                setSelectedSub(row);
                setCancelModalOpen(true);
              }}
            >
              Cancel Subscription
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Subscriptions"
        description="Monitor active recurring subscriptions, manage billing renewals, and track churn."
      >
        <Button
          onClick={() => toast.success("Opening new subscription flow...")}
          className="h-9 gap-1.5 bg-[#2563EB] hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4" />
          <span>New Subscription</span>
        </Button>
      </PageHeader>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Active Subscriptions" value="1,428" change="+8.1%" trend="up" icon={Repeat} />
        <StatCard title="MRR Generated" value="$24,850.00" change="+12.4%" trend="up" icon={DollarSign} />
        <StatCard title="Trialing Users" value="42" change="+6.0%" trend="up" icon={Clock} />
        <StatCard title="Past Due / At Risk" value="8" change="-2" trend="up" icon={AlertCircle} />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by ID, customer or plan..."
        />
        <FilterDropdown
          label="Status"
          selectedValue={statusFilter}
          onSelect={setStatusFilter}
          options={[
            { label: "All Statuses", value: "all" },
            { label: "Active", value: "active" },
            { label: "Trialing", value: "trialing" },
            { label: "Past Due", value: "past_due" },
            { label: "Paused", value: "paused" },
            { label: "Canceled", value: "canceled" },
          ]}
        />
      </div>

      {/* Subscriptions DataTable */}
      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(item) => item.id}
        emptyTitle="No subscriptions found"
        emptyDescription="Adjust your search criteria or create a new subscription."
        pagination={{
          currentPage: 1,
          totalPages: 1,
          totalItems: filtered.length,
          pageSize: 10,
          onPageChange: () => {},
        }}
      />

      {/* Cancellation Dialog */}
      <ConfirmDialog
        open={cancelModalOpen}
        onOpenChange={setCancelModalOpen}
        title="Cancel Subscription"
        description={`Are you sure you want to cancel the subscription for ${selectedSub?.customer}? Access will be terminated at the end of the current billing cycle.`}
        confirmLabel="Cancel Subscription"
        variant="destructive"
        onConfirm={handleCancelSubscription}
      />
    </PageContainer>
  );
}
