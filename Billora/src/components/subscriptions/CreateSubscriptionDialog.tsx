"use client";

import { useEffect, useState } from "react";
import { FormDialog } from "@/components/shared/FormDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils/currency";
import { addMonths, addYears, format } from "date-fns";

interface CreateSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface CustomerOption {
  id: string;
  name: string;
  email: string;
  company: string | null;
}

interface PriceOption {
  id: string;
  amount: string;
  currency: string;
  billingInterval: "MONTHLY" | "YEARLY" | "ONE_TIME";
  active: boolean;
}

interface ProductOption {
  id: string;
  name: string;
  active: boolean;
  prices: PriceOption[];
}

export function CreateSubscriptionDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateSubscriptionDialogProps) {
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // Form states
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");
  const [startDate, setStartDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [firstBillingDate, setFirstBillingDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    const fetchOptions = async () => {
      setLoadingOptions(true);
      try {
        const [custRes, prodRes] = await Promise.all([
          fetch("/api/customers?limit=100"),
          fetch("/api/products?limit=100"),
        ]);
        if (custRes.ok) {
          const custData = await custRes.json();
          setCustomers(custData.customers || []);
          if (custData.customers?.length > 0) {
            setSelectedCustomer(custData.customers[0].id);
          }
        }
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          const activeProds: ProductOption[] = (prodData.products || []).filter(
            (p: ProductOption) => p.active
          );
          setProducts(activeProds);
          if (activeProds.length > 0) {
            setSelectedProduct(activeProds[0].id);
            const activePrices = activeProds[0].prices.filter((p) => p.active);
            if (activePrices.length > 0) {
              setSelectedPrice(activePrices[0].id);
            }
          }
        }
      } catch (err) {
        toast.error("Failed to load customer or product data.");
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchOptions();
  }, [open]);

  // When product changes, set first active price
  const handleProductChange = (prodId: string) => {
    setSelectedProduct(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      const activePrices = prod.prices.filter((p) => p.active);
      if (activePrices.length > 0) {
        setSelectedPrice(activePrices[0].id);
      } else {
        setSelectedPrice("");
      }
    }
  };

  const currentProduct = products.find((p) => p.id === selectedProduct);
  const availablePrices = (currentProduct?.prices || []).filter(
    (p) => p.active
  );
  const currentPrice = availablePrices.find((p) => p.id === selectedPrice);

  // Calculate next billing date preview
  let nextBillingPreview = "None (One-time)";
  if (currentPrice && currentPrice.billingInterval !== "ONE_TIME") {
    const base = firstBillingDate ? new Date(firstBillingDate) : new Date();
    if (!isNaN(base.getTime())) {
      const calculated =
        currentPrice.billingInterval === "MONTHLY"
          ? addMonths(base, 1)
          : addYears(base, 1);
      nextBillingPreview = format(calculated, "MMMM d, yyyy");
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) {
      toast.error("Please select a customer.");
      return;
    }
    if (!selectedProduct) {
      toast.error("Please select a product.");
      return;
    }
    if (!selectedPrice) {
      toast.error("Please select a pricing plan.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomer,
          productId: selectedProduct,
          priceId: selectedPrice,
          startDate: new Date(startDate).toISOString(),
          firstBillingDate: new Date(firstBillingDate).toISOString(),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to create subscription");
      }

      toast.success("Subscription created successfully.");
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
      title="Create New Subscription"
      description="Enroll an existing customer into an active product pricing plan."
      maxWidth="lg"
    >
      {loadingOptions ? (
        <div className="py-8 text-center text-sm text-slate-500">
          Loading customer and product catalog...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Selection */}
          <div>
            <label className="text-xs font-semibold text-slate-700">
              Select Customer <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="mt-1 flex h-9 w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
              required
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.company ? `(${c.company})` : ""} - {c.email}
                </option>
              ))}
            </select>
          </div>

          {/* Product Selection */}
          <div>
            <label className="text-xs font-semibold text-slate-700">
              Select Product <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => handleProductChange(e.target.value)}
              className="mt-1 flex h-9 w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
              required
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Pricing Plan Selection */}
          <div>
            <label className="text-xs font-semibold text-slate-700">
              Pricing Plan <span className="text-red-500">*</span>
            </label>
            {availablePrices.length === 0 ? (
              <p className="mt-1 text-xs text-amber-600 bg-amber-50 p-2.5 rounded-md border border-amber-200">
                This product does not have any active pricing plans. Please add a
                pricing plan first under Products.
              </p>
            ) : (
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availablePrices.map((price) => (
                  <label
                    key={price.id}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedPrice === price.id
                        ? "border-[#2563EB] bg-blue-50/60 text-[#2563EB]"
                        : "border-[#E5E7EB] bg-white hover:border-slate-300 text-slate-800"
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-sm">
                        {formatPrice(
                          price.amount,
                          price.currency,
                          price.billingInterval
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 capitalize">
                        {price.billingInterval.toLowerCase()} interval
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="pricingPlan"
                      value={price.id}
                      checked={selectedPrice === price.id}
                      onChange={() => setSelectedPrice(price.id)}
                      className="text-[#2563EB] focus:ring-[#2563EB]"
                    />
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Dates: Start Date & First Billing Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-xs font-semibold text-slate-700">
                Start Date
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">
                First Billing Date
              </label>
              <Input
                type="date"
                value={firstBillingDate}
                onChange={(e) => setFirstBillingDate(e.target.value)}
                className="mt-1"
                required
              />
            </div>
          </div>

          {/* Automatic Calculation Preview */}
          <div className="rounded-lg border border-blue-100 bg-blue-50/70 p-3 text-xs text-slate-700 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Selected Tier:</span>
              <span className="font-bold text-slate-900">
                {currentPrice
                  ? formatPrice(
                      currentPrice.amount,
                      currentPrice.currency,
                      currentPrice.billingInterval
                    )
                  : "None"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">
                Next Renewal Date:
              </span>
              <span className="font-semibold text-[#2563EB]">
                {nextBillingPreview}
              </span>
            </div>
          </div>

          {/* Dialog Action Buttons */}
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
              disabled={isSubmitting || availablePrices.length === 0}
              className="bg-[#2563EB] hover:bg-blue-700 text-white min-w-[140px]"
            >
              {isSubmitting ? "Creating..." : "Start Subscription"}
            </Button>
          </div>
        </form>
      )}
    </FormDialog>
  );
}
