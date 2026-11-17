"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { priceSchema, PriceInput } from "@/lib/validations/product";
import { FormDialog } from "@/components/shared/FormDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils/currency";

interface PriceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  productId: string;
  productName: string;
  initialData?: {
    id?: string;
    amount: number | string;
    currency: string;
    billingInterval: "MONTHLY" | "YEARLY" | "ONE_TIME";
    active: boolean;
  } | null;
}

const INTERVALS = [
  { value: "MONTHLY", label: "Monthly" },
  { value: "YEARLY", label: "Yearly" },
  { value: "ONE_TIME", label: "One-time" },
];

const CURRENCIES = ["USD", "EUR", "GBP", "INR", "CAD", "AUD", "JPY", "SGD"];

export function PriceFormDialog({
  open,
  onOpenChange,
  onSuccess,
  productId,
  productName,
  initialData,
}: PriceFormDialogProps) {
  const isEditing = Boolean(initialData?.id);
  const [preview, setPreview] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PriceInput>({
    resolver: zodResolver(priceSchema),
    defaultValues: {
      productId,
      amount: 0,
      currency: "USD",
      billingInterval: "MONTHLY",
      active: true,
    },
  });

  const watchAmount = watch("amount");
  const watchCurrency = watch("currency");
  const watchInterval = watch("billingInterval");

  useEffect(() => {
    const num = Number(watchAmount);
    if (!isNaN(num) && num > 0) {
      setPreview(formatPrice(num, watchCurrency, watchInterval));
    } else {
      setPreview("");
    }
  }, [watchAmount, watchCurrency, watchInterval]);

  useEffect(() => {
    if (open) {
      reset(
        initialData
          ? {
              productId,
              amount: Number(initialData.amount),
              currency: initialData.currency,
              billingInterval: initialData.billingInterval,
              active: initialData.active,
            }
          : { productId, amount: 0, currency: "USD", billingInterval: "MONTHLY", active: true }
      );
    }
  }, [open, initialData, productId, reset]);

  const onSubmit = async (data: PriceInput) => {
    try {
      const url = isEditing ? `/api/prices/${initialData?.id}` : "/api/prices";
      const method = isEditing ? "PATCH" : "POST";
      const payload = isEditing
        ? { amount: data.amount, currency: data.currency, billingInterval: data.billingInterval, active: data.active }
        : data;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save price");
      toast.success(isEditing ? "Price updated." : `Price ${formatPrice(data.amount, data.currency, data.billingInterval)} created for ${productName}.`);
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edit Pricing Plan" : `Add Price to ${productName}`}
      description={
        isEditing
          ? "Update the amount, currency, or billing interval."
          : `Create a new pricing plan for "${productName}".`
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Amount + Currency */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700">
              Amount <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              {...register("amount", { valueAsNumber: true })}
              placeholder="99.00"
              className="mt-1"
            />
            {errors.amount && (
              <p className="mt-1 text-[11px] text-[#EF4444]">{errors.amount.message}</p>
            )}
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700">Currency</label>
            <select
              {...register("currency")}
              className="mt-1 flex h-9 w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Billing Interval */}
        <div>
          <label className="text-xs font-semibold text-slate-700">
            Billing Interval <span className="text-red-500">*</span>
          </label>
          <div className="mt-2 flex gap-2">
            {INTERVALS.map((interval) => (
              <label
                key={interval.value}
                className="flex-1 cursor-pointer"
              >
                <input
                  type="radio"
                  value={interval.value}
                  {...register("billingInterval")}
                  className="sr-only peer"
                />
                <div className="flex items-center justify-center rounded-lg border-2 border-[#E5E7EB] px-3 py-2 text-xs font-semibold text-slate-600 transition-all peer-checked:border-[#2563EB] peer-checked:bg-blue-50 peer-checked:text-[#2563EB] hover:border-slate-400">
                  {interval.label}
                </div>
              </label>
            ))}
          </div>
          {errors.billingInterval && (
            <p className="mt-1 text-[11px] text-[#EF4444]">{errors.billingInterval.message}</p>
          )}
        </div>

        {/* Live Preview */}
        {preview && (
          <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
            <p className="text-xs text-slate-500 font-medium mb-1">Preview</p>
            <p className="text-xl font-bold text-[#2563EB]">{preview}</p>
          </div>
        )}

        {/* Active toggle */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="price-active"
            {...register("active")}
            className="h-4 w-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
          />
          <label htmlFor="price-active" className="text-sm font-medium text-slate-700 cursor-pointer">
            Active (available for new subscriptions)
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="bg-[#2563EB] hover:bg-blue-700 text-white min-w-[120px]">
            {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Price"}
          </Button>
        </div>
      </form>
    </FormDialog>
  );
}
