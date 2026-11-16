"use client";

import { useState } from "react";
import { Plus, Package, Layers, Sparkles, DollarSign, Edit, MoreHorizontal } from "lucide-react";
import { PageContainer } from "@/components/shared/PageContainer";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { DataTable, Column } from "@/components/shared/DataTable";
import { SearchInput } from "@/components/shared/SearchInput";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { FormDialog } from "@/components/shared/FormDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  code: string;
  description: string;
  type: "Core SaaS" | "Add-on" | "Usage-Based";
  plansCount: number;
  subscribers: number;
  status: "active" | "draft";
}

const mockProducts: Product[] = [
  {
    id: "PROD-01",
    name: "Billora Platform Suite",
    code: "BILLORA-CORE",
    description: "Core recurring billing engine, invoicing, and customer ledger.",
    type: "Core SaaS",
    plansCount: 3,
    subscribers: 1428,
    status: "active",
  },
  {
    id: "PROD-02",
    name: "Advanced Revenue Analytics",
    code: "BILLORA-ANALYTICS",
    description: "Cohort retention, LTV/CAC modeling, and financial forecasting.",
    type: "Add-on",
    plansCount: 2,
    subscribers: 412,
    status: "active",
  },
  {
    id: "PROD-03",
    name: "Custom Domain & White-labeling",
    code: "BILLORA-BRAND",
    description: "Dedicated customer billing portal hosted on custom enterprise subdomains.",
    type: "Add-on",
    plansCount: 1,
    subscribers: 198,
    status: "active",
  },
  {
    id: "PROD-04",
    name: "Metered API Ingestion",
    code: "BILLORA-API-METER",
    description: "Pay-as-you-go event tracking for high-volume transactions.",
    type: "Usage-Based",
    plansCount: 2,
    subscribers: 86,
    status: "active",
  },
  {
    id: "PROD-05",
    name: "Multi-Currency Automated Tax",
    code: "BILLORA-TAX-ENGINE",
    description: "Automated VAT and Sales Tax calculation across 120+ international jurisdictions.",
    type: "Add-on",
    plansCount: 1,
    subscribers: 0,
    status: "draft",
  },
];

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    code: "",
    description: "",
    type: "Core SaaS" as const,
  });

  const filtered = mockProducts.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.code) {
      toast.error("Please fill in product name and code");
      return;
    }
    toast.success(`Product "${newProduct.name}" created successfully`);
    setDialogOpen(false);
    setNewProduct({ name: "", code: "", description: "", type: "Core SaaS" });
  };

  const columns: Column<Product>[] = [
    {
      header: "Product Details",
      cell: (row) => (
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[#2563EB]">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold text-slate-900">{row.name}</div>
            <div className="text-xs text-slate-500 max-w-sm line-clamp-1">
              {row.description}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Product Code",
      accessorKey: "code",
      cell: (row) => (
        <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-700">
          {row.code}
        </span>
      ),
    },
    {
      header: "Product Type",
      accessorKey: "type",
      cell: (row) => (
        <span className="text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
          {row.type}
        </span>
      ),
    },
    {
      header: "Active Plans",
      accessorKey: "plansCount",
      cell: (row) => <span className="font-medium text-slate-800">{row.plansCount} tiers</span>,
    },
    {
      header: "Subscribers",
      accessorKey: "subscribers",
      cell: (row) => (
        <span className="font-semibold text-slate-900">{row.subscribers.toLocaleString()}</span>
      ),
    },
    {
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Actions",
      cell: (row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.info(`Editing ${row.name}`)}
          className="h-8 gap-1 text-xs border-[#E5E7EB]"
        >
          <Edit className="h-3.5 w-3.5" />
          <span>Edit</span>
        </Button>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Products"
        description="Configure your billable software products, add-on modules, and metered usage components."
      >
        <Button
          onClick={() => setDialogOpen(true)}
          className="h-9 gap-1.5 bg-[#2563EB] hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4" />
          <span>New Product</span>
        </Button>
      </PageHeader>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Products" value="5" change="+1 this quarter" trend="up" icon={Package} />
        <StatCard title="Add-on Modules" value="3" change="45% attach rate" trend="up" icon={Layers} />
        <StatCard title="Total Subscribers" value="2,124" change="+14.2%" trend="up" icon={Sparkles} />
        <StatCard title="Avg Revenue / Product" value="$4,970" change="+8.0%" trend="up" icon={DollarSign} />
      </div>

      <div className="flex items-center justify-between">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Filter products by name or code..."
        />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(item) => item.id}
      />

      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Create New Product"
        description="Add a billable software product or add-on module to your catalog."
      >
        <form onSubmit={handleCreateProduct} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700">Product Name</label>
            <Input
              placeholder="e.g. Dedicated Support SLA"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              className="mt-1"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700">Product SKU / Code</label>
            <Input
              placeholder="e.g. BILLORA-SUPPORT-SLA"
              value={newProduct.code}
              onChange={(e) => setNewProduct({ ...newProduct, code: e.target.value })}
              className="mt-1"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700">Description</label>
            <Input
              placeholder="Brief summary of the product offering"
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              className="mt-1"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-[#2563EB] hover:bg-blue-700">
              Save Product
            </Button>
          </div>
        </form>
      </FormDialog>
    </PageContainer>
  );
}
