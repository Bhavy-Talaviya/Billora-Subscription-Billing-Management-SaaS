"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  DollarSign,
  Users,
  Repeat,
  TrendingDown,
  ArrowUpRight,
  Plus,
  RefreshCw,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { PageContainer } from "@/components/shared/PageContainer";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TableSkeleton } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { toast } from "sonner";
import { format } from "date-fns";
import { formatPrice } from "@/lib/utils/currency";

interface StatsData {
  totalCustomers: number;
  totalActiveSubscriptions: number;
  mrr: number;
  arr: number;
  totalPaymentsReceived: number;
  churnRate: number;
  upcomingRenewals: number;
  pendingInvoices: number;
}

interface RevenueItem {
  month: string;
  revenue: number;
  mrr: number;
  newCustomers: number;
}

interface DistributionData {
  subscriptions: Array<{ name: string; value: number; color: string }>;
  payments: Array<{ name: string; value: number; color: string }>;
}

interface ActivityData {
  recentCustomers: Array<{
    id: string;
    name: string;
    email: string;
    company: string | null;
    createdAt: string;
  }>;
  recentSubscriptions: Array<{
    id: string;
    status: string;
    createdAt: string;
    customer: { id: string; name: string; company: string | null };
    price: { product: { name: string } };
  }>;
  recentPayments: Array<{
    id: string;
    amount: string;
    paymentMethod: string;
    status: string;
    createdAt: string;
    customer: { id: string; name: string };
    invoice: { id: string; invoiceNumber: string };
  }>;
  recentInvoices: Array<{
    id: string;
    invoiceNumber: string;
    total: string;
    status: string;
    issueDate: string;
    customer: { id: string; name: string };
  }>;
  upcomingRenewals: Array<{
    id: string;
    nextBillingDate: string | null;
    customer: { id: string; name: string; email: string };
    price: { product: { name: string } };
  }>;
}

export default function DashboardPage() {
  const router = useRouter();

  // Date Range Filter
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "3m" | "6m" | "12m">(
    "6m"
  );
  const [loading, setLoading] = useState(true);

  // Live Database States
  const [stats, setStats] = useState<StatsData | null>(null);
  const [revenueSeries, setRevenueSeries] = useState<RevenueItem[]>([]);
  const [distribution, setDistribution] = useState<DistributionData | null>(
    null
  );
  const [activity, setActivity] = useState<ActivityData | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, revRes, distRes, actRes] = await Promise.all([
        fetch(`/api/dashboard/stats?range=${dateRange}`),
        fetch(`/api/dashboard/revenue?range=${dateRange}`),
        fetch("/api/dashboard/subscriptions"),
        fetch("/api/dashboard/renewals"),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (revRes.ok) setRevenueSeries(await revRes.json());
      if (distRes.ok) setDistribution(await distRes.json());
      if (actRes.ok) setActivity(await actRes.json());
    } catch {
      toast.error("Failed to load dashboard metrics from database.");
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <PageContainer>
      {/* Page Header */}
      <PageHeader
        title="Revenue & Growth Overview"
        description="Real-time recurring billing metrics, normalized MRR/ARR, and live ledger transaction streams."
      >
        <div className="flex flex-wrap items-center gap-2">
          {/* Date range filter pills */}
          <div className="flex rounded-lg border border-[#E5E7EB] bg-white p-1 shadow-sm">
            {[
              { id: "7d", label: "7 Days" },
              { id: "30d", label: "30 Days" },
              { id: "3m", label: "3 Months" },
              { id: "6m", label: "6 Months" },
              { id: "12m", label: "12 Months" },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => setDateRange(r.id as any)}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                  dateRange === r.id
                    ? "bg-[#2563EB] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            className="h-8 gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>

          <Button
            onClick={() => router.push("/subscriptions")}
            className="h-8 gap-1.5 bg-[#2563EB] hover:bg-blue-700 text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            New Subscription
          </Button>
        </div>
      </PageHeader>

      {/* 8 Primary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* 1. Total Customers */}
        <StatCard
          title="Total Customers"
          value={stats ? stats.totalCustomers.toString() : "—"}
          change="Customer directory"
          trend="up"
          icon={Users}
        />

        {/* 2. Total Active Subscriptions */}
        <StatCard
          title="Active Subscriptions"
          value={stats ? stats.totalActiveSubscriptions.toString() : "—"}
          change="Auto-renewing accounts"
          trend="up"
          icon={Repeat}
        />

        {/* 3. Monthly Recurring Revenue (MRR) */}
        <StatCard
          title="Monthly Recurring (MRR)"
          value={
            stats
              ? `$${stats.mrr.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              : "—"
          }
          change="Normalized monthly"
          trend="up"
          icon={DollarSign}
        />

        {/* 4. Annual Recurring Revenue (ARR) */}
        <StatCard
          title="Annual Recurring (ARR)"
          value={
            stats
              ? `$${stats.arr.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              : "—"
          }
          change="Run-rate (MRR × 12)"
          trend="up"
          icon={TrendingUp}
        />

        {/* 5. Total Payments Received */}
        <StatCard
          title="Payments Received"
          value={
            stats
              ? `$${stats.totalPaymentsReceived.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              : "—"
          }
          change="Settled transactions"
          trend="up"
          icon={CheckCircle2}
        />

        {/* 6. Churn Rate */}
        <StatCard
          title="Churn Rate"
          value={stats ? `${stats.churnRate}%` : "—"}
          change="Period cancellations"
          trend={stats && stats.churnRate > 5 ? "down" : "up"}
          icon={TrendingDown}
        />

        {/* 7. Upcoming Renewals */}
        <StatCard
          title="Upcoming Renewals"
          value={stats ? stats.upcomingRenewals.toString() : "—"}
          change="Next 30 days"
          trend="up"
          icon={Clock}
        />

        {/* 8. Pending Invoices */}
        <StatCard
          title="Pending Invoices"
          value={stats ? stats.pendingInvoices.toString() : "—"}
          change="Unsettled billing"
          trend="down"
          icon={AlertCircle}
        />
      </div>

      {/* Row: Main Charts (Recharts) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Monthly Revenue Chart */}
        <Card className="border-[#E5E7EB] bg-white shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Monthly Revenue
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Actual settled cash inflows from successful payment transactions.
                </CardDescription>
              </div>
              <span className="text-xs font-semibold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded">
                Live Data
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 flex items-center justify-center text-xs text-slate-400">
                Loading revenue stream...
              </div>
            ) : revenueSeries.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-xs text-slate-400">
                No revenue records in selected timeframe.
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueSeries}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748B" }} stroke="#CBD5E1" />
                    <YAxis tick={{ fontSize: 11, fill: "#64748B" }} stroke="#CBD5E1" tickFormatter={(v) => `$${v}`} />
                    <Tooltip formatter={(value: any) => [`$${Number(value).toFixed(2)}`, "Revenue"]} />
                    <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* MRR Growth Chart */}
        <Card className="border-[#E5E7EB] bg-white shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  MRR Run-Rate Expansion
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Normalized monthly recurring value added from subscription tiers.
                </CardDescription>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Recurring
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 flex items-center justify-center text-xs text-slate-400">
                Loading MRR data...
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueSeries}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748B" }} stroke="#CBD5E1" />
                    <YAxis tick={{ fontSize: 11, fill: "#64748B" }} stroke="#CBD5E1" tickFormatter={(v) => `$${v}`} />
                    <Tooltip formatter={(value: any) => [`$${Number(value).toFixed(2)}`, "MRR Added"]} />
                    <Bar dataKey="mrr" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row: Status Distributions & Customer Growth */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Subscription Status Breakdown */}
        <Card className="border-[#E5E7EB] bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-900">
              Subscription Statuses
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Active vs Paused vs Cancelled breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading || !distribution ? (
              <div className="h-48 flex items-center justify-center text-xs text-slate-400">
                Loading breakdown...
              </div>
            ) : (
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distribution.subscriptions}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                    >
                      {distribution.subscriptions.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Status Breakdown */}
        <Card className="border-[#E5E7EB] bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-900">
              Payment Settlement Distribution
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Succeeded, pending, and failed attempts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading || !distribution ? (
              <div className="h-48 flex items-center justify-center text-xs text-slate-400">
                Loading breakdown...
              </div>
            ) : (
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distribution.payments}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                    >
                      {distribution.payments.map((entry, index) => (
                        <Cell key={`cell-pmt-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Growth */}
        <Card className="border-[#E5E7EB] bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-900">
              Monthly Customer Acquisition
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              New client profiles enrolled per month
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-48 flex items-center justify-center text-xs text-slate-400">
                Loading acquisition data...
              </div>
            ) : (
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueSeries}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#64748B" }} stroke="#CBD5E1" />
                    <YAxis tick={{ fontSize: 10, fill: "#64748B" }} stroke="#CBD5E1" allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="newCustomers" name="New Customers" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tables: Recent Activity Lists with direct links */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming Renewals Table */}
        <Card className="border-[#E5E7EB] bg-white shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-slate-900">
                Upcoming Subscription Renewals
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Active subscriptions due for renewal within 30 days
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/subscriptions")}
              className="h-7 text-xs text-[#2563EB]"
            >
              View all <ChevronRight className="h-3 w-3 ml-0.5" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {activity?.upcomingRenewals.length === 0 ? (
              <p className="p-6 text-center text-xs text-slate-400">
                No active subscriptions due for renewal in the next 30 days.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {activity?.upcomingRenewals.map((sub) => (
                  <div
                    key={sub.id}
                    onClick={() => router.push(`/subscriptions/${sub.id}`)}
                    className="p-3.5 flex items-center justify-between hover:bg-slate-50/70 cursor-pointer transition-colors"
                  >
                    <div>
                      <span className="font-semibold text-slate-900 block">
                        {sub.customer.name}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {sub.price.product.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-medium text-[#2563EB] block">
                        {sub.nextBillingDate
                          ? format(new Date(sub.nextBillingDate), "MMM d, yyyy")
                          : "—"}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-semibold">
                        Eligible for renewal
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Invoices Table */}
        <Card className="border-[#E5E7EB] bg-white shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-slate-900">
                Recent Invoices
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Latest billing statements generated across clients
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/invoices")}
              className="h-7 text-xs text-[#2563EB]"
            >
              View all <ChevronRight className="h-3 w-3 ml-0.5" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {activity?.recentInvoices.length === 0 ? (
              <p className="p-6 text-center text-xs text-slate-400">
                No invoices found in database.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {activity?.recentInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    onClick={() => router.push(`/invoices/${inv.id}`)}
                    className="p-3.5 flex items-center justify-between hover:bg-slate-50/70 cursor-pointer transition-colors"
                  >
                    <div>
                      <span className="font-mono font-semibold text-[#2563EB] block">
                        {inv.invoiceNumber}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {inv.customer.name}
                      </span>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <span className="font-bold text-slate-900 block font-mono">
                          ${Number(inv.total).toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {format(new Date(inv.issueDate), "MMM d")}
                        </span>
                      </div>
                      <StatusBadge status={inv.status.toLowerCase()} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Payments Table */}
        <Card className="border-[#E5E7EB] bg-white shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-slate-900">
                Recent Payment Settlements
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Real-time transaction stream from payment ledger
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/payments")}
              className="h-7 text-xs text-[#2563EB]"
            >
              View all <ChevronRight className="h-3 w-3 ml-0.5" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {activity?.recentPayments.length === 0 ? (
              <p className="p-6 text-center text-xs text-slate-400">
                No payment transactions recorded.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {activity?.recentPayments.map((pmt) => (
                  <div
                    key={pmt.id}
                    onClick={() => router.push(`/payments`)}
                    className="p-3.5 flex items-center justify-between hover:bg-slate-50/70 cursor-pointer transition-colors"
                  >
                    <div>
                      <span className="font-semibold text-slate-900 block">
                        {pmt.customer.name}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Invoice #{pmt.invoice.invoiceNumber} · {pmt.paymentMethod}
                      </span>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <span className="font-bold text-slate-900 block font-mono">
                          ${Number(pmt.amount).toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {format(new Date(pmt.createdAt), "MMM d, h:mm a")}
                        </span>
                      </div>
                      <StatusBadge status={pmt.status.toLowerCase()} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Customers Table */}
        <Card className="border-[#E5E7EB] bg-white shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-slate-900">
                Recently Enrolled Customers
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                New clients joined Billora
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/customers")}
              className="h-7 text-xs text-[#2563EB]"
            >
              View all <ChevronRight className="h-3 w-3 ml-0.5" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {activity?.recentCustomers.length === 0 ? (
              <p className="p-6 text-center text-xs text-slate-400">
                No customer profiles found.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {activity?.recentCustomers.map((cust) => (
                  <div
                    key={cust.id}
                    onClick={() => router.push(`/customers/${cust.id}`)}
                    className="p-3.5 flex items-center justify-between hover:bg-slate-50/70 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-[11px] font-bold text-[#2563EB]">
                        {cust.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900 block">
                          {cust.name}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {cust.company || cust.email}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {format(new Date(cust.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
