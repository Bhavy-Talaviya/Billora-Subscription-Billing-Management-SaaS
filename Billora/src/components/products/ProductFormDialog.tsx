"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, ProductInput } from "@/lib/validations/product";
import { FormDialog } from "@/components/shared/FormDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialData?: (ProductInput & { id?: string }) | null;
}

export function ProductFormDialog({
  open,
  onOpenChange,
  onSuccess,
  initialData,
}: ProductFormDialogProps) {
  const isEditing = Boolean(initialData?.id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: "", description: "", active: true },
  });

  useEffect(() => {
    if (open) {
      reset(
        initialData
          ? { name: initialData.name, description: initialData.description ?? "", active: initialData.active ?? true }
          : { name: "", description: "", active: true }
      );
    }
  }, [open, initialData, reset]);

  const onSubmit = async (data: ProductInput) => {
    try {
      const url = isEditing ? `/api/products/${initialData?.id}` : "/api/products";
      const method = isEditing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save product");
      toast.success(
        isEditing
          ? `Product "${data.name}" updated.`
          : `Product "${data.name}" created.`
      );
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
      title={isEditing ? "Edit Product" : "Create New Product"}
      description={
        isEditing
          ? "Update product name, description, or status."
          : "Add a new billable product to your catalog."
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-700">
            Product Name <span className="text-red-500">*</span>
          </label>
          <Input
            {...register("name")}
            placeholder="e.g. Billora Platform Suite"
            className="mt-1"
          />
          {errors.name && (
            <p className="mt-1 text-[11px] text-[#EF4444]">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700">Description</label>
          <textarea
            {...register("description")}
            rows={3}
            placeholder="Brief description of what this product offers..."
            className="mt-1 flex w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#2563EB] resize-none"
          />
          {errors.description && (
            <p className="mt-1 text-[11px] text-[#EF4444]">{errors.description.message}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="active"
            {...register("active")}
            className="h-4 w-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
          />
          <label htmlFor="active" className="text-sm font-medium text-slate-700 cursor-pointer">
            Active (visible for new subscriptions)
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="bg-[#2563EB] hover:bg-blue-700 text-white min-w-[120px]">
            {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Product"}
          </Button>
        </div>
      </form>
    </FormDialog>
  );
}
