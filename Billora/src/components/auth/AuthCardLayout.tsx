import React from "react";
import Link from "next/link";
import { Zap, ShieldCheck } from "lucide-react";

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
    <div className="flex min-h-screen lg:h-screen lg:overflow-hidden bg-[#F8FAFC]">
      {/* Left side: Clean SaaS Brand Showcase with Background Graphic (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 h-full flex-col justify-between p-10 xl:p-14 relative overflow-hidden bg-[#0A0D14] text-white">
        {/* Modern SVG Background Pattern */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="auth-grid-pattern"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="0.75"
                  strokeOpacity="0.3"
                />
              </pattern>
              <radialGradient id="radial-glow" cx="20%" cy="30%" r="60%">
                <stop offset="0%" stopColor="#2563EB" stopOpacity="0.4" />
                <stop offset="60%" stopColor="#1E40AF" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#0A0D14" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="#0A0D14" />
            <rect width="100%" height="100%" fill="url(#auth-grid-pattern)" />
            <rect width="100%" height="100%" fill="url(#radial-glow)" />
          </svg>
        </div>

        {/* Ambient atmospheric glows */}
        <div className="absolute top-1/4 -left-20 h-72 w-72 rounded-full bg-[#2563EB]/25 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 h-64 w-64 rounded-full bg-blue-600/15 blur-[90px] pointer-events-none" />

        {/* Top: Brand Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-[#1D4ED8] to-[#3B82F6] text-white shadow-lg shadow-blue-500/25 transition-transform group-hover:scale-105">
              <Zap className="h-6 w-6 fill-white text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-white leading-none">
                Billora
              </span>
              <span className="text-[11px] font-semibold text-blue-400 mt-1 uppercase tracking-wider">
                Billing & Subscription SaaS
              </span>
            </div>
          </Link>
        </div>

        {/* Middle: Brand Tagline, Headline & Description */}
        <div className="relative z-10 max-w-lg my-auto py-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-300 border border-blue-500/25 mb-6 backdrop-blur-sm">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
            Enterprise Billing Infrastructure
          </div>

          <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-[1.2]">
            Subscription lifecycle &amp; recurring revenue, simplified.
          </h2>

          <p className="mt-4 text-sm xl:text-base text-slate-300 leading-relaxed">
            Manage customers, automate recurring invoice cycles, record simulated multi-method payments,
            and monitor live MRR, ARR, and churn metrics in real time.
          </p>
        </div>

        {/* Bottom: Minimal Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-4">
          <span>&copy; {new Date().getFullYear()} Billora SaaS Inc.</span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Bank-Grade Security &amp; Audit Ready
          </span>
        </div>
      </div>

      {/* Right side: Form container (vertically centered, non-scrolling on desktop) */}
      <div className="flex w-full lg:w-1/2 h-full flex-col justify-center items-center px-6 py-6 sm:px-10 lg:px-12 xl:px-16 overflow-y-auto">
        {/* Mobile Header Logo */}
        <div className="mb-6 lg:hidden w-full max-w-[420px]">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2563EB] text-white shadow-sm">
              <Zap className="h-5 w-5 fill-white text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 leading-none">
              Billora
            </span>
          </Link>
        </div>

        <div className="w-full max-w-[420px]">
          {/* Form Header */}
          <div className="mb-5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {heading}
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-500">{subheading}</p>
          </div>

          {/* Form Card */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-7 shadow-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
