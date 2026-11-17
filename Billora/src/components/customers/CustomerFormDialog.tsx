"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { customerSchema, CustomerInput } from "@/lib/validations/customer";
import { FormDialog } from "@/components/shared/FormDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface CustomerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialData?: (CustomerInput & { id?: string }) | null;
}

export function CustomerFormDialog({
  open,
  onOpenChange,
  onSuccess,
  initialData,
}: CustomerFormDialogProps) {
  const isEditing = Boolean(initialData?.id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      billingAddress: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        company: initialData.company || "",
        billingAddress: initialData.billingAddress || "",
        city: initialData.city || "",
        state: initialData.state || "",
        postalCode: initialData.postalCode || "",
        country: initialData.country || "",
        notes: initialData.notes || "",
      });
    } else {
      reset({
        name: "",
        email: "",
        phone: "",
        company: "",
        billingAddress: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        notes: "",
      });
    }
  }, [initialData, reset, open]);

  const onSubmit = async (data: CustomerInput) => {
    try {
      const url = isEditing
        ? `/api/customers/${initialData?.id}`
        : "/api/customers";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to save customer");
      }

      toast.success(
        isEditing
          ? `Customer "${data.name}" updated successfully.`
          : `Customer "${data.name}" created successfully.`
      );

      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.");
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edit Customer Details" : "Add New Customer"}
      description={
        isEditing
          ? "Update customer contact profile, company information, and billing coordinates."
          : "Register a new customer account in the Billora subscription ledger."
      }
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Row 1: Name & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <Input
              {...register("name")}
              placeholder="e.g. Elena Rostova"
              className="mt-1"
            />
            {errors.name && (
              <p className="mt-1 text-[11px] text-[#EF4444] font-medium">
                {errors.name.message}
              </p>
            )}
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700">
              Email Address <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              {...register("email")}
              placeholder="e.g. elena@nexus.dev"
              className="mt-1"
            />
            {errors.email && (
              <p className="mt-1 text-[11px] text-[#EF4444] font-medium">
                {errors.email.message}
              </p>
            )}
          </div>
        </div>

        {/* Row 2: Company & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700">
              Company Name
            </label>
            <Input
              {...register("company")}
              placeholder="e.g. Nexus Digital Agency"
              className="mt-1"
            />
            {errors.company && (
              <p className="mt-1 text-[11px] text-[#EF4444] font-medium">
                {errors.company.message}
              </p>
            )}
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700">
              Phone Number
            </label>
            <Input
              {...register("phone")}
              placeholder="e.g. +1 (555) 019-2831"
              className="mt-1"
            />
            {errors.phone && (
              <p className="mt-1 text-[11px] text-[#EF4444] font-medium">
                {errors.phone.message}
              </p>
            )}
          </div>
        </div>

        {/* Row 3: Billing Address */}
        <div>
          <label className="text-xs font-semibold text-slate-700">
            Billing Address
          </label>
          <Input
            {...register("billingAddress")}
            placeholder="e.g. 142 Shoreditch High Street, Suite 300"
            className="mt-1"
          />
          {errors.billingAddress && (
            <p className="mt-1 text-[11px] text-[#EF4444] font-medium">
              {errors.billingAddress.message}
            </p>
          )}
        </div>

        {/* Row 4: City, State, Postal Code, Country */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div>
            <label className="text-xs font-semibold text-slate-700">City</label>
            <Input
              {...register("city")}
              placeholder="London"
              className="mt-1 text-xs"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700">State/Province</label>
            <Input
              {...register("state")}
              placeholder="London"
              className="mt-1 text-xs"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700">Postal Code</label>
            <Input
              {...register("postalCode")}
              placeholder="E1 6JE"
              className="mt-1 text-xs"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700">Country</label>
            <Input
              {...register("country")}
              placeholder="United Kingdom"
              className="mt-1 text-xs"
            />
          </div>
        </div>

        {/* Row 5: Notes */}
        <div>
          <label className="text-xs font-semibold text-slate-700">
            Internal Account Notes
          </label>
          <textarea
            {...register("notes")}
            rows={2}
            placeholder="Special billing terms, account notes, or client SLA details..."
            className="mt-1 flex w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-xs shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#2563EB]"
          />
          {errors.notes && (
            <p className="mt-1 text-[11px] text-[#EF4444] font-medium">
              {errors.notes.message}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#2563EB] hover:bg-blue-700 text-white min-w-[120px]"
          >
            {isSubmitting
              ? "Saving..."
              : isEditing
              ? "Save Changes"
              : "Create Customer"}
          </Button>
        </div>
      </form>
    </FormDialog>
  );
}
