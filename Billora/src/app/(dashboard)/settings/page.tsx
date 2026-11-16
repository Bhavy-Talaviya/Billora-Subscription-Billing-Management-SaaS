"use client";

import { useState } from "react";
import { Building2, CreditCard, Key, Bell, Shield, Save, Copy, Check } from "lucide-react";
import { PageContainer } from "@/components/shared/PageContainer";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "billing" | "api" | "notifications">("general");
  const [copiedKey, setCopiedKey] = useState(false);

  const [companyName, setCompanyName] = useState("Billora Technologies Inc.");
  const [supportEmail, setSupportEmail] = useState("support@billora.com");
  const [currency, setCurrency] = useState("USD ($)");
  const [invoicePrefix, setInvoicePrefix] = useState("INV-");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Settings updated successfully!");
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    toast.info("API Key copied to clipboard");
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Settings"
        description="Configure your organization's business details, invoice defaults, currencies, and API keys."
      >
        <Button
          onClick={handleSave}
          className="h-9 gap-1.5 bg-[#2563EB] hover:bg-blue-700 text-white"
        >
          <Save className="h-4 w-4" />
          <span>Save Changes</span>
        </Button>
      </PageHeader>

      {/* Tabs Navigation */}
      <div className="flex border-b border-[#E5E7EB] text-sm">
        <button
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 font-medium transition-colors ${
            activeTab === "general"
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>Company & General</span>
        </button>
        <button
          onClick={() => setActiveTab("billing")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 font-medium transition-colors ${
            activeTab === "billing"
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>Invoicing Defaults</span>
        </button>
        <button
          onClick={() => setActiveTab("api")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 font-medium transition-colors ${
            activeTab === "api"
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Key className="h-4 w-4" />
          <span>API & Webhooks</span>
        </button>
        <button
          onClick={() => setActiveTab("notifications")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 font-medium transition-colors ${
            activeTab === "notifications"
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Bell className="h-4 w-4" />
          <span>Alerts & Notifications</span>
        </button>
      </div>

      {/* Tab 1: General */}
      {activeTab === "general" && (
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Company Profile</CardTitle>
            <CardDescription className="text-xs">
              Primary organization metadata displayed on invoices and receipts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4 max-w-xl">
              <div>
                <label className="text-xs font-semibold text-slate-700">Company Legal Name</label>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Support / Billing Email</label>
                <Input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Default Currency</label>
                  <Input
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Tax ID / VAT Registration</label>
                  <Input defaultValue="US-EIN-9921820" className="mt-1" />
                </div>
              </div>
              <div className="pt-2">
                <Button type="submit" className="bg-[#2563EB] hover:bg-blue-700 text-white">
                  Update Profile
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Billing Defaults */}
      {activeTab === "billing" && (
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Invoice & Billing Configuration</CardTitle>
            <CardDescription className="text-xs">
              Default terms, numbering prefixes, and dunning retry schedules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4 max-w-xl">
              <div>
                <label className="text-xs font-semibold text-slate-700">Invoice Number Prefix</label>
                <Input
                  value={invoicePrefix}
                  onChange={(e) => setInvoicePrefix(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Payment Due Period</label>
                  <Input defaultValue="Net 14 Days" className="mt-1" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Failed Payment Retries</label>
                  <Input defaultValue="3 attempts (Smart Retry)" className="mt-1" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Invoice Footer Note</label>
                <Input
                  defaultValue="Thank you for using Billora. For queries, contact billing@billora.com."
                  className="mt-1"
                />
              </div>
              <div className="pt-2">
                <Button type="submit" className="bg-[#2563EB] hover:bg-blue-700 text-white">
                  Save Invoicing Defaults
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tab 3: API & Webhooks */}
      {activeTab === "api" && (
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle className="text-base font-semibold">API Credentials & Endpoints</CardTitle>
            <CardDescription className="text-xs">
              Simulated API keys for programmatic customer billing and webhook web listeners
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-w-xl">
            <div>
              <label className="text-xs font-semibold text-slate-700">Publishable API Key</label>
              <div className="mt-1 flex items-center gap-2">
                <Input
                  readOnly
                  value="pk_live_billora_9942a8f821cc04"
                  className="bg-slate-50 font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 h-9 w-9 border-[#E5E7EB]"
                  onClick={() => handleCopy("pk_live_billora_9942a8f821cc04")}
                >
                  {copiedKey ? <Check className="h-4 w-4 text-[#16A34A]" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Secret API Key</label>
              <div className="mt-1 flex items-center gap-2">
                <Input
                  readOnly
                  type="password"
                  value="sk_live_billora_772190bb43ea10098f"
                  className="bg-slate-50 font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 h-9 w-9 border-[#E5E7EB]"
                  onClick={() => handleCopy("sk_live_billora_772190bb43ea10098f")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Webhook Notification Endpoint</label>
              <Input
                defaultValue="https://api.yourdomain.com/v1/billora/events"
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 4: Notifications */}
      {activeTab === "notifications" && (
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Email & In-App Alerts</CardTitle>
            <CardDescription className="text-xs">
              Configure event triggers that dispatch alerts to administrators
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-w-xl text-sm">
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <div>
                <p className="font-semibold text-slate-800 text-xs">New Subscription Created</p>
                <p className="text-xs text-slate-500">Receive alert when customer upgrades or signs up</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-[#2563EB]" />
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <div>
                <p className="font-semibold text-slate-800 text-xs">Payment Failed Alert</p>
                <p className="text-xs text-slate-500">Trigger immediate alert on card decline or past due invoice</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-[#2563EB]" />
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <div>
                <p className="font-semibold text-slate-800 text-xs">Weekly Executive Digest</p>
                <p className="text-xs text-slate-500">Summary of MRR growth, subscriber changes, and churn</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-[#2563EB]" />
            </div>
            <div className="pt-2">
              <Button onClick={() => toast.success("Notification preferences saved")} className="bg-[#2563EB] hover:bg-blue-700 text-white">
                Save Preferences
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
