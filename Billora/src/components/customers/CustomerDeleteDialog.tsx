"use client";

import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface CustomerDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  customerName: string;
  onSuccess: () => void;
}

export function CustomerDeleteDialog({
  open,
  onOpenChange,
  customerId,
  customerName,
  onSuccess,
}: CustomerDeleteDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!customerId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/customers/${customerId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to delete customer");
      }
      toast.success(`Customer "${customerName}" has been deleted.`);
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Could not delete customer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white border-[#E5E7EB]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
              <AlertTriangle className="h-5 w-5 text-[#EF4444]" />
            </div>
            <DialogTitle className="text-slate-900 text-base font-semibold">
              Delete Customer
            </DialogTitle>
          </div>
          <DialogDescription className="text-slate-500 text-sm mt-2">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-slate-700">&quot;{customerName}&quot;</span>?
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 leading-relaxed">
          <strong>Safe-Delete Policy:</strong> Customers with active subscriptions,
          paid invoices, or payment transactions cannot be deleted to preserve
          financial audit trails. If this customer has billing records, you will
          see an error — please cancel their subscriptions first.
        </div>

        <DialogFooter className="mt-2 gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={loading}
            className="bg-[#EF4444] hover:bg-red-600 text-white gap-1.5"
          >
            <Trash2 className="h-4 w-4" />
            {loading ? "Deleting..." : "Delete Customer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
