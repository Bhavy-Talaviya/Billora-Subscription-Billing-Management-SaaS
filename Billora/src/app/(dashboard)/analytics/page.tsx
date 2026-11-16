"use client";

import { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  Users,
  Repeat,
  Download,
  Activity,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { PageContainer } from "@/components/shared/PageContainer";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { DateRangePicker } from "@/components/shared/DateRangePicker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

const growthData = [
  { month: "Jun", mrr: 14200, target: 13000, newSubs: 120, churned: 12 },
  { month: "Jul", mrr: 16800, target: 15500, newSubs: 145, churned: 15 },
  { month: "Aug", mrr: 18500, target: 17500, newSubs: 160, churned: 18 },
  { month: "Sep", mrr: 19900, target: 19000, newSubs: 175, churned: 14 },
  { month: "Oct", mrr: 22400, target: 21000, newSubs: 190, churned: 16 },
  { month: "Nov", mrr: 24850, target: 23500, newSubs: 210, churned: 17 },
];

const tierMetrics = [
  { tier: "Starter", mrr: "$2,205.00", arpu: "$49.00", customers: 450, churn: "1.8%" },
  { tier: "Professional", mrr: "$9,288.00", arpu: "$129.00", customers: 720, churn: "0.9%" },
  { tier: "Enterprise", mrr: "$13,357.00", arpu: "$249.00", customers: 258, churn: "0.4%" },
];

export default function AnalyticsPage() {
  const [selectedRange, setSelectedRange] = useState("30d");

  return (
    <PageContainer>
      <PageHeader
        title="Revenue & Analytics"
        description="Comprehensive SaaS performance metrics, retention cohorts, and recurring revenue growth tracking."
      >
        <DateRangePicker value={selectedRange} onChange={setSelectedRange} />
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.success("Exporting analytical ledger report...")}
          className="h-9 gap-1.5 border-[#E5E7EB] bg-white text-slate-700"
        >
          <Download className="h-4 w-4 text-slate-500" />
          <span>Export Analytics</span>
        </Button>
      </PageHeader>

      {/* 4 Core Financial SaaS Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Annual Run Rate (ARR)"
          value="$298,200.00"
          change="+15.8%"
          trend="up"
          description="forecasted"
          icon={DollarSign}
        />
        <StatCard
          title="Average Revenue / Account"
          value="$128.50"
          change="+4.2%"
          trend="up"
          description="ARPU monthly"
          icon={TrendingUp}
        />
        <StatCard
          title="Lifetime Value (LTV)"
          value="$1,450.00"
          change="+8.6%"
          trend="up"
          description="32 mo. retention"
          icon={Activity}
        />
        <StatCard
          title="Net Revenue Retention"
          value="108%"
          change="+2.4%"
          trend="up"
          description="Expansion > Churn"
          icon={Repeat}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* MRR Actual vs Target Area Chart */}
        <Card className="border-[#E5E7EB]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              MRR vs Target Projection
            </CardTitle>
            <CardDescription className="text-xs">
              Actual monthly recurring revenue compared with growth milestones
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[270px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
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
                    formatter={(val) => [`$${Number(val).toLocaleString()}`, "Amount"]}
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
                    name="Budget Target"
                    dataKey="target"
                    stroke="#94a3b8"
                    strokeDasharray="4 4"
                    strokeWidth={2}
                    fill="transparent"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* New Subscribers vs Churn Bar Chart */}
        <Card className="border-[#E5E7EB]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              New Subscribers vs Churn
            </CardTitle>
            <CardDescription className="text-xs">
              Monthly acquisition velocity versus canceled accounts
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[270px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
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
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plan Performance Breakdown Table */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Plan Cohort Breakdown
          </CardTitle>
          <CardDescription className="text-xs">
            Revenue contribution and retention reliability by subscription plan
          </CardDescription>
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
                {tierMetrics.map((row) => (
                  <tr key={row.tier} className="hover:bg-slate-50/70">
                    <td className="py-3 font-semibold text-slate-900">{row.tier}</td>
                    <td className="py-3 font-medium text-slate-900">{row.mrr}</td>
                    <td className="py-3 text-slate-600">{row.arpu}</td>
                    <td className="py-3 text-slate-700">{row.customers}</td>
                    <td className="py-3 font-semibold text-[#16A34A]">{row.churn}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
