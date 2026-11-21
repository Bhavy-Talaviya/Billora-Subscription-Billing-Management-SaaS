"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
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
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/shared/UserAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SignOutConfirmDialog } from "@/components/auth/SignOutConfirmDialog";

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
  const { data: session } = useSession();
  const [signOutOpen, setSignOutOpen] = useState(false);

  const userName = session?.user?.name || "Admin User";
  const userEmail = session?.user?.email || "admin@billora.com";
  const userRole = (session?.user as any)?.role || "USER";

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "BT";
  };

  return (
    <>
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

        {/* Bottom User Profile Section with Dropdown */}
        <div className="p-3 border-t border-[#262626]">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="w-full flex items-center justify-between rounded-lg p-2.5 bg-[#1e1e21] hover:bg-[#252529] transition-colors text-left focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                aria-label="User profile options"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <UserAvatar
                    name={userName}
                    image={session?.user?.image}
                    size="md"
                    className="ring-1 ring-slate-700"
                  />
                  <div className="flex flex-col truncate">
                    <span className="truncate text-xs font-semibold text-white">
                      {userName}
                    </span>
                    <span className="truncate text-[11px] text-slate-400">
                      {userEmail}
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              side="right"
              align="end"
              className="w-56 bg-[#1a1a1d] border-[#2e2e32] text-slate-200 p-1 shadow-2xl"
            >
              <DropdownMenuLabel className="px-2 py-1.5">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-white">{userName}</span>
                  <span className="text-[11px] text-slate-400 truncate">{userEmail}</span>
                  <div className="mt-1 flex items-center gap-1">
                    <span className="inline-flex items-center rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-semibold text-blue-300">
                      {userRole}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#2e2e32]" />
              <DropdownMenuItem asChild>
                <Link
                  href="/settings"
                  onClick={onCloseMobile}
                  className="flex items-center gap-2 px-2 py-2 text-xs text-slate-300 hover:text-white hover:bg-[#26262b] cursor-pointer rounded-md"
                >
                  <Settings className="h-3.5 w-3.5 text-slate-400" />
                  <span>Account Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#2e2e32]" />
              <DropdownMenuItem
                onClick={() => setSignOutOpen(true)}
                className="flex items-center gap-2 px-2 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer rounded-md"
              >
                <LogOut className="h-3.5 w-3.5 text-red-400" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Sign Out Confirmation Modal */}
      <SignOutConfirmDialog open={signOutOpen} onOpenChange={setSignOutOpen} />
    </>
  );
}
