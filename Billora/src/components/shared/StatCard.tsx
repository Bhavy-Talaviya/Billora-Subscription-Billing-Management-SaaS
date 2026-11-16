import * as React from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  description?: string;
  icon?: LucideIcon;
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  trend = "neutral",
  description = "vs previous period",
  icon: Icon,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden border-[#E5E7EB] hover:shadow-md transition-shadow", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          {Icon && (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB]">
              <Icon className="h-4 w-4" />
            </div>
          )}
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {value}
          </div>
          {change && (
            <div className="mt-2 flex items-center gap-1.5 text-xs">
              <span
                className={cn(
                  "inline-flex items-center font-medium",
                  trend === "up" && "text-[#16A34A]",
                  trend === "down" && "text-[#EF4444]",
                  trend === "neutral" && "text-slate-500"
                )}
              >
                {trend === "up" && <TrendingUp className="mr-1 h-3.5 w-3.5" />}
                {trend === "down" && <TrendingDown className="mr-1 h-3.5 w-3.5" />}
                {change}
              </span>
              <span className="text-slate-400">{description}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
