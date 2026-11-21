"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Menu,
  Bell,
  Search,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Check,
} from "lucide-react";
import { Breadcrumb } from "./Breadcrumb";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { HelpDialog } from "./HelpDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onOpenMobileSidebar: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "info" | "warning" | "success";
  href: string;
  read: boolean;
}

export function Header({ onOpenMobileSidebar }: HeaderProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [helpOpen, setHelpOpen] = useState(false);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "notif-1",
      title: "Upcoming Subscription Renewal",
      message: "TechCorp Enterprise renews in 2 days ($2,400.00)",
      time: "10m ago",
      type: "info",
      href: "/subscriptions",
      read: false,
    },
    {
      id: "notif-2",
      title: "Overdue Invoice Alert",
      message: "Invoice INV-2026-004 is overdue by 3 days",
      time: "1h ago",
      type: "warning",
      href: "/invoices",
      read: false,
    },
    {
      id: "notif-3",
      title: "Payment Received",
      message: "Payment of $1,200.00 settled successfully for INV-2026-002",
      time: "3h ago",
      type: "success",
      href: "/payments",
      read: false,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotificationClick = (item: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );
    router.push(item.href);
  };

  const userName = session?.user?.name || "Admin";
  const firstName = userName.split(" ")[0] || "User";

  return (
    <>
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
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Environment Status Badge */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-[#16A34A]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A] animate-pulse" />
            Production Live
          </div>

          {/* Notifications Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                title="Notifications"
                className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                aria-label="View notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#2563EB] text-[9px] font-bold text-white shadow-sm ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-80 sm:w-96 p-0 rounded-xl shadow-xl border-[#E5E7EB] bg-white text-slate-900 z-50"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB] bg-slate-50/70 rounded-t-xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-[#2563EB]">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] font-medium text-[#2563EB] hover:text-blue-800 transition-colors flex items-center gap-1"
                  >
                    <Check className="h-3 w-3" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No active notifications.
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleNotificationClick(item)}
                      className={`flex items-start gap-3 p-3.5 transition-colors cursor-pointer hover:bg-slate-50 ${
                        !item.read ? "bg-blue-50/40" : ""
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {item.type === "info" && (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-[#2563EB]">
                            <Clock className="h-3.5 w-3.5" />
                          </div>
                        )}
                        {item.type === "warning" && (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                            <AlertTriangle className="h-3.5 w-3.5" />
                          </div>
                        )}
                        {item.type === "success" && (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-slate-900 truncate">
                            {item.title}
                          </p>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">
                            {item.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-snug line-clamp-2">
                          {item.message}
                        </p>
                      </div>
                      {!item.read && (
                        <span className="mt-1.5 h-2 w-2 rounded-full bg-[#2563EB] shrink-0" />
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-[#E5E7EB] bg-slate-50/50 p-2.5 flex items-center justify-between text-xs rounded-b-xl">
                <Link
                  href="/invoices"
                  className="text-[11px] font-medium text-slate-600 hover:text-[#2563EB] px-2 py-1 rounded"
                >
                  View Invoices
                </Link>
                <Link
                  href="/subscriptions"
                  className="text-[11px] font-medium text-[#2563EB] hover:text-blue-700 flex items-center gap-1 px-2 py-1 rounded"
                >
                  <span>Subscriptions</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Help & Documentation Dialog Trigger */}
          <button
            onClick={() => setHelpOpen(true)}
            title="Documentation & Help Center"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors hidden sm:block focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
            aria-label="Open documentation and help"
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
            <UserAvatar
              name={userName}
              image={session?.user?.image}
              size="sm"
              className="ring-2 ring-blue-100"
            />
            <span className="hidden lg:block text-xs font-semibold text-slate-800">
              {firstName}
            </span>
          </Link>
        </div>
      </header>

      {/* Global Interactive Help & Documentation Center */}
      <HelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
    </>
  );
}
