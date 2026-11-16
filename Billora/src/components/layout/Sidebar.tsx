"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Repeat,
  Package,
  Tag,
  FileText,
  CreditCard,
  BarChart3,
  Settings,
  Zap,
  ChevronRight,
  LogOut,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const navigationItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    name: "Customers",
    href: "/customers",
    icon: Users,
    badge: null,
  },
  {
    name: "Subscriptions",
    href: "/subscriptions",
    icon: Repeat,
    badge: null,
  },
  {
    name: "Products",
    href: "/products",
    icon: Package,
    badge: null,
  },
  {
    name: "Pricing",
    href: "/pricing",
    icon: Tag,
    badge: null,
  },
  {
    name: "Invoices",
    href: "/invoices",
    icon: FileText,
    badge: null,
  },
  {
    name: "Payments",
    href: "/payments",
    icon: CreditCard,
    badge: null,
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    badge: null,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    badge: null,
  },
];

interface SidebarProps {
  onCloseMobile?: () => void;
  className?: string;
}

export function Sidebar({ onCloseMobile, className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full w-64 flex-col justify-between bg-[#151515] text-[#f4f4f5] border-r border-[#262626]",
        className
      )}
    >
      {/* Top Header / Brand Logo */}
      <div>
        <div className="flex h-16 items-center px-6 border-b border-[#262626]">
          <Link
            href="/dashboard"
            onClick={onCloseMobile}
            className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2563EB] text-white shadow-sm">
              <Zap className="h-5 w-5 fill-white text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-white leading-none">
                Billora
              </span>
              <span className="text-[11px] font-medium text-slate-400 mt-1 uppercase tracking-wider">
                Billing SaaS
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Section */}
        <div className="px-3 py-4">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Main Menu
          </p>
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={cn(
                    "group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-[#2563EB] text-white shadow-sm"
                      : "text-slate-300 hover:bg-[#222225] hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        "h-4 w-4 transition-colors",
                        isActive
                          ? "text-white"
                          : "text-slate-400 group-hover:text-white"
                      )}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs text-blue-200">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom User Profile Section */}
      <div className="p-3 border-t border-[#262626]">
        <div className="flex items-center justify-between rounded-lg p-2.5 bg-[#1e1e21] hover:bg-[#252529] transition-colors">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-white font-semibold text-sm">
              BT
            </div>
            <div className="flex flex-col truncate">
              <span className="truncate text-xs font-semibold text-white">
                Bhavy Talaviya
              </span>
              <span className="truncate text-[11px] text-slate-400">
                admin@billora.com
              </span>
            </div>
          </div>
          <button
            title="Account Options"
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
