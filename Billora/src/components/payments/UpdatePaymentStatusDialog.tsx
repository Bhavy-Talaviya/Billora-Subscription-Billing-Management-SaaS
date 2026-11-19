"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

interface UpdatePaymentStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentId: string;
  txReference: string;
  currentStatus: "SUCCEEDED" | "PENDING" | "FAILED";
  amount: number | string;
  onSuccess: () => void;
}

export function UpdatePaymentStatusDialog({
  open,
  onOpenChange,
  paymentId,
  txReference,
  currentStatus,
  amount,
  onSuccess,
}: UpdatePaymentStatusDialogProps) {
  const [newStatus, setNewStatus] = useState<"SUCCEEDED" | "PENDING" | "FAILED">(
    currentStatus
  );
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/payments/${paymentId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to update payment status");
      }

      toast.success(
        `Payment ${txReference} updated to ${newStatus}. Invoice balance recalculated.`
      );
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white border-[#E5E7EB]">
        <DialogHeader>
          <DialogTitle className="text-slate-900 text-base font-semibold">
            Update Payment Status
          </DialogTitle>
          <DialogDescription className="text-slate-600 text-xs mt-1">
            Change transaction state for{" "}
            <span className="font-mono font-bold text-slate-800">
              {txReference}
            </span>{" "}
            (${Number(amount).toFixed(2)}).
          </DialogDescription>
        </DialogHeader>

        <div className="py-3 space-y-2">
          <label className="text-xs font-semibold text-slate-700 block">
            Select New Status
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "SUCCEEDED", label: "Succeeded", icon: CheckCircle2, color: "text-emerald-600" },
              { id: "PENDING", label: "Pending", icon: Clock, color: "text-amber-600" },
              { id: "FAILED", label: "Failed", icon: XCircle, color: "text-red-600" },
            ].map((st) => {
              const Icon = st.icon;
              const isSelected = newStatus === st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setNewStatus(st.id as any)}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-medium transition-all ${
                    isSelected
                      ? "border-[#2563EB] bg-blue-50/70 text-[#2563EB]"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <Icon className={`h-4 w-4 mb-1 ${st.color}`} />
                  <span>{st.label}</span>
                </button>
              );
            })}
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-600 mt-2">
            <strong>Ledger Rule:</strong> Updating this payment status will
            automatically re-sync the parent invoice's settlement balance and
            status in real time.
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={loading}
            className="bg-[#2563EB] hover:bg-blue-700 text-white"
          >
            {loading ? "Updating..." : "Update Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
