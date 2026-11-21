"use client";

import React from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  HelpCircle,
  Repeat,
  FileText,
  CreditCard,
  BarChart3,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Mail,
  Zap,
} from "lucide-react";

interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpDialog({ open, onOpenChange }: HelpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto sm:rounded-2xl p-6 bg-white border-[#E5E7EB]">
        <DialogHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB] border border-blue-100">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900">
                Billora Documentation &amp; Help Center
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Quick guide and operational reference for subscription billing, invoices, and analytics.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-6 text-sm text-slate-600">
          {/* Section 1: Overview */}
          <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
            <h3 className="font-semibold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 text-[#2563EB]">
              <ShieldCheck className="h-4 w-4" /> Platform Overview
            </h3>
            <p className="mt-1.5 text-xs text-slate-700 leading-relaxed">
              Billora is an enterprise-grade SaaS subscription lifecycle and recurring billing management platform.
              It allows SaaS businesses to manage customers, catalog flexible pricing tiers, generate GAAP-compliant invoices,
              record multi-method simulated payments, and calculate real-time MRR, ARR, and churn metrics.
            </p>
          </div>

          {/* Section 2: Core Modules Guide */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Core Modules &amp; Business Rules
            </h4>

            {/* Subscriptions */}
            <div className="flex items-start gap-3 rounded-lg border border-slate-100 p-3.5 hover:bg-slate-50/70 transition-colors">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB]">
                <Repeat className="h-4 w-4" />
              </div>
              <div className="text-xs">
                <span className="font-semibold text-slate-900 block text-sm">
                  1. Subscription Lifecycle Management
                </span>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  Supports <strong>Monthly</strong>, <strong>Yearly</strong>, and <strong>One-time</strong> intervals.
                  Subscriptions cycle through <span className="font-medium text-emerald-700">ACTIVE</span>, <span className="font-medium text-amber-700">PAUSED</span>, <span className="font-medium text-red-700">CANCELLED</span>, and <span className="font-medium text-purple-700">PAST_DUE</span> states.
                  Pausing freezes automatic renewal dates. Upgrades and downgrades calculate next billing cycles seamlessly.
                </p>
              </div>
            </div>

            {/* Invoices */}
            <div className="flex items-start gap-3 rounded-lg border border-slate-100 p-3.5 hover:bg-slate-50/70 transition-colors">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-[#16A34A]">
                <FileText className="h-4 w-4" />
              </div>
              <div className="text-xs">
                <span className="font-semibold text-slate-900 block text-sm">
                  2. Invoicing &amp; Printable PDF Generator
                </span>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  Invoices accurately calculate <em>Subtotal = Σ(Quantity × Unit Price)</em>, with precision discounts and taxes.
                  When past due date, status automatically syncs to <span className="font-medium text-amber-700">OVERDUE</span>.
                  Click <strong>Download PDF</strong> on any invoice detail page for a client-ready vector document.
                </p>
              </div>
            </div>

            {/* Payments */}
            <div className="flex items-start gap-3 rounded-lg border border-slate-100 p-3.5 hover:bg-slate-50/70 transition-colors">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                <CreditCard className="h-4 w-4" />
              </div>
              <div className="text-xs">
                <span className="font-semibold text-slate-900 block text-sm">
                  3. Simulated Payment Ledger
                </span>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  Record settlements against open balances using Card (masked), Bank Transfer, UPI, or Cash.
                  Supports partial payments and prevents overpayments. Failed transactions are safely logged without reducing the invoice balance.
                </p>
              </div>
            </div>

            {/* Analytics */}
            <div className="flex items-start gap-3 rounded-lg border border-slate-100 p-3.5 hover:bg-slate-50/70 transition-colors">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <BarChart3 className="h-4 w-4" />
              </div>
              <div className="text-xs">
                <span className="font-semibold text-slate-900 block text-sm">
                  4. Real-time MRR, ARR &amp; Churn Analytics
                </span>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  Monthly Recurring Revenue (MRR) normalizes recurring plans: <em>Monthly + (Yearly ÷ 12)</em>. One-time purchases are excluded from MRR.
                  ARR is projected at <em>MRR × 12</em>. Churn rate is calculated based on cancelled subscriptions divided by starting active cohort.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Support Contact */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-slate-800 block">
                Have questions or need technical support?
              </span>
              <span className="text-[11px] text-slate-500">
                Reach our enterprise engineering support team anytime.
              </span>
            </div>
            <a
              href="mailto:support@billora.com"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2563EB] text-white text-xs font-medium hover:bg-blue-700 transition-colors"
            >
              <Mail className="h-3.5 w-3.5" />
              support@billora.com
            </a>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
          <Button
            onClick={() => onOpenChange(false)}
            className="h-9 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs"
          >
            Close Documentation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
