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
import {
  Pause,
  Play,
  XCircle,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

export type SubscriptionActionType = "PAUSE" | "RESUME" | "CANCEL" | "RENEW";

interface SubscriptionActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscriptionId: string;
  customerName: string;
  productName: string;
  actionType: SubscriptionActionType;
  onSuccess: () => void;
}

export function SubscriptionActionDialog({
  open,
  onOpenChange,
  subscriptionId,
  customerName,
  productName,
  actionType,
  onSuccess,
}: SubscriptionActionDialogProps) {
  const [loading, setLoading] = useState(false);

  const getDetails = () => {
    switch (actionType) {
      case "PAUSE":
        return {
          title: "Pause Subscription",
          description: `Are you sure you want to pause the subscription for ${customerName} (${productName})?`,
          policy:
            "PAUSED subscriptions do not generate recurring renewals or invoices. The customer can be resumed at any time.",
          buttonLabel: "Pause Subscription",
          endpoint: `/api/subscriptions/${subscriptionId}/pause`,
          icon: Pause,
          color: "bg-amber-600 hover:bg-amber-700",
        };
      case "RESUME":
        return {
          title: "Resume Subscription",
          description: `Resume the active subscription for ${customerName} (${productName})?`,
          policy:
            "The subscription will be set back to ACTIVE. A new billing date will be automatically computed based on the plan interval.",
          buttonLabel: "Resume Subscription",
          endpoint: `/api/subscriptions/${subscriptionId}/resume`,
          icon: Play,
          color: "bg-emerald-600 hover:bg-emerald-700",
        };
      case "CANCEL":
        return {
          title: "Cancel Subscription",
          description: `Are you sure you want to cancel the subscription for ${customerName} (${productName})?`,
          policy:
            "CANCELLED subscriptions are permanently terminated and will not be renewed. Historical invoices remain safe and unchanged.",
          buttonLabel: "Cancel Subscription",
          endpoint: `/api/subscriptions/${subscriptionId}/cancel`,
          icon: XCircle,
          color: "bg-red-600 hover:bg-red-700",
        };
      case "RENEW":
        return {
          title: "Simulate Subscription Renewal",
          description: `Simulate the recurring renewal event for ${customerName} (${productName})?`,
          policy:
            "This will create the next periodic invoice simulation and advance the next billing date for this ACTIVE subscription.",
          buttonLabel: "Simulate Renewal",
          endpoint: `/api/subscriptions/${subscriptionId}/renew`,
          icon: RefreshCw,
          color: "bg-[#2563EB] hover:bg-blue-700",
        };
    }
  };

  const config = getDetails();
  const Icon = config.icon;

  const handleAction = async () => {
    setLoading(true);
    try {
      const res = await fetch(config.endpoint, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Action failed");
      }

      toast.success(
        actionType === "PAUSE"
          ? "Subscription paused."
          : actionType === "RESUME"
          ? "Subscription resumed."
          : actionType === "CANCEL"
          ? "Subscription cancelled."
          : "Subscription renewal processed successfully."
      );
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white border-[#E5E7EB]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
              <Icon className="h-5 w-5 text-slate-800" />
            </div>
            <DialogTitle className="text-slate-900 text-base font-semibold">
              {config.title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-slate-600 text-sm mt-2">
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-slate-500 mt-0.5" />
          <span>
            <strong>Business Rule:</strong> {config.policy}
          </span>
        </div>

        <DialogFooter className="mt-3 gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Go Back
          </Button>
          <Button
            onClick={handleAction}
            disabled={loading}
            className={`${config.color} text-white gap-1.5`}
          >
            {loading ? "Processing..." : config.buttonLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
