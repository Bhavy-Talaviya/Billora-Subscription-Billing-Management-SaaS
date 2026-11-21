"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  maxWidth = "lg",
}: FormDialogProps) {
  const maxWClass =
    maxWidth === "sm"
      ? "max-w-sm"
      : maxWidth === "md"
      ? "max-w-md"
      : maxWidth === "xl"
      ? "max-w-2xl"
      : "max-w-lg";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`${maxWClass} sm:rounded-xl max-h-[90vh] overflow-y-auto p-5 sm:p-6`}
      >
        <DialogHeader className="pb-1 border-b border-slate-100">
          <DialogTitle className="text-lg font-semibold text-slate-900">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-xs text-slate-500 mt-1">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="mt-3">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
