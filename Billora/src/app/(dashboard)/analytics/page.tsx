"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  DollarSign,
  TrendingUp,
  Activity,
  Repeat,
  Download,
  RefreshCw,
  Layers,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { PageContainer } from "@/components/shared/PageContainer";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { DateRangePicker } from "@/components/shared/DateRangePicker";
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { toast } from "sonner";
import { AnalyticsResponse } from "@/services/analytics.service";
import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsPage() {
  const [selectedRange, setSelectedRange] = useState("30d");
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch real analytics from API
  const fetchAnalytics = useCallback(
    async (isManual = false) => {
      try {
        if (isManual) {
          setIsRefreshing(true);
        }
        const res = await fetch(`/api/analytics?range=${encodeURIComponent(selectedRange)}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch analytics");
        }

        const json: AnalyticsResponse = await res.json();
        setData(json);
        setLastRefreshedAt(new Date());

        if (isManual) {
          toast.success("Analytics updated with live database metrics.");
        }
      } catch (err: any) {
        console.error("Error loading analytics:", err);
        if (isManual) {
          toast.error("Failed to refresh analytics. Please try again.");
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [selectedRange]
  );

  // Initial fetch and range change
  useEffect(() => {
    fetchAnalytics(false);
  }, [fetchAnalytics]);

  // Auto-refresh interval: updates live metrics every 30 seconds
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      fetchAnalytics(false);
    }, 30000); // 30 seconds periodic auto-sync

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchAnalytics]);

  // Export Analytics to CSV
  const handleExportCSV = () => {
    if (!data) {
      toast.error("Analytics data is still loading.");
      return;
    }

    try {
      const rows: string[] = [];
      rows.push("BILLORA SAAS REVENUE & ANALYTICS REPORT");
      rows.push(`Generated At,${new Date().toISOString()}`);
      rows.push(`Date Range,${selectedRange}`);
      rows.push("");

      // Executive KPIs
      rows.push("--- EXECUTIVE REVENUE KPIS ---");
      rows.push("Metric,Value,Period Trend");
      rows.push(`Annual Run Rate (ARR),"${data.kpis.arr}","${data.kpis.arrChange}"`);
      rows.push(`Monthly Recurring Revenue (MRR),"${data.kpis.mrr}","Active"`);
      rows.push(`Average Revenue Per Account (ARPU),"${data.kpis.arpu}","${data.kpis.arpuChange}"`);
      rows.push(`Customer Lifetime Value (LTV),"${data.kpis.ltv}","${data.kpis.ltvChange}"`);
      rows.push(`Net Revenue Retention (NRR),"${data.kpis.nrr}","${data.kpis.nrrChange}"`);
      rows.push(`Total Succeeded Collections,"${data.kpis.totalRevenue}","All Time"`);
      rows.push(`Active Subscriptions,${data.kpis.activeSubscriptions},Count`);
      rows.push(`Total Customers,${data.kpis.totalCustomers},Count`);
      rows.push(`Churn Rate,${data.kpis.churnRate}%,Percentage`);
      rows.push("");

      // Monthly Growth Series
      rows.push("--- MONTHLY PERFORMANCE LEDGER ---");
      rows.push("Month,MRR ($),Realized Revenue ($),Target Milestone ($),New Subscriptions,Churned");
      data.growthData.forEach((g) => {
        rows.push(
          `"${g.fullMonth}",${g.mrr},${g.revenue},${g.target},${g.newSubs},${g.churned}`
        );
      });
      rows.push("");

      // Plan Cohort Breakdown
      rows.push("--- PLAN COHORT BREAKDOWN ---");
      rows.push("Plan Tier,MRR Contribution,ARPU,Active Customers,Monthly Churn");
      data.tierMetrics.forEach((t) => {
        rows.push(
          `"${t.tier}","${t.mrr}","${t.arpu}",${t.customers},"${t.churn}"`
        );
      });

      const csvContent = "data:text/csv;charset=utf-8," + rows.join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `billora-analytics-${selectedRange}-${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Analytics ledger CSV exported successfully.");
    } catch (e) {
      console.error("Export CSV failed", e);
      toast.error("Failed to generate CSV export.");
    }
  };

  const hasAnyData =
    data &&
    (data.kpis.rawMrr > 0 ||
      data.kpis.rawTotalRevenue > 0 ||
      data.kpis.activeSubscriptions > 0 ||
      data.growthData.some((g) => g.mrr > 0 || g.newSubs > 0));

  return (
    <PageContainer>
      <PageHeader
        title="Revenue & Analytics"
        description="Comprehensive SaaS performance metrics, retention cohorts, and recurring revenue growth tracking."
      >
        <div className="flex flex-wrap items-center gap-2">
          {/* Live Sync Status Badge */}
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/80 px-2.5 py-1 text-xs font-medium text-emerald-700">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span>Live Auto-Sync</span>
            {lastRefreshedAt && (
              <span className="hidden text-[11px] text-emerald-600/80 sm:inline">
                ({lastRefreshedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })})
              </span>
            )}
          </div>

          {/* Manual Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAnalytics(true)}
            disabled={isRefreshing}
            className="h-9 gap-1.5 border-[#E5E7EB] bg-white text-slate-700 hover:bg-slate-50"
            title="Fetch latest database metrics"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-slate-500 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          {/* Date Range Picker */}
          <DateRangePicker value={selectedRange} onChange={setSelectedRange} />

          {/* Export Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="h-9 gap-1.5 border-[#E5E7EB] bg-white text-slate-700 hover:bg-slate-50"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>Export Analytics</span>
          </Button>
        </div>
      </PageHeader>

      {/* 4 Core Financial SaaS Metrics */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-[#E5E7EB] p-6">
              <Skeleton className="h-4 w-28 mb-3" />
              <Skeleton className="h-8 w-36 mb-2" />
              <Skeleton className="h-3 w-20" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Annual Run Rate (ARR)"
            value={data?.kpis.arr || "$0.00"}
            change={data?.kpis.arrChange || "0.0%"}
            trend={data?.kpis.arrTrend || "neutral"}
            description="live run rate"
            icon={DollarSign}
          />
          <StatCard
            title="Average Revenue / Account"
            value={data?.kpis.arpu || "$0.00"}
            change={data?.kpis.arpuChange || "0.0%"}
            trend={data?.kpis.arpuTrend || "neutral"}
            description="ARPU active"
            icon={TrendingUp}
          />
          <StatCard
            title="Lifetime Value (LTV)"
            value={data?.kpis.ltv || "$0.00"}
            change={data?.kpis.ltvChange || "0.0%"}
            trend={data?.kpis.ltvTrend || "neutral"}
            description="projected LTV"
            icon={Activity}
          />
          <StatCard
            title="Net Revenue Retention"
            value={data?.kpis.nrr || "100%"}
            change={data?.kpis.nrrChange || "0.0%"}
            trend={data?.kpis.nrrTrend || "neutral"}
            description="Expansion > Churn"
            icon={Repeat}
          />
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* MRR Actual vs Target Area Chart */}
        <Card className="border-[#E5E7EB]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">
                  MRR vs Target Projection
                </CardTitle>
                <CardDescription className="text-xs">
                  Actual monthly recurring revenue compared with growth milestones
                </CardDescription>
              </div>
              <div className="hidden rounded-md bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-700 sm:block">
                Live Data
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[270px] w-full">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Skeleton className="h-[250px] w-full" />
                </div>
              ) : !hasAnyData && (!data?.growthData || data.growthData.every((g) => g.mrr === 0)) ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-2">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">No recurring revenue recorded yet</p>
                  <p className="text-xs text-slate-400 max-w-xs mt-1">
                    When you activate subscriptions, your monthly MRR growth velocity will display here in real time.
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.growthData || []}>
                    <defs>
                      <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="month"
                      stroke="#94a3b8"
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={12}
                      tickLine={false}
                      tickFormatter={(val) => `$${val}`}
                    />
                    <Tooltip
                      formatter={(val) => [`$${Number(val).toLocaleString()}`, ""]}
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        borderColor: "#e2e8f0",
                        borderRadius: "0.5rem",
                        fontSize: "12px",
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      name="Actual MRR"
                      dataKey="mrr"
                      stroke="#2563EB"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorMrr)"
                    />
                    <Area
                      type="monotone"
                      name="Growth Target"
                      dataKey="target"
                      stroke="#94a3b8"
                      strokeDasharray="4 4"
                      strokeWidth={2}
                      fill="transparent"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* New Subscribers vs Churn Bar Chart */}
        <Card className="border-[#E5E7EB]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">
                  New Subscribers vs Churn
                </CardTitle>
                <CardDescription className="text-xs">
                  Monthly acquisition velocity versus canceled accounts
                </CardDescription>
              </div>
              <div className="hidden rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 sm:block">
                Live Velocity
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[270px] w-full">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Skeleton className="h-[250px] w-full" />
                </div>
              ) : !hasAnyData && (!data?.growthData || data.growthData.every((g) => g.newSubs === 0 && g.churned === 0)) ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-2">
                    <Activity className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">No subscriber changes yet</p>
                  <p className="text-xs text-slate-400 max-w-xs mt-1">
                    Subscriber additions and churn events will populate this graph automatically.
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.growthData || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="month"
                      stroke="#94a3b8"
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        borderColor: "#e2e8f0",
                        borderRadius: "0.5rem",
                        fontSize: "12px",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="newSubs"
                      name="New Additions"
                      fill="#16A34A"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="churned"
                      name="Churned"
                      fill="#EF4444"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plan Performance Breakdown Table */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                Plan Cohort Breakdown
              </CardTitle>
              <CardDescription className="text-xs">
                Real revenue contribution and retention reliability by subscription plan
              </CardDescription>
            </div>
            <Link href="/products">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-1"
              >
                <span>Manage Plans</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] text-left text-xs uppercase text-slate-500">
                  <th className="pb-3 font-semibold">Subscription Plan</th>
                  <th className="pb-3 font-semibold">MRR Contribution</th>
                  <th className="pb-3 font-semibold">ARPU</th>
                  <th className="pb-3 font-semibold">Active Customers</th>
                  <th className="pb-3 font-semibold">Monthly Churn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  [1, 2, 3].map((i) => (
                    <tr key={i}>
                      <td className="py-3"><Skeleton className="h-4 w-32" /></td>
                      <td className="py-3"><Skeleton className="h-4 w-20" /></td>
                      <td className="py-3"><Skeleton className="h-4 w-16" /></td>
                      <td className="py-3"><Skeleton className="h-4 w-12" /></td>
                      <td className="py-3"><Skeleton className="h-4 w-12" /></td>
                    </tr>
                  ))
                ) : data?.tierMetrics && data.tierMetrics.length > 0 ? (
                  data.tierMetrics.map((row) => (
                    <tr key={row.productId} className="hover:bg-slate-50/70">
                      <td className="py-3 font-semibold text-slate-900">{row.tier}</td>
                      <td className="py-3 font-medium text-slate-900">{row.mrr}</td>
                      <td className="py-3 text-slate-600">{row.arpu}</td>
                      <td className="py-3 text-slate-700">{row.customers}</td>
                      <td className="py-3 font-semibold text-[#16A34A]">{row.churn}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-2">
                          <Layers className="h-5 w-5" />
                        </div>
                        <p className="text-sm font-medium text-slate-700">No active plans found</p>
                        <p className="text-xs text-slate-400 max-w-sm mt-1 mb-3">
                          Create products and pricing tiers to monitor plan performance and cohort churn.
                        </p>
                        <Link href="/products">
                          <Button size="sm" variant="outline" className="text-xs gap-1.5 border-[#E5E7EB]">
                            <span>Create Product / Plan</span>
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
