"use client";

import * as React from "react";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const dateRanges = [
  { label: "Today", value: "today" },
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "This Month", value: "this_month" },
  { label: "Last Quarter", value: "last_quarter" },
  { label: "All Time", value: "all" },
];

interface DateRangePickerProps {
  value?: string;
  onChange?: (range: string) => void;
  className?: string;
}

export function DateRangePicker({
  value = "30d",
  onChange,
  className,
}: DateRangePickerProps) {
  const [selectedRange, setSelectedRange] = React.useState(value);

  const currentLabel =
    dateRanges.find((r) => r.value === selectedRange)?.label || "Select Date";

  const handleSelect = (val: string) => {
    setSelectedRange(val);
    onChange?.(val);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`h-9 gap-2 border-[#E5E7EB] bg-white font-normal text-slate-700 hover:bg-slate-50 ${className || ""}`}
        >
          <CalendarIcon className="h-3.5 w-3.5 text-slate-500" />
          <span className="text-xs font-medium text-slate-900">{currentLabel}</span>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 bg-white border-[#E5E7EB] shadow-md">
        {dateRanges.map((range) => (
          <DropdownMenuItem
            key={range.value}
            onClick={() => handleSelect(range.value)}
            className={`cursor-pointer text-xs ${
              selectedRange === range.value
                ? "font-semibold text-[#2563EB] bg-blue-50/50"
                : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            {range.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
