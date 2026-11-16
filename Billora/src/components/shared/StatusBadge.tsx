import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusType =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "paused"
  | "paid"
  | "open"
  | "draft"
  | "uncollectible"
  | "void"
  | "succeeded"
  | "pending"
  | "failed"
  | "refunded"
  | "completed"
  | "processing";

interface StatusBadgeProps {
  status: StatusType | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = status.toLowerCase().replace(/\s+/g, "_");

  let style = "bg-slate-100 text-slate-700 border-slate-200";
  let label = status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  switch (normalized) {
    case "active":
    case "paid":
    case "succeeded":
    case "completed":
      style = "bg-emerald-50 text-[#16A34A] border-emerald-200";
      break;
    case "trialing":
    case "processing":
      style = "bg-blue-50 text-[#2563EB] border-blue-200";
      break;
    case "pending":
    case "past_due":
    case "open":
      style = "bg-amber-50 text-amber-700 border-amber-200";
      break;
    case "canceled":
    case "failed":
    case "uncollectible":
      style = "bg-red-50 text-[#EF4444] border-red-200";
      break;
    case "paused":
    case "draft":
    case "void":
    case "refunded":
      style = "bg-slate-100 text-slate-600 border-slate-200";
      break;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        style,
        className
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          normalized === "active" || normalized === "paid" || normalized === "succeeded"
            ? "bg-[#16A34A]"
            : normalized === "failed" || normalized === "canceled"
            ? "bg-[#EF4444]"
            : normalized === "pending" || normalized === "past_due"
            ? "bg-amber-500"
            : normalized === "trialing"
            ? "bg-[#2563EB]"
            : "bg-slate-400"
        )}
      />
      {label}
    </span>
  );
}
