"use client";

import { useEffect, useState } from "react";
import { FormDialog } from "@/components/shared/FormDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { format, addDays } from "date-fns";

interface InvoiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialData?: any | null;
}

interface CustomerOption {
  id: string;
  name: string;
  email: string;
  company: string | null;
}

interface SubscriptionOption {
  id: string;
  status: string;
  price: {
    amount: string;
    currency: string;
    billingInterval: string;
    product: {
      name: string;
    };
  };
}

interface LineItemRow {
  description: string;
  quantity: number;
  unitPrice: number;
}

export function InvoiceFormDialog({
  open,
  onOpenChange,
  onSuccess,
  initialData,
}: InvoiceFormDialogProps) {
  const isEditing = Boolean(initialData?.id);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // Form State
  const [customerId, setCustomerId] = useState("");
  const [subscriptionId, setSubscriptionId] = useState<string>("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [issueDate, setIssueDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [dueDate, setDueDate] = useState(
    format(addDays(new Date(), 14), "yyyy-MM-dd")
  );
  const [status, setStatus] = useState<"DRAFT" | "PENDING" | "PAID" | "OVERDUE">(
    "PENDING"
  );
  const [discount, setDiscount] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItemRow[]>([
    { description: "", quantity: 1, unitPrice: 0 },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch customers
  useEffect(() => {
    if (!open) return;
    const fetchCustomers = async () => {
      setLoadingOptions(true);
      try {
        const res = await fetch("/api/customers?limit=100");
        if (res.ok) {
          const data = await res.json();
          setCustomers(data.customers || []);
          if (!isEditing && data.customers?.length > 0) {
            setCustomerId(data.customers[0].id);
          }
        }
      } catch {
        toast.error("Failed to load customer list.");
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchCustomers();
  }, [open, isEditing]);

  // Fetch subscriptions for selected customer
  useEffect(() => {
    if (!customerId) {
      setSubscriptions([]);
      return;
    }
    const fetchCustomerSubs = async () => {
      try {
        const res = await fetch(`/api/subscriptions?customerId=${customerId}`);
        if (res.ok) {
          const data = await res.json();
          setSubscriptions(data.subscriptions || []);
        }
      } catch {
        console.error("Failed to fetch customer subscriptions");
      }
    };
    fetchCustomerSubs();
  }, [customerId]);

  // Set initial data if editing
  useEffect(() => {
    if (initialData && open) {
      setCustomerId(initialData.customerId);
      setSubscriptionId(initialData.subscriptionId || "");
      setInvoiceNumber(initialData.invoiceNumber || "");
      setIssueDate(
        initialData.issueDate
          ? format(new Date(initialData.issueDate), "yyyy-MM-dd")
          : format(new Date(), "yyyy-MM-dd")
      );
      setDueDate(
        initialData.dueDate
          ? format(new Date(initialData.dueDate), "yyyy-MM-dd")
          : format(addDays(new Date(), 14), "yyyy-MM-dd")
      );
      setStatus(initialData.status || "PENDING");
      setDiscount(Number(initialData.discount) || 0);
      setTax(Number(initialData.tax) || 0);
      setNotes(initialData.notes || "");
      setItems(
        initialData.items && initialData.items.length > 0
          ? initialData.items.map((i: any) => ({
              description: i.description,
              quantity: Number(i.quantity),
              unitPrice: Number(i.unitPrice),
            }))
          : [{ description: "", quantity: 1, unitPrice: 0 }]
      );
    } else if (open && !initialData) {
      // Reset form
      setSubscriptionId("");
      setInvoiceNumber("");
      setIssueDate(format(new Date(), "yyyy-MM-dd"));
      setDueDate(format(addDays(new Date(), 14), "yyyy-MM-dd"));
      setStatus("PENDING");
      setDiscount(0);
      setTax(0);
      setNotes("");
      setItems([{ description: "", quantity: 1, unitPrice: 0 }]);
    }
  }, [initialData, open]);

  // When a subscription is picked, auto-populate line item
  const handleSubscriptionSelect = (subId: string) => {
    setSubscriptionId(subId);
    if (!subId) return;
    const sub = subscriptions.find((s) => s.id === subId);
    if (sub) {
      setItems([
        {
          description: `${sub.price.product.name} - ${sub.price.billingInterval} Subscription Renewal`,
          quantity: 1,
          unitPrice: Number(sub.price.amount),
        },
      ]);
    }
  };

  // Line item helpers
  const handleItemChange = (
    index: number,
    field: keyof LineItemRow,
    value: any
  ) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const addItemRow = () => {
    setItems([...items, { description: "", quantity: 1, unitPrice: 0 }]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) {
      toast.error("Invoice must have at least one line item.");
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  // Live calculation logic
  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
    0
  );
  const total = Math.max(0, subtotal - (Number(discount) || 0) + (Number(tax) || 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerId) {
      toast.error("Please select a customer.");
      return;
    }

    for (const item of items) {
      if (!item.description.trim()) {
        toast.error("All line items must have a description.");
        return;
      }
      if (item.quantity <= 0) {
        toast.error("Item quantity must be at least 1.");
        return;
      }
      if (item.unitPrice < 0) {
        toast.error("Unit price cannot be negative.");
        return;
      }
    }

    if (discount > subtotal) {
      toast.error("Discount cannot exceed the subtotal amount.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        customerId,
        subscriptionId: subscriptionId || null,
        invoiceNumber: invoiceNumber.trim() || undefined,
        issueDate: new Date(issueDate).toISOString(),
        dueDate: new Date(dueDate).toISOString(),
        status,
        discount: Number(discount) || 0,
        tax: Number(tax) || 0,
        notes: notes.trim() || null,
        items: items.map((i) => ({
          description: i.description.trim(),
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
        })),
      };

      const url = isEditing
        ? `/api/invoices/${initialData?.id}`
        : "/api/invoices";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to save invoice.");
      }

      toast.success(
        isEditing
          ? `Invoice #${json.invoiceNumber} updated successfully.`
          : `Invoice #${json.invoiceNumber} created successfully.`
      );

      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edit Invoice" : "Create New Invoice"}
      description={
        isEditing
          ? `Update line items and billing details for #${initialData?.invoiceNumber}.`
          : "Issue a new billing statement for subscriptions, one-time sales, or custom services."
      }
      maxWidth="xl"
    >
      {loadingOptions ? (
        <div className="py-8 text-center text-sm text-slate-500">
          Loading customer options...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Top Row: Customer and Subscriptions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">
                Customer <span className="text-red-500">*</span>
              </label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                disabled={isEditing}
                className="mt-1 flex h-9 w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                required
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.company ? `(${c.company})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">
                Link Existing Subscription (Optional)
              </label>
              <select
                value={subscriptionId}
                onChange={(e) => handleSubscriptionSelect(e.target.value)}
                className="mt-1 flex h-9 w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
              >
                <option value="">No linked subscription (One-time/Custom)</option>
                {subscriptions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.price.product.name} - ${Number(s.price.amount).toFixed(2)} (
                    {s.price.billingInterval})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">
                Issue Date
              </label>
              <Input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="mt-1 text-xs"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">
                Due Date <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 text-xs"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">
                Invoice Status
              </label>
              <select
                value={status}
                onChange={(e: any) => setStatus(e.target.value)}
                className="mt-1 flex h-9 w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
              >
                <option value="DRAFT">Draft</option>
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
                <option value="OVERDUE">Overdue</option>
              </select>
            </div>
          </div>

          {/* Line Items Section */}
          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Invoice Line Items
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItemRow}
                className="h-7 text-xs gap-1 bg-white"
              >
                <Plus className="h-3 w-3" /> Add Item
              </Button>
            </div>

            <div className="space-y-2 pt-1">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-white p-2 rounded-md border border-slate-200"
                >
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Item description / service"
                      value={item.description}
                      onChange={(e) =>
                        handleItemChange(idx, "description", e.target.value)
                      }
                      className="w-full text-xs border-0 focus:ring-0 p-1 placeholder:text-slate-400"
                      required
                    />
                  </div>
                  <div className="w-20">
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(
                          idx,
                          "quantity",
                          parseInt(e.target.value, 10) || 1
                        )
                      }
                      className="w-full text-xs rounded border border-slate-200 p-1 text-center"
                      required
                    />
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Price"
                      value={item.unitPrice}
                      onChange={(e) =>
                        handleItemChange(
                          idx,
                          "unitPrice",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full text-xs rounded border border-slate-200 p-1 text-right"
                      required
                    />
                  </div>
                  <div className="w-24 text-right text-xs font-bold text-slate-800 pr-1">
                    ${((item.quantity || 0) * (item.unitPrice || 0)).toFixed(2)}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItemRow(idx)}
                    className="h-7 w-7 text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Calculation Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="text-xs font-semibold text-slate-700">
                Notes / Terms
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Payment instructions, bank wire info, or invoice remarks..."
                rows={3}
                className="mt-1 w-full text-xs rounded-md border border-[#E5E7EB] p-2 focus:ring-1 focus:ring-[#2563EB] outline-none resize-none"
              />
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-900">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Discount ($):</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={subtotal}
                  value={discount}
                  onChange={(e) =>
                    setDiscount(Math.max(0, parseFloat(e.target.value) || 0))
                  }
                  className="w-24 text-xs rounded border border-slate-200 p-1 text-right bg-white"
                />
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Tax ($):</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={tax}
                  onChange={(e) =>
                    setTax(Math.max(0, parseFloat(e.target.value) || 0))
                  }
                  className="w-24 text-xs rounded border border-slate-200 p-1 text-right bg-white"
                />
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-bold text-slate-900">
                <span>Grand Total:</span>
                <span className="text-[#2563EB]">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
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
              className="bg-[#2563EB] hover:bg-blue-700 text-white min-w-[130px]"
            >
              {isSubmitting
                ? "Saving..."
                : isEditing
                ? "Update Invoice"
                : "Create Invoice"}
            </Button>
          </div>
        </form>
      )}
    </FormDialog>
  );
}
