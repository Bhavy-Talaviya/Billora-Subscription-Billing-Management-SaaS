"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Tag,
  RefreshCw,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Package,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { PageContainer } from "@/components/shared/PageContainer";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { TableSkeleton } from "@/components/shared/LoadingSkeleton";
import { FilterDropdown } from "@/components/shared/FilterDropdown";
import { PriceFormDialog } from "@/components/products/PriceFormDialog";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { formatPrice, formatIntervalLabel } from "@/lib/utils/currency";

interface PriceItem {
  id: string;
  amount: string;
  currency: string;
  billingInterval: "MONTHLY" | "YEARLY" | "ONE_TIME";
  active: boolean;
  createdAt: string;
  product: {
    id: string;
    name: string;
    active: boolean;
  };
  _count: {
    subscriptions: number;
  };
}

interface ProductOption {
  id: string;
  name: string;
}

export default function PricingPage() {
  const router = useRouter();
  const [prices, setPrices] = useState<PriceItem[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [intervalFilter, setIntervalFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProductId, setSelectedProductId] = useState("all");

  // Dialogs
  const [addPriceOpen, setAddPriceOpen] = useState(false);
  const [editPriceOpen, setEditPriceOpen] = useState(false);
  const [deletePriceOpen, setDeletePriceOpen] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState<PriceItem | null>(null);

  const fetchPrices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedProductId !== "all") {
        params.append("productId", selectedProductId);
      }
      if (statusFilter !== "all") {
        params.append("active", statusFilter === "active" ? "true" : "false");
      }
      const res = await fetch(`/api/prices?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load prices");
      const data: PriceItem[] = await res.json();
      setPrices(data);
    } catch {
      toast.error("Failed to load pricing plans");
    } finally {
      setLoading(false);
    }
  }, [selectedProductId, statusFilter]);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products?limit=100");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch {
      console.error("Failed to fetch products list");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  const handleToggleActive = async (price: PriceItem) => {
    try {
      const res = await fetch(`/api/prices/${price.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !price.active }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update price status");
      }
      toast.success(
        `Price ${!price.active ? "activated" : "deactivated"} successfully.`
      );
      fetchPrices();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const filteredPrices = prices.filter((p) => {
    if (intervalFilter !== "all" && p.billingInterval !== intervalFilter) {
      return false;
    }
    return true;
  });

  const activePricesCount = prices.filter((p) => p.active).length;
  const monthlyCount = prices.filter((p) => p.billingInterval === "MONTHLY").length;
  const yearlyCount = prices.filter((p) => p.billingInterval === "YEARLY").length;
  const oneTimeCount = prices.filter((p) => p.billingInterval === "ONE_TIME").length;

  return (
    <PageContainer>
      <PageHeader
        title="Pricing Plans"
        description="Manage recurring subscription tiers, billing intervals, and multi-currency pricing."
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPrices}
            className="h-9 gap-1.5"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            onClick={() => {
              if (products.length === 0) {
                toast.error("Please create a product first before adding pricing plans.");
                router.push("/products");
                return;
              }
              setSelectedPrice(null);
              setAddPriceOpen(true);
            }}
            className="h-9 gap-1.5 bg-[#2563EB] hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Add Pricing Plan
          </Button>
        </div>
      </PageHeader>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Plans"
          value={prices.length.toString()}
          change={`${activePricesCount} active`}
          trend="up"
          icon={Tag}
        />
        <StatCard
          title="Monthly Plans"
          value={monthlyCount.toString()}
          change="Recurring"
          trend="up"
          icon={Layers}
        />
        <StatCard
          title="Yearly Plans"
          value={yearlyCount.toString()}
          change="Annual billing"
          trend="up"
          icon={CheckCircle2}
        />
        <StatCard
          title="One-Time Packages"
          value={oneTimeCount.toString()}
          change="Lifetime/Setup"
          trend="up"
          icon={Package}
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <FilterDropdown
            label="Product"
            selectedValue={selectedProductId}
            onSelect={setSelectedProductId}
            options={[
              { label: "All Products", value: "all" },
              ...products.map((p) => ({ label: p.name, value: p.id })),
            ]}
          />
          <FilterDropdown
            label="Billing Interval"
            selectedValue={intervalFilter}
            onSelect={setIntervalFilter}
            options={[
              { label: "All Intervals", value: "all" },
              { label: "Monthly", value: "MONTHLY" },
              { label: "Yearly", value: "YEARLY" },
              { label: "One-Time", value: "ONE_TIME" },
            ]}
          />
          <FilterDropdown
            label="Status"
            selectedValue={statusFilter}
            onSelect={setStatusFilter}
            options={[
              { label: "All Statuses", value: "all" },
              { label: "Active Only", value: "active" },
              { label: "Inactive Only", value: "inactive" },
            ]}
          />
        </div>
      </div>

      {/* Pricing Cards Grid */}
      {loading ? (
        <TableSkeleton rows={6} cols={5} />
      ) : filteredPrices.length === 0 ? (
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-12 text-center">
          <Tag className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-base font-semibold text-slate-800">
            No pricing plans found
          </h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your product or interval filters, or create your first
            pricing plan.
          </p>
          <Button
            onClick={() => {
              if (products.length === 0) {
                router.push("/products");
              } else {
                setAddPriceOpen(true);
              }
            }}
            className="mt-4 bg-[#2563EB] hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add First Plan
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPrices.map((price) => (
            <div
              key={price.id}
              className={`flex flex-col justify-between rounded-xl border bg-white p-5 transition-all shadow-sm hover:shadow-md ${
                price.active ? "border-[#E5E7EB]" : "border-slate-200 opacity-70 bg-slate-50/50"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-semibold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-full">
                      {price.product.name}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 mt-2">
                      {formatPrice(price.amount, price.currency, price.billingInterval)}
                    </h3>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                      price.active
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-slate-100 text-slate-500 border-slate-200"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        price.active ? "bg-green-500" : "bg-slate-400"
                      }`}
                    />
                    {price.active ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Billing Cycle:</span>
                    <span className="font-semibold text-slate-800">
                      {formatIntervalLabel(price.billingInterval)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Currency:</span>
                    <span className="font-semibold text-slate-800">{price.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Subscribers:</span>
                    <span className="font-semibold text-blue-600">
                      {price._count.subscriptions} subscription{price._count.subscriptions !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Created:</span>
                    <span className="text-slate-600">
                      {format(new Date(price.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleActive(price)}
                  className="h-8 text-xs text-slate-600 hover:text-slate-900"
                >
                  {price.active ? (
                    <>
                      <ToggleLeft className="h-3.5 w-3.5 mr-1 text-slate-400" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <ToggleRight className="h-3.5 w-3.5 mr-1 text-green-600" />
                      Activate
                    </>
                  )}
                </Button>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedPrice(price);
                      setEditPriceOpen(true);
                    }}
                    className="h-8 px-2 text-xs text-slate-600"
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedPrice(price);
                      setDeletePriceOpen(true);
                    }}
                    className="h-8 px-2 text-xs text-[#EF4444] hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Price Dialog */}
      {products.length > 0 && (
        <PriceFormDialog
          open={addPriceOpen}
          onOpenChange={setAddPriceOpen}
          onSuccess={fetchPrices}
          productId={products[0].id}
          productName={products[0].name}
          initialData={null}
        />
      )}

      {/* Edit Price Dialog */}
      {selectedPrice && (
        <PriceFormDialog
          open={editPriceOpen}
          onOpenChange={setEditPriceOpen}
          onSuccess={fetchPrices}
          productId={selectedPrice.product.id}
          productName={selectedPrice.product.name}
          initialData={selectedPrice}
        />
      )}

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={deletePriceOpen}
        onOpenChange={setDeletePriceOpen}
        title="Delete Pricing Plan"
        description={`Are you sure you want to delete ${
          selectedPrice
            ? formatPrice(
                selectedPrice.amount,
                selectedPrice.currency,
                selectedPrice.billingInterval
              )
            : "this pricing plan"
        }?`}
        policyNote="Pricing plans with existing subscriptions cannot be permanently deleted. Deactivate the plan instead to prevent new subscribers while preserving historical billing data."
        apiUrl={`/api/prices/${selectedPrice?.id}`}
        onSuccess={() => {
          setSelectedPrice(null);
          fetchPrices();
        }}
      />
    </PageContainer>
  );
}
