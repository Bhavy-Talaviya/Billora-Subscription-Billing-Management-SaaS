"use client";

import { useState } from "react";
import { Plus, Check, Zap, Sparkles, Shield, ArrowRight } from "lucide-react";
import { PageContainer } from "@/components/shared/PageContainer";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormDialog } from "@/components/shared/FormDialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface PlanTier {
  id: string;
  name: string;
  badge?: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  subscribers: number;
  isPopular?: boolean;
}

const planTiers: PlanTier[] = [
  {
    id: "plan-starter",
    name: "Starter",
    description: "Essential billing features for indie developers, early startups, and freelancers.",
    monthlyPrice: 49,
    annualPrice: 39,
    features: [
      "Up to 500 active customers",
      "Standard PDF invoice generator",
      "Single currency billing (USD)",
      "Automated payment receipts",
      "Standard email support",
      "Basic reporting dashboard",
    ],
    subscribers: 450,
  },
  {
    id: "plan-pro",
    name: "Professional",
    badge: "Most Popular",
    isPopular: true,
    description: "Comprehensive recurring revenue automation for scaling SaaS businesses.",
    monthlyPrice: 129,
    annualPrice: 99,
    features: [
      "Up to 10,000 active customers",
      "Automated dunning & failed payment retries",
      "Multi-currency support (EUR, GBP, CAD)",
      "Customer self-service portal",
      "Custom branded invoice templates",
      "Webhook event notifications",
      "Priority email & chat support",
    ],
    subscribers: 720,
  },
  {
    id: "plan-enterprise",
    name: "Enterprise",
    description: "Dedicated infrastructure, volume pricing, and custom contract workflows.",
    monthlyPrice: 249,
    annualPrice: 199,
    features: [
      "Unlimited active customers",
      "Dedicated account manager",
      "Custom contract & metered billing rules",
      "99.99% uptime guarantee SLA",
      "Audit log access & enterprise SSO",
      "Custom webhook concurrency",
      "24/7 emergency phone support",
    ],
    subscribers: 258,
  },
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <PageContainer>
      <PageHeader
        title="Pricing Plans"
        description="Configure subscription tiers, recurring billing intervals, and feature allocations."
      >
        <Button
          onClick={() => setDialogOpen(true)}
          className="h-9 gap-1.5 bg-[#2563EB] hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4" />
          <span>New Plan Tier</span>
        </Button>
      </PageHeader>

      {/* Billing Interval Switcher */}
      <div className="flex items-center justify-center my-4">
        <div className="flex items-center rounded-lg border border-[#E5E7EB] bg-white p-1 shadow-sm">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`rounded-md px-4 py-1.5 text-xs font-semibold transition-all ${
              billingCycle === "monthly"
                ? "bg-[#2563EB] text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle("annual")}
            className={`flex items-center gap-1.5 rounded-md px-4 py-1.5 text-xs font-semibold transition-all ${
              billingCycle === "annual"
                ? "bg-[#2563EB] text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Annual Billing</span>
            <span className="rounded-full bg-emerald-100 text-[#16A34A] px-1.5 py-0.2 text-[10px] font-bold">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* 3 Pricing Tier Cards Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {planTiers.map((plan) => {
          const price = billingCycle === "annual" ? plan.annualPrice : plan.monthlyPrice;

          return (
            <Card
              key={plan.id}
              className={`relative flex flex-col justify-between border-2 transition-all hover:shadow-lg ${
                plan.isPopular
                  ? "border-[#2563EB] shadow-md"
                  : "border-[#E5E7EB]"
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-[#2563EB] px-3 py-1 text-xs font-semibold text-white shadow-sm">
                    {plan.badge}
                  </span>
                </div>
              )}

              <CardHeader className="pt-6">
                <CardTitle className="text-xl font-bold text-slate-900">
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 min-h-[36px]">
                  {plan.description}
                </CardDescription>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold tracking-tight text-slate-900">
                    ${price}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    / user / month
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {billingCycle === "annual" ? "Billed annually" : "Billed monthly"}
                </p>

                <div className="mt-4 py-2 px-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Active Subscribers</span>
                  <strong className="text-slate-900 font-bold">{plan.subscribers} companies</strong>
                </div>
              </CardHeader>

              <CardContent className="flex-1 py-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
                  Included Features:
                </p>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-4 w-4 shrink-0 text-[#16A34A] mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pt-2">
                <Button
                  onClick={() => toast.success(`Configuring ${plan.name} plan rules...`)}
                  variant={plan.isPopular ? "default" : "outline"}
                  className={`w-full h-10 ${
                    plan.isPopular
                      ? "bg-[#2563EB] hover:bg-blue-700 text-white"
                      : "border-[#E5E7EB] hover:bg-slate-50 text-slate-800"
                  }`}
                >
                  Edit Plan Details
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Plan Creator Dialog */}
      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Add Pricing Tier"
        description="Create a new pricing plan tier with customizable recurring schedules."
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700">Tier Name</label>
            <Input placeholder="e.g. Growth Plan" className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Monthly Price ($)</label>
              <Input type="number" placeholder="79" className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Annual Price ($/mo)</label>
              <Input type="number" placeholder="59" className="mt-1" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700">Description</label>
            <Input placeholder="Short summary of this plan" className="mt-1" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[#2563EB] hover:bg-blue-700"
              onClick={() => {
                toast.success("Pricing plan created successfully");
                setDialogOpen(false);
              }}
            >
              Create Tier
            </Button>
          </div>
        </div>
      </FormDialog>
    </PageContainer>
  );
}
