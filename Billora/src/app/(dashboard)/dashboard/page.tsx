"use client";

import { useState } from "react";
import {
  DollarSign,
  Users,
  Repeat,
  TrendingDown,
  ArrowUpRight,
  Plus,
  Download,
  CreditCard,
  CheckCircle2,
} from "lucide-react";
import { PageContainer } from "@/components/shared/PageContainer";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { DataTable, Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DateRangePicker } from "@/components/shared/DateRangePicker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
} from "recharts";
import { toast } from "sonner";

const revenueData = [
  { month: "Jan", revenue: 14200, subscriptions: 820 },
  { month: "Feb", revenue: 16800, subscriptions: 940 },
  { month: "Mar", revenue: 18500, subscriptions: 1050 },
  { month: "Apr", revenue: 19900, subscriptions: 1180 },
  { month: "May", revenue: 22400, subscriptions: 1310 },
  { month: "Jun", revenue: 24850, subscriptions: 1428 },
];

const planData = [
  { name: "Starter", users: 450, fill: "#93c5fd" },
  { name: "Professional", users: 720, fill: "#2563EB" },
  { name: "Enterprise", users: 258, fill: "#1e3a8a" },
];

interface RecentInvoice {
  id: string;
  customer: string;
  email: string;
  plan: string;
  amount: string;
  status: "paid" | "pending" | "failed";
  date: string;
}

const recentInvoices: RecentInvoice[] = [
  {
    id: "INV-2026-001",
    customer: "Acme Technologies",
    email: "billing@acme.com",
    plan: "Enterprise Annual",
    amount: "$2,400.00",
    status: "paid",
    date: "Nov 15, 2026",
  },
  {
    id: "INV-2026-002",
    customer: "Starlight Media",
    email: "finance@starlight.io",
    plan: "Professional Monthly",
    amount: "$129.00",
    status: "paid",
    date: "Nov 14, 2026",
  },
  {
    id: "INV-2026-003",
    customer: "Nexus Digital Agency",
    email: "accounts@nexus.dev",
    plan: "Professional Monthly",
    amount: "$129.00",
    status: "pending",
    date: "Nov 14, 2026",
  },
  {
    id: "INV-2026-004",
    customer: "Vanguard Studios",
    email: "payments@vanguard.co",
    plan: "Starter Monthly",
    amount: "$49.00",
    status: "failed",
    date: "Nov 13, 2026",
  },
  {
    id: "INV-2026-005",
    customer: "Hyperion Labs",
    email: "alex@hyperion.com",
    plan: "Enterprise Monthly",
    amount: "$249.00",
    status: "paid",
    date: "Nov 12, 2026",
  },
];

export default function DashboardPage() {
  const [selectedRange, setSelectedRange] = useState("30d");

  const invoiceColumns: Column<RecentInvoice>[] = [
    {
      header: "Invoice ID",
      accessorKey: "id",
      cell: (row) => (
        <span className="font-semibold text-slate-900">{row.id}</span>
      ),
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
      header: "Plan",
      accessorKey: "plan",
      cell: (row) => <span className="text-slate-600">{row.plan}</span>,
    },
    {
      header: "Amount",
      accessorKey: "amount",
      cell: (row) => (
        <span className="font-semibold text-slate-900">{row.amount}</span>
      ),
    },
    {
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Date",
      accessorKey: "date",
      cell: (row) => <span className="text-slate-500 text-xs">{row.date}</span>,
    },
    {
      header: "Action",
      cell: (row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toast.info(`Viewing details for ${row.id}`)}
          className="text-[#2563EB] hover:text-blue-700 h-8 px-2 text-xs"
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <PageContainer>
      {/* Page Header */}
      <PageHeader
        title="Dashboard"
        description="Monitor real-time recurring revenue, subscription renewals, and billing activities."
      >
        <DateRangePicker value={selectedRange} onChange={setSelectedRange} />
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.success("Exporting financial report...")}
          className="h-9 gap-1.5 border-[#E5E7EB] bg-white text-slate-700"
        >
          <Download className="h-4 w-4 text-slate-500" />
          <span>Export</span>
        </Button>
        <Button
          size="sm"
          onClick={() => toast.success("Opening new invoice creator...")}
          className="h-9 gap-1.5 bg-[#2563EB] hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>Create Invoice</span>
        </Button>
      </PageHeader>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Monthly Recurring Revenue"
          value="$24,850.00"
          change="+12.4%"
          trend="up"
          description="vs last month"
          icon={DollarSign}
        />
        <StatCard
          title="Active Subscriptions"
          value="1,428"
          change="+8.1%"
          trend="up"
          description="vs last month"
          icon={Repeat}
        />
        <StatCard
          title="Total Customers"
          value="2,890"
          change="+5.2%"
          trend="up"
          description="vs last month"
          icon={Users}
        />
        <StatCard
          title="Churn Rate"
          value="1.2%"
          change="-0.4%"
          trend="up"
          description="healthy (< 2%)"
          icon={TrendingDown}
        />
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Revenue Area Chart */}
        <Card className="lg:col-span-2 border-[#E5E7EB]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold">
                Revenue Growth Overview
              </CardTitle>
              <CardDescription className="text-xs">
                Monthly recurring revenue trajectory across all plans
              </CardDescription>
            </div>
            <span className="text-xs font-medium text-[#16A34A] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              +38.5% YoY
            </span>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={(val) => `$${val / 1000}k`}
                  />
                  <Tooltip
                    formatter={(val) => [`$${Number(val).toLocaleString()}`, "Revenue"]}
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderColor: "#e2e8f0",
                      borderRadius: "0.5rem",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2563EB"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRev)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Plan Distribution Bar Chart */}
        <Card className="border-[#E5E7EB]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Subscriptions by Plan
            </CardTitle>
            <CardDescription className="text-xs">
              Distribution of active customer tiers
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={planData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    width={85}
                  />
                  <Tooltip
                    formatter={(val) => [`${val} active subscribers`, "Subscribers"]}
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderColor: "#e2e8f0",
                      borderRadius: "0.5rem",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="users" radius={[0, 4, 4, 0]} fill="#2563EB" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Top Plan: <strong>Professional (50.4%)</strong></span>
              <span className="text-[#2563EB] font-medium cursor-pointer hover:underline">
                View Plans →
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Invoices Table Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Recent Invoices & Transactions
            </h2>
            <p className="text-xs text-slate-500">
              Real-time billing activity generated across customer accounts
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8 border-[#E5E7EB]"
            onClick={() => toast.info("Navigating to full invoice ledger...")}
          >
            View All Invoices
          </Button>
        </div>

        <DataTable
          columns={invoiceColumns}
          data={recentInvoices}
          keyExtractor={(row) => row.id}
        />
      </div>
    </PageContainer>
  );
}
