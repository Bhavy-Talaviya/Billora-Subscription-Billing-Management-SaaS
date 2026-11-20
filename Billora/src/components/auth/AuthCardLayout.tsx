import React from "react";
import Link from "next/link";
import { Zap, CheckCircle2, ShieldCheck, BarChart3, Repeat } from "lucide-react";

interface AuthCardLayoutProps {
  children: React.ReactNode;
  heading: string;
  subheading: string;
}

export function AuthCardLayout({
  children,
  heading,
  subheading,
}: AuthCardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Left side: Premium SaaS Brand Showcase (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-[#151515] p-12 text-white relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[#2563EB]/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-[#2563EB]/10 blur-3xl pointer-events-none" />

        {/* Brand Logo Header */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2563EB] text-white shadow-md transition-transform group-hover:scale-105">
              <Zap className="h-5 w-5 fill-white text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white leading-none">
                Billora
              </span>
              <span className="text-[11px] font-medium text-slate-400 mt-1 uppercase tracking-wider">
                Billing & Subscription SaaS
              </span>
            </div>
          </Link>
        </div>

        {/* Core Value Proposition & Illustration Mock */}
        <div className="relative z-10 my-auto py-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2563EB]/20 px-3 py-1 text-xs font-semibold text-blue-300 border border-blue-500/30 mb-6">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
            Enterprise Billing Infrastructure
          </span>

          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl leading-tight">
            Subscription lifecycle & recurring revenue, simplified.
          </h2>

          <p className="mt-4 text-sm text-slate-300 leading-relaxed max-w-lg">
            Manage customers, automate recurring invoice cycles, record simulated multi-method payments,
            and monitor live MRR, ARR and churn metrics in one single pane of glass.
          </p>

          {/* Three Feature Highlights */}
          <div className="mt-8 space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Repeat className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Automated Subscription Schedules</h4>
                <p className="text-xs text-slate-400 mt-0.5">Flexible monthly, yearly, and one-time billing anchors.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Accurate Invoicing & Ledger</h4>
                <p className="text-xs text-slate-400 mt-0.5">Automated line-item calculation and PDF generation.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <BarChart3 className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Dynamic Executive Analytics</h4>
                <p className="text-xs text-slate-400 mt-0.5">Real-time cohort retention, ARPU, and revenue forecasting.</p>
              </div>
            </div>
          </div>

          {/* CSS Decorative SaaS Card Preview */}
          <div className="mt-10 rounded-xl border border-white/10 bg-[#1c1c20] p-4 shadow-xl max-w-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-medium text-slate-300">Live MRR Velocity</span>
              </div>
              <span className="text-xs font-bold text-emerald-400">+18.4% vs last mo.</span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <p className="text-2xl font-black text-white">$24,850.00</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Normalized Monthly Run Rate</p>
              </div>
              <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[10px] font-semibold text-blue-300">
                Active Tenant
              </span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500">
          <span>&copy; {new Date().getFullYear()} Billora SaaS Inc.</span>
          <span>Security & Audit Verified</span>
        </div>
      </div>

      {/* Right side: Form container */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24">
        {/* Mobile Header Logo */}
        <div className="mb-8 lg:hidden">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2563EB] text-white shadow-sm">
              <Zap className="h-5 w-5 fill-white text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 leading-none">
              Billora
            </span>
          </Link>
        </div>

        <div className="mx-auto w-full max-w-md">
          {/* Form Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {heading}
            </h1>
            <p className="mt-2 text-sm text-slate-500">{subheading}</p>
          </div>

          {/* Form Card */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 sm:p-8 shadow-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
