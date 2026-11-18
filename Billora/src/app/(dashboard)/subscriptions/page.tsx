"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Repeat,
  DollarSign,
  Clock,
  AlertCircle,
  MoreHorizontal,
  RefreshCw,
  Eye,
  Pause,
  Play,
  XCircle,
  ArrowUpDown,
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
import { CreateSubscriptionDialog } from "@/components/subscriptions/CreateSubscriptionDialog";
import { ChangePlanDialog } from "@/components/subscriptions/ChangePlanDialog";
import {
  SubscriptionActionDialog,
  SubscriptionActionType,
} from "@/components/subscriptions/SubscriptionActionDialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { formatPrice } from "@/lib/utils/currency";

interface SubscriptionRow {
  id: string;
  status: "ACTIVE" | "PAUSED" | "CANCELLED" | "PAST_DUE";
  startDate: string;
  nextBillingDate: string | null;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  createdAt: string;
  customer: {
    id: string;
    name: string;
    email: string;
    company: string | null;
  };
  price: {
    id: string;
    amount: string;
    currency: string;
    billingInterval: "MONTHLY" | "YEARLY" | "ONE_TIME";
    product: {
      id: string;
      name: string;
    };
  };
  _count: {
    invoices: number;
  };
}

interface SubscriptionsResponse {
  subscriptions: SubscriptionRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function SubscriptionsPage() {
  const router = useRouter();
  const [data, setData] = useState<SubscriptionsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [intervalFilter, setIntervalFilter] = useState("all");
  const [upcomingFilter, setUpcomingFilter] = useState("all");
  const [page, setPage] = useState(1);

  // Dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [changePlanOpen, setChangePlanOpen] = useState(false);
  const [actionOpen, setActionOpen] = useState(false);
  const [actionType, setActionType] = useState<SubscriptionActionType>("PAUSE");
  const [selectedSub, setSelectedSub] = useState<SubscriptionRow | null>(null);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search,
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(intervalFilter !== "all" && { interval: intervalFilter }),
        ...(upcomingFilter === "7days" && { upcomingDays: "7" }),
        ...(upcomingFilter === "30days" && { upcomingDays: "30" }),
      });
      const res = await fetch(`/api/subscriptions?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch subscriptions");
      const json: SubscriptionsResponse = await res.json();
      setData(json);
    } catch {
      toast.error("Failed to load subscriptions.");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, intervalFilter, upcomingFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchSubscriptions, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchSubscriptions, search]);

  const openAction = (
    sub: SubscriptionRow,
    type: SubscriptionActionType
  ) => {
    setSelectedSub(sub);
    setActionType(type);
    setActionOpen(true);
  };

  const openPlanChange = (sub: SubscriptionRow) => {
    setSelectedSub(sub);
    setChangePlanOpen(true);
  };

  const columns: Column<SubscriptionRow>[] = [
    {
      header: "Customer",
      cell: (row) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-[#2563EB] border border-blue-100">
            {row.customer.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <button
              onClick={() => router.push(`/subscriptions/${row.id}`)}
              className="font-semibold text-slate-900 hover:text-[#2563EB] transition-colors truncate block text-left"
            >
              {row.customer.name}
            </button>
            <div className="text-xs text-slate-400 truncate">
              {row.customer.company || row.customer.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Product & Plan",
      cell: (row) => (
        <div>
          <div className="font-medium text-sm text-slate-900">
            {row.price.product.name}
          </div>
          <div className="text-xs text-slate-500 font-mono">
            {formatPrice(
              row.price.amount,
              row.price.currency,
              row.price.billingInterval
            )}
          </div>
        </div>
      ),
    },
    {
      header: "Billing Interval",
      cell: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 capitalize">
          {row.price.billingInterval.toLowerCase()}
        </span>
      ),
    },
    {
      header: "Start Date",
      cell: (row) => (
        <div className="text-xs text-slate-600">
          {format(new Date(row.startDate), "MMM d, yyyy")}
        </div>
      ),
    },
    {
      header: "Next Billing",
      cell: (row) => {
        if (row.status === "PAUSED") {
          return (
            <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium">
              <Pause className="h-3 w-3" /> Paused
            </span>
          );
        }
        if (row.status === "CANCELLED") {
          return (
            <span className="inline-flex items-center gap-1 text-xs text-slate-400 italic">
              Terminated
            </span>
          );
        }
        if (row.price.billingInterval === "ONE_TIME") {
          return (
            <span className="text-xs text-slate-400 italic">One-Time</span>
          );
        }
        return (
          <div className="text-xs font-medium text-slate-700">
            {row.nextBillingDate
              ? format(new Date(row.nextBillingDate), "MMM d, yyyy")
              : "—"}
          </div>
        );
      },
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
            className="bg-white border-[#E5E7EB] shadow-lg w-52"
          >
            <DropdownMenuItem
              onClick={() => router.push(`/subscriptions/${row.id}`)}
              className="cursor-pointer"
            >
              <Eye className="mr-2 h-3.5 w-3.5 text-slate-500" />
              View Subscription
            </DropdownMenuItem>

            {row.status !== "CANCELLED" && (
              <DropdownMenuItem
                onClick={() => openPlanChange(row)}
                className="cursor-pointer"
              >
                <ArrowUpDown className="mr-2 h-3.5 w-3.5 text-slate-500" />
                Upgrade / Downgrade Plan
              </DropdownMenuItem>
            )}

            {row.status === "ACTIVE" && (
              <>
                <DropdownMenuItem
                  onClick={() => openAction(row, "PAUSE")}
                  className="cursor-pointer text-amber-700 focus:text-amber-700 focus:bg-amber-50"
                >
                  <Pause className="mr-2 h-3.5 w-3.5" />
                  Pause Subscription
                </DropdownMenuItem>
                {row.price.billingInterval !== "ONE_TIME" && (
                  <DropdownMenuItem
                    onClick={() => openAction(row, "RENEW")}
                    className="cursor-pointer text-[#2563EB] focus:text-[#2563EB] focus:bg-blue-50"
                  >
                    <RefreshCw className="mr-2 h-3.5 w-3.5" />
                    Simulate Renewal
                  </DropdownMenuItem>
                )}
              </>
            )}

            {row.status === "PAUSED" && (
              <DropdownMenuItem
                onClick={() => openAction(row, "RESUME")}
                className="cursor-pointer text-emerald-700 focus:text-emerald-700 focus:bg-emerald-50"
              >
                <Play className="mr-2 h-3.5 w-3.5" />
                Resume Subscription
              </DropdownMenuItem>
            )}

            {row.status !== "CANCELLED" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => openAction(row, "CANCEL")}
                  className="cursor-pointer text-[#EF4444] focus:text-[#EF4444] focus:bg-red-50"
                >
                  <XCircle className="mr-2 h-3.5 w-3.5" />
                  Cancel Subscription
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const totalActive =
    data?.subscriptions.filter((s) => s.status === "ACTIVE").length ?? 0;
  const totalPaused =
    data?.subscriptions.filter((s) => s.status === "PAUSED").length ?? 0;
  const totalPastDue =
    data?.subscriptions.filter((s) => s.status === "PAST_DUE").length ?? 0;

  return (
    <PageContainer>
      <PageHeader
        title="Subscriptions"
        description="Monitor recurring billing lifecycles, renewal schedules, tier changes, and customer accounts."
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSubscriptions}
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
            Create Subscription
          </Button>
        </div>
      </PageHeader>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Subscriptions"
          value={data?.total?.toString() ?? "—"}
          change="Tracked in ledger"
          trend="up"
          icon={Repeat}
        />
        <StatCard
          title="Active Subscriptions"
          value={totalActive.toString()}
          change="Eligible for renewal"
          trend="up"
          icon={DollarSign}
        />
        <StatCard
          title="Paused Accounts"
          value={totalPaused.toString()}
          change="No renewal events"
          trend="down"
          icon={Clock}
        />
        <StatCard
          title="Past Due / Attention"
          value={totalPastDue.toString()}
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
          placeholder="Filter by customer, company, or product..."
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
              { label: "Active", value: "ACTIVE" },
              { label: "Paused", value: "PAUSED" },
              { label: "Cancelled", value: "CANCELLED" },
              { label: "Past Due", value: "PAST_DUE" },
            ]}
          />
          <FilterDropdown
            label="Billing Interval"
            selectedValue={intervalFilter}
            onSelect={(v) => {
              setIntervalFilter(v);
              setPage(1);
            }}
            options={[
              { label: "All Intervals", value: "all" },
              { label: "Monthly", value: "MONTHLY" },
              { label: "Yearly", value: "YEARLY" },
              { label: "One-Time", value: "ONE_TIME" },
            ]}
          />
          <FilterDropdown
            label="Renewals"
            selectedValue={upcomingFilter}
            onSelect={(v) => {
              setUpcomingFilter(v);
              setPage(1);
            }}
            options={[
              { label: "All Dates", value: "all" },
              { label: "Upcoming 7 Days", value: "7days" },
              { label: "Upcoming 30 Days", value: "30days" },
            ]}
          />
        </div>
      </div>

      {/* Subscriptions Table */}
      {loading ? (
        <TableSkeleton rows={7} cols={7} />
      ) : (
        <DataTable
          columns={columns}
          data={data?.subscriptions ?? []}
          keyExtractor={(item) => item.id}
          emptyTitle="No subscriptions found"
          emptyDescription={
            search
              ? `No subscription results for "${search}".`
              : "Get started by creating your first subscription."
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

      {/* Dialog: Create Subscription */}
      <CreateSubscriptionDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={fetchSubscriptions}
      />

      {/* Dialog: Upgrade / Downgrade Plan */}
      {selectedSub && (
        <ChangePlanDialog
          open={changePlanOpen}
          onOpenChange={setChangePlanOpen}
          subscriptionId={selectedSub.id}
          currentPriceId={selectedSub.price.id}
          currentPriceAmount={selectedSub.price.amount}
          currentCurrency={selectedSub.price.currency}
          currentInterval={selectedSub.price.billingInterval}
          productId={selectedSub.price.product.id}
          productName={selectedSub.price.product.name}
          onSuccess={fetchSubscriptions}
        />
      )}

      {/* Dialog: Action confirmation (Pause, Resume, Cancel, Renew) */}
      {selectedSub && (
        <SubscriptionActionDialog
          open={actionOpen}
          onOpenChange={setActionOpen}
          subscriptionId={selectedSub.id}
          customerName={selectedSub.customer.name}
          productName={selectedSub.price.product.name}
          actionType={actionType}
          onSuccess={fetchSubscriptions}
        />
      )}
    </PageContainer>
  );
}
