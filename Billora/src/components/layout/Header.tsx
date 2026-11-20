"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Menu,
  Bell,
  Search,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  User,
} from "lucide-react";
import { Breadcrumb } from "./Breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  onOpenMobileSidebar: () => void;
}

export function Header({ onOpenMobileSidebar }: HeaderProps) {
  const { data: session } = useSession();
  const [notificationCount] = useState(2);

  const userName = session?.user?.name || "Admin";
  const firstName = userName.split(" ")[0] || "User";
  const initials = userName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "BT";

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#E5E7EB] bg-white px-4 sm:px-6">
      {/* Left section: Mobile hamburger + Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:block">
          <Breadcrumb />
        </div>
      </div>

      {/* Center/Search section */}
      <div className="hidden md:flex items-center max-w-sm w-full mx-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search customers, invoices, subscriptions..."
            className="h-9 w-full rounded-lg border border-[#E5E7EB] bg-slate-50/70 pl-9 pr-3 text-xs text-slate-700 placeholder:text-slate-400 focus:border-[#2563EB] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2563EB] transition-all"
          />
        </div>
      </div>

      {/* Right actions: Mode status badge, Notifications & Quick profile */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Environment Status Badge */}
        <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-[#16A34A]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A] animate-pulse" />
          Production Live
        </div>

        {/* Notifications */}
        <button
          title="Notifications"
          className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          <Bell className="h-4 w-4" />
          {notificationCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-[#2563EB]" />
          )}
        </button>

        {/* Help icon */}
        <button
          title="Documentation & Help"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors hidden sm:block"
        >
          <HelpCircle className="h-4 w-4" />
        </button>

        <div className="h-5 w-px bg-slate-200 hidden sm:block" />

        {/* Quick User Avatar */}
        <Link
          href="/settings"
          className="flex items-center gap-2 pl-1 hover:opacity-85 transition-opacity"
          title="Account Settings"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2563EB] text-white font-semibold text-xs ring-2 ring-blue-100">
            {initials}
          </div>
          <span className="hidden lg:block text-xs font-semibold text-slate-800">
            {firstName}
          </span>
        </Link>
      </div>
    </header>
  );
}
