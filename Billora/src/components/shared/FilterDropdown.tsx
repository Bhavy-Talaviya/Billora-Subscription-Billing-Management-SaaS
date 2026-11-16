"use client";

import * as React from "react";
import { Filter, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export interface FilterOption {
  label: string;
  value: string;
}

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  className?: string;
}

export function FilterDropdown({
  label,
  options,
  selectedValue = "all",
  onSelect,
  className,
}: FilterDropdownProps) {
  const selectedLabel =
    options.find((opt) => opt.value === selectedValue)?.label || label;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2 border-[#E5E7EB] text-slate-700 bg-white hover:bg-slate-50 font-normal"
        >
          <Filter className="h-3.5 w-3.5 text-slate-500" />
          <span>
            {label}: <strong className="font-semibold text-slate-900">{selectedLabel}</strong>
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48 bg-white border-[#E5E7EB] shadow-md">
        <DropdownMenuLabel className="text-xs text-slate-500 font-semibold">
          Filter by {label}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-100" />
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={`cursor-pointer text-sm ${
              selectedValue === option.value
                ? "font-semibold text-[#2563EB] bg-blue-50/50"
                : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
