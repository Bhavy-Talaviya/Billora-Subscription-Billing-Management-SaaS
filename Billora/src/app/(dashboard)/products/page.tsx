"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Package,
  Layers,
  ToggleLeft,
  ToggleRight,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  RefreshCw,
  Tag,
} from "lucide-react";
import { PageContainer } from "@/components/shared/PageContainer";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { DataTable, Column } from "@/components/shared/DataTable";
import { SearchInput } from "@/components/shared/SearchInput";
import { FilterDropdown } from "@/components/shared/FilterDropdown";
import { TableSkeleton } from "@/components/shared/LoadingSkeleton";
import { ProductFormDialog } from "@/components/products/ProductFormDialog";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { format } from "date-fns";
import { formatPrice } from "@/lib/utils/currency";
import { ProductInput } from "@/lib/validations/product";

interface PriceRow {
  id: string;
  amount: string;
  currency: string;
  billingInterval: string;
  active: boolean;
  _count: { subscriptions: number };
}

interface ProductRow {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  createdAt: string;
  prices: PriceRow[];
  _count: { prices: number };
}

interface ProductsResponse {
  products: ProductRow[];
  total: number;
  page: number;
  totalPages: number;
}

export default function ProductsPage() {
  const router = useRouter();
  const [data, setData] = useState<ProductsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [page, setPage] = useState(1);

  // Dialogs
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<ProductRow | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search,
        ...(activeFilter !== "all" && { active: activeFilter }),
      });
      const res = await fetch(`/api/products?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      setData(await res.json());
    } catch {
      toast.error("Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, [page, search, activeFilter]);

  useEffect(() => {
    const t = setTimeout(fetchProducts, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [fetchProducts, search]);

  const handleToggleActive = async (product: ProductRow) => {
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !product.active }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success(`"${product.name}" ${!product.active ? "activated" : "deactivated"}.`);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const editData: (ProductInput & { id: string }) | null = selected
    ? { id: selected.id, name: selected.name, description: selected.description ?? "", active: selected.active }
    : null;

  const totalActiveProducts = data?.products.filter((p) => p.active).length ?? 0;
  const totalPrices = data?.products.reduce((s, p) => s + p._count.prices, 0) ?? 0;
  const totalSubscriptions = data?.products.reduce(
    (s, p) => s + p.prices.reduce((ps, pr) => ps + pr._count.subscriptions, 0), 0
  ) ?? 0;

  const columns: Column<ProductRow>[] = [
    {
      header: "Product",
      cell: (row) => (
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[#2563EB]">
            <Package className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <button
              onClick={() => router.push(`/products/${row.id}`)}
              className="font-semibold text-slate-900 hover:text-[#2563EB] transition-colors text-left"
            >
              {row.name}
            </button>
            {row.description && (
              <p className="text-xs text-slate-400 line-clamp-1 max-w-xs mt-0.5">
                {row.description}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      cell: (row) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
            row.active
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-slate-100 text-slate-500 border border-slate-200"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${row.active ? "bg-green-500" : "bg-slate-400"}`} />
          {row.active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "Pricing Plans",
      cell: (row) => (
        <div className="space-y-1">
          {row.prices.length === 0 ? (
            <span className="text-xs text-slate-400 italic">No prices set</span>
          ) : (
            row.prices.slice(0, 2).map((price) => (
              <div key={price.id} className="flex items-center gap-1.5">
                <span
                  className={`text-xs font-semibold ${price.active ? "text-slate-800" : "text-slate-400 line-through"}`}
                >
                  {formatPrice(price.amount, price.currency, price.billingInterval)}
                </span>
                {!price.active && (
                  <span className="text-[10px] text-slate-400">(inactive)</span>
                )}
              </div>
            ))
          )}
          {row.prices.length > 2 && (
            <span className="text-xs text-[#2563EB] font-medium">
              +{row.prices.length - 2} more
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Subscriptions",
      cell: (row) => {
        const subs = row.prices.reduce((s, p) => s + p._count.subscriptions, 0);
        return (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
              subs > 0 ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-500"
            }`}
          >
            {subs}
          </span>
        );
      },
    },
    {
      header: "Created",
      cell: (row) => (
        <span className="text-xs text-slate-500">
          {format(new Date(row.createdAt), "MMM d, yyyy")}
        </span>
      ),
    },
    {
      header: "Actions",
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white border-[#E5E7EB] shadow-lg w-48">
            <DropdownMenuItem onClick={() => router.push(`/products/${row.id}`)} className="cursor-pointer">
              <Eye className="mr-2 h-3.5 w-3.5 text-slate-500" /> View & Manage Prices
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setSelected(row); setEditOpen(true); }} className="cursor-pointer">
              <Pencil className="mr-2 h-3.5 w-3.5 text-slate-500" /> Edit Product
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleToggleActive(row)} className="cursor-pointer">
              {row.active ? (
                <><ToggleLeft className="mr-2 h-3.5 w-3.5 text-slate-500" /> Deactivate</>
              ) : (
                <><ToggleRight className="mr-2 h-3.5 w-3.5 text-green-600" /> Activate</>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => { setSelected(row); setDeleteOpen(true); }}
              className="cursor-pointer text-[#EF4444] focus:text-[#EF4444] focus:bg-red-50"
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete Product
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Products"
        description="Configure your billable products, add-on modules, and metered usage components."
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchProducts} className="h-9 gap-1.5">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
          <Button onClick={() => setAddOpen(true)} className="h-9 gap-1.5 bg-[#2563EB] hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4" /> New Product
          </Button>
        </div>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Products" value={data?.total?.toString() ?? "—"} change="" trend="up" icon={Package} />
        <StatCard title="Active Products" value={totalActiveProducts.toString()} change="" trend="up" icon={Layers} />
        <StatCard title="Pricing Plans" value={totalPrices.toString()} change="" trend="up" icon={Tag} />
        <StatCard title="Total Subscriptions" value={totalSubscriptions.toString()} change="" trend="up" icon={Layers} />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Search products by name or description..."
        />
        <FilterDropdown
          label="Status"
          selectedValue={activeFilter}
          onSelect={(v) => { setActiveFilter(v); setPage(1); }}
          options={[
            { label: "All Products", value: "all" },
            { label: "Active", value: "true" },
            { label: "Inactive", value: "false" },
          ]}
        />
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : (
        <DataTable
          columns={columns}
          data={data?.products ?? []}
          keyExtractor={(item) => item.id}
          emptyTitle="No products found"
          emptyDescription={search ? `No results for "${search}".` : "Get started by creating your first product."}
          pagination={{
            currentPage: page,
            totalPages: data?.totalPages ?? 1,
            totalItems: data?.total ?? 0,
            pageSize: 10,
            onPageChange: setPage,
          }}
        />
      )}

      {/* Dialogs */}
      <ProductFormDialog open={addOpen} onOpenChange={setAddOpen} onSuccess={fetchProducts} initialData={null} />
      <ProductFormDialog open={editOpen} onOpenChange={setEditOpen} onSuccess={fetchProducts} initialData={editData} />
      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Product"
        description={`Are you sure you want to delete "${selected?.name}"?`}
        policyNote="Products linked to subscriptions via their pricing plans cannot be deleted. Deactivate the product instead."
        apiUrl={`/api/products/${selected?.id}`}
        onSuccess={() => { setSelected(null); fetchProducts(); }}
      />
    </PageContainer>
  );
}
