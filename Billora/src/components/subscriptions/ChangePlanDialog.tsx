"use client";

import { useEffect, useState } from "react";
import { FormDialog } from "@/components/shared/FormDialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils/currency";
import { ArrowUpCircle, ArrowDownCircle, AlertCircle } from "lucide-react";

interface ChangePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscriptionId: string;
  currentPriceId: string;
  currentPriceAmount: number | string;
  currentCurrency: string;
  currentInterval: string;
  productId: string;
  productName: string;
  onSuccess: () => void;
}

interface PriceOption {
  id: string;
  amount: string;
  currency: string;
  billingInterval: "MONTHLY" | "YEARLY" | "ONE_TIME";
  active: boolean;
}

export function ChangePlanDialog({
  open,
  onOpenChange,
  subscriptionId,
  currentPriceId,
  currentPriceAmount,
  currentCurrency,
  currentInterval,
  productId,
  productName,
  onSuccess,
}: ChangePlanDialogProps) {
  const [plans, setPlans] = useState<PriceOption[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [effectivePolicy, setEffectivePolicy] = useState<
    "IMMEDIATE" | "NEXT_BILLING_DATE"
  >("IMMEDIATE");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    const fetchPlans = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/prices?productId=${productId}&active=true`);
        if (res.ok) {
          const data: PriceOption[] = await res.json();
          // Filter out the plan the subscription is currently on
          const otherPlans = data.filter((p) => p.id !== currentPriceId);
          setPlans(otherPlans);
          if (otherPlans.length > 0) {
            setSelectedPlanId(otherPlans[0].id);
          }
        }
      } catch (err) {
        toast.error("Failed to load alternative pricing plans.");
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, [open, productId, currentPriceId]);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);
  const isUpgrade =
    selectedPlan &&
    Number(selectedPlan.amount) > Number(currentPriceAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanId || !selectedPlan) {
      toast.error("Please select a new plan tier.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/subscriptions/${subscriptionId}/change-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newPriceId: selectedPlanId,
          effectivePolicy,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to change subscription plan");
      }

      toast.success(
        `Subscription successfully ${isUpgrade ? "upgraded" : "downgraded"} to ${formatPrice(
          selectedPlan.amount,
          selectedPlan.currency,
          selectedPlan.billingInterval
        )}.`
      );
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to update plan");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Change Subscription Tier"
      description={`Upgrade or downgrade pricing plan for ${productName}.`}
      maxWidth="lg"
    >
      {loading ? (
        <div className="py-8 text-center text-sm text-slate-500">
          Loading pricing options...
        </div>
      ) : plans.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-sm text-slate-600 font-medium">
            No alternative plans available for this product.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Add more pricing tiers to {productName} under the Products module.
          </p>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="mt-4"
          >
            Close
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current plan box */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs flex justify-between items-center">
            <span className="text-slate-500">Current Plan:</span>
            <span className="font-bold text-slate-900">
              {formatPrice(
                currentPriceAmount,
                currentCurrency,
                currentInterval
              )}
            </span>
          </div>

          {/* Select New Tier */}
          <div>
            <label className="text-xs font-semibold text-slate-700">
              Select New Plan <span className="text-red-500">*</span>
            </label>
            <div className="mt-2 space-y-2">
              {plans.map((plan) => {
                const planIsUpgrade =
                  Number(plan.amount) > Number(currentPriceAmount);
                return (
                  <label
                    key={plan.id}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedPlanId === plan.id
                        ? "border-[#2563EB] bg-blue-50/50"
                        : "border-[#E5E7EB] hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {planIsUpgrade ? (
                        <ArrowUpCircle className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <ArrowDownCircle className="h-5 w-5 text-blue-600" />
                      )}
                      <div>
                        <div className="font-semibold text-sm text-slate-900">
                          {formatPrice(
                            plan.amount,
                            plan.currency,
                            plan.billingInterval
                          )}
                        </div>
                        <div className="text-xs text-slate-500">
                          {planIsUpgrade ? "Upgrade" : "Downgrade"} ·{" "}
                          {plan.billingInterval.toLowerCase()} cycle
                        </div>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="newPlanOption"
                      value={plan.id}
                      checked={selectedPlanId === plan.id}
                      onChange={() => setSelectedPlanId(plan.id)}
                      className="text-[#2563EB] focus:ring-[#2563EB]"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {/* Effective Policy */}
          <div>
            <label className="text-xs font-semibold text-slate-700">
              Effective Policy
            </label>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              <label
                className={`p-2.5 rounded-lg border text-xs cursor-pointer text-center font-medium transition-all ${
                  effectivePolicy === "IMMEDIATE"
                    ? "border-[#2563EB] bg-blue-50 text-[#2563EB]"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="effectivePolicy"
                  value="IMMEDIATE"
                  checked={effectivePolicy === "IMMEDIATE"}
                  onChange={() => setEffectivePolicy("IMMEDIATE")}
                  className="sr-only"
                />
                Immediate (with Invoice)
              </label>
              <label
                className={`p-2.5 rounded-lg border text-xs cursor-pointer text-center font-medium transition-all ${
                  effectivePolicy === "NEXT_BILLING_DATE"
                    ? "border-[#2563EB] bg-blue-50 text-[#2563EB]"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="effectivePolicy"
                  value="NEXT_BILLING_DATE"
                  checked={effectivePolicy === "NEXT_BILLING_DATE"}
                  onChange={() => setEffectivePolicy("NEXT_BILLING_DATE")}
                  className="sr-only"
                />
                On Next Billing Date
              </label>
            </div>
          </div>

          {/* Policy Note */}
          <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <strong>Historical Invoices Protected:</strong> Existing invoice
              records will not be retroactively modified. The new pricing will be
              applied to the subscription lifecycle moving forward.
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !selectedPlanId}
              className="bg-[#2563EB] hover:bg-blue-700 text-white min-w-[130px]"
            >
              {submitting ? "Updating..." : "Confirm Plan Change"}
            </Button>
          </div>
        </form>
      )}
    </FormDialog>
  );
}
