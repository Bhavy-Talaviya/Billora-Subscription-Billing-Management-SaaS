"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Package,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Tag,
  Users,
} from "lucide-react";
import { PageContainer } from "@/components/shared/PageContainer";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import { ProductFormDialog } from "@/components/products/ProductFormDialog";
import { PriceFormDialog } from "@/components/products/PriceFormDialog";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { formatPrice, formatIntervalLabel } from "@/lib/utils/currency";
import { ProductInput } from "@/lib/validations/product";

interface PriceRow {
  id: string;
  amount: string;
  currency: string;
  billingInterval: "MONTHLY" | "YEARLY" | "ONE_TIME";
  active: boolean;
  createdAt: string;
  _count: { subscriptions: number };
}

interface ProductDetail {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  prices: PriceRow[];
  _count: { prices: number };
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit product dialog
  const [editProductOpen, setEditProductOpen] = useState(false);
  // Add price dialog
  const [addPriceOpen, setAddPriceOpen] = useState(false);
  // Edit price dialog
  const [editPriceOpen, setEditPriceOpen] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState<PriceRow | null>(null);
  // Delete price dialog
  const [deletePriceOpen, setDeletePriceOpen] = useState(false);
  const [deletingPrice, setDeletingPrice] = useState<PriceRow | null>(null);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${id}`);
      if (!res.ok) {
        if (res.status === 404) { toast.error("Product not found."); router.push("/products"); return; }
        throw new Error("Failed to load");
      }
      setProduct(await res.json());
    } catch {
      toast.error("Failed to load product details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProduct(); }, [id]);

  const handleToggleProductActive = async () => {
    if (!product) return;
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !product.active }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success(`Product ${!product.active ? "activated" : "deactivated"}.`);
      fetchProduct();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleTogglePriceActive = async (price: PriceRow) => {
    try {
      const res = await fetch(`/api/prices/${price.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !price.active }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success(`Price ${!price.active ? "activated" : "deactivated"}.`);
      fetchProduct();
    } catch (err: any) { toast.error(err.message); }
  };

  const editData: (ProductInput & { id: string }) | null = product
    ? { id: product.id, name: product.name, description: product.description ?? "", active: product.active }
    : null;

  if (loading) return <PageContainer><PageSkeleton /></PageContainer>;
  if (!product) return null;

  const totalSubscriptions = product.prices.reduce((s, p) => s + p._count.subscriptions, 0);

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.push("/products")} className="h-8 gap-1.5 text-slate-600">
            <ArrowLeft className="h-4 w-4" /> Products
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-[#2563EB]">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">{product.name}</h1>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${
                  product.active
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-slate-100 text-slate-500 border-slate-200"
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${product.active ? "bg-green-500" : "bg-slate-400"}`} />
                  {product.active ? "Active" : "Inactive"}
                </span>
              </div>
              {product.description && (
                <p className="text-sm text-slate-500 mt-0.5">{product.description}</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={fetchProduct} className="h-8 gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleToggleProductActive} className="h-8 gap-1.5">
            {product.active ? <><ToggleLeft className="h-4 w-4" /> Deactivate</> : <><ToggleRight className="h-4 w-4 text-green-600" /> Activate</>}
          </Button>
          <Button size="sm" onClick={() => setEditProductOpen(true)} className="h-8 gap-1.5 bg-[#2563EB] hover:bg-blue-700 text-white">
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Pricing Plans", value: product._count.prices, icon: Tag, color: "blue" },
          { label: "Total Subscriptions", value: totalSubscriptions, icon: Users, color: "green" },
          { label: "Active Prices", value: product.prices.filter(p => p.active).length, icon: Tag, color: "slate" },
          { label: "Created", value: format(new Date(product.createdAt), "MMM d, yyyy"), icon: Package, color: "slate" },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-xl border p-4 ${
            stat.color === "blue" ? "bg-blue-50 border-blue-100" :
            stat.color === "green" ? "bg-green-50 border-green-100" : "bg-slate-50 border-slate-200"
          }`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${
              stat.color === "blue" ? "text-blue-700" :
              stat.color === "green" ? "text-green-700" : "text-slate-700"
            }`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Pricing Plans Section */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Pricing Plans</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {product.prices.length} plan{product.prices.length !== 1 ? "s" : ""} · Multiple pricing tiers per product are supported
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setAddPriceOpen(true)}
            className="h-8 gap-1.5 bg-[#2563EB] hover:bg-blue-700 text-white"
          >
            <Plus className="h-3.5 w-3.5" /> Add Price
          </Button>
        </div>

        {product.prices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-3">
              <Tag className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-700">No pricing plans yet</p>
            <p className="text-xs text-slate-400 mt-1">Add your first price to make this product available for subscriptions.</p>
            <Button size="sm" onClick={() => setAddPriceOpen(true)} className="mt-4 gap-1.5 bg-[#2563EB] hover:bg-blue-700 text-white">
              <Plus className="h-3.5 w-3.5" /> Add First Price
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {product.prices.map((price) => (
              <div
                key={price.id}
                className={`flex items-center justify-between px-5 py-4 hover:bg-slate-50/50 transition-colors ${
                  !price.active ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    price.billingInterval === "MONTHLY" ? "bg-blue-50 text-blue-600" :
                    price.billingInterval === "YEARLY" ? "bg-purple-50 text-purple-600" : "bg-amber-50 text-amber-600"
                  }`}>
                    <Tag className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-slate-900">
                        {formatPrice(price.amount, price.currency, price.billingInterval)}
                      </span>
                      {!price.active && (
                        <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">inactive</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-slate-500">
                        {formatIntervalLabel(price.billingInterval)} · {price.currency}
                      </span>
                      <span className={`text-xs font-medium ${
                        price._count.subscriptions > 0 ? "text-blue-600" : "text-slate-400"
                      }`}>
                        {price._count.subscriptions} subscription{price._count.subscriptions !== 1 ? "s" : ""}
                      </span>
                      <span className="text-xs text-slate-400">
                        Added {format(new Date(price.createdAt), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTogglePriceActive(price)}
                    className="h-8 text-xs text-slate-500 hover:text-slate-900"
                  >
                    {price.active ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4 text-green-600" />}
                    {price.active ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setSelectedPrice(price); setEditPriceOpen(true); }}
                    className="h-8 text-slate-500 hover:text-slate-900"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setDeletingPrice(price); setDeletePriceOpen(true); }}
                    className="h-8 text-[#EF4444] hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <ProductFormDialog open={editProductOpen} onOpenChange={setEditProductOpen} onSuccess={fetchProduct} initialData={editData} />
      <PriceFormDialog
        open={addPriceOpen}
        onOpenChange={setAddPriceOpen}
        onSuccess={fetchProduct}
        productId={product.id}
        productName={product.name}
        initialData={null}
      />
      {selectedPrice && (
        <PriceFormDialog
          open={editPriceOpen}
          onOpenChange={setEditPriceOpen}
          onSuccess={fetchProduct}
          productId={product.id}
          productName={product.name}
          initialData={selectedPrice}
        />
      )}
      <DeleteConfirmDialog
        open={deletePriceOpen}
        onOpenChange={setDeletePriceOpen}
        title="Delete Pricing Plan"
        description={`Delete the ${deletingPrice ? formatPrice(deletingPrice.amount, deletingPrice.currency, deletingPrice.billingInterval) : ""} plan?`}
        policyNote="Prices linked to existing subscriptions cannot be deleted to preserve billing history. Deactivate the price instead."
        apiUrl={`/api/prices/${deletingPrice?.id}`}
        onSuccess={() => { setDeletingPrice(null); fetchProduct(); }}
      />
    </PageContainer>
  );
}
