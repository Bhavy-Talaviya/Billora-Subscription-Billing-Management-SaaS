"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  User,
  Shield,
  Building2,
  CreditCard,
  Key,
  Bell,
  Save,
  Copy,
  Check,
  LogOut,
  AlertTriangle,
  Lock,
  Loader2,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { PageContainer } from "@/components/shared/PageContainer";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SignOutConfirmDialog } from "@/components/auth/SignOutConfirmDialog";
import { toast } from "sonner";

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();

  type TabKey = "account" | "security" | "general" | "billing" | "api" | "notifications" | "danger";
  const [activeTab, setActiveTab] = useState<TabKey>("account");
  const [copiedKey, setCopiedKey] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);

  // Account State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [savingAccount, setSavingAccount] = useState(false);

  // Security / Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // General / Company Defaults
  const [companyName, setCompanyName] = useState("Billora Technologies Inc.");
  const [supportEmail, setSupportEmail] = useState("support@billora.com");
  const [currency, setCurrency] = useState("USD ($)");
  const [invoicePrefix, setInvoicePrefix] = useState("INV-");

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
      setAvatarUrl(session.user.image || "");
    }
  }, [session]);

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAccount(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          image: avatarUrl || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to update profile.");
      }

      await updateSession({ name, image: avatarUrl });
      toast.success("Profile information updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setSavingAccount(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmNewPassword,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to change password.");
      }

      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to change password.");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    toast.info("API Key copied to clipboard");
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const newPassCriteria = [
    { label: "At least 8 characters", met: newPassword.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(newPassword) },
    { label: "One lowercase letter", met: /[a-z]/.test(newPassword) },
    { label: "One number", met: /[0-9]/.test(newPassword) },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Settings & Workspace"
        description="Manage your account profile, credentials, organization defaults, and billing configurations."
      >
        <Button
          onClick={() => setSignOutOpen(true)}
          variant="outline"
          className="h-9 gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </Button>
      </PageHeader>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap border-b border-[#E5E7EB] text-sm">
        {[
          { key: "account", label: "Account Profile", icon: User },
          { key: "security", label: "Security & Password", icon: Shield },
          { key: "general", label: "Company Profile", icon: Building2 },
          { key: "billing", label: "Invoicing Defaults", icon: CreditCard },
          { key: "api", label: "API & Webhooks", icon: Key },
          { key: "notifications", label: "Alerts", icon: Bell },
          { key: "danger", label: "Danger Zone", icon: AlertTriangle },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabKey)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 font-medium transition-colors ${
                isActive
                  ? "border-[#2563EB] text-[#2563EB]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Account Profile */}
      {activeTab === "account" && (
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle className="text-base font-semibold">User Profile Information</CardTitle>
            <CardDescription className="text-xs">
              Update your account name and email address for system notifications and workspace audit logs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateAccount} className="space-y-4 max-w-xl">
              <div>
                <label className="text-xs font-semibold text-slate-700">Full Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Bhavy Talaviya"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Email Address</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@billora.com"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Profile Picture URL (Optional)
                </label>
                <Input
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Workspace Role</label>
                <div className="mt-1">
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#2563EB] border border-blue-100">
                    {(session?.user as any)?.role || "USER"} (Administrator)
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Roles are managed at the organization level and cannot be modified self-service.
                  </p>
                </div>
              </div>
              <div className="pt-2 flex items-center gap-3">
                <Button
                  type="submit"
                  disabled={savingAccount}
                  className="bg-[#2563EB] hover:bg-blue-700 text-white"
                >
                  {savingAccount ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving Profile...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Save Profile Changes
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Security & Password */}
      {activeTab === "security" && (
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Security & Password Management</CardTitle>
            <CardDescription className="text-xs">
              Change your password and monitor authenticated sessions across devices.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
              <div>
                <label className="text-xs font-semibold text-slate-700">Current Password</label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">New Password</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1"
                  required
                />
                <div className="mt-2 grid grid-cols-2 gap-1.5 pt-1">
                  {newPassCriteria.map((c, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-1.5 text-[11px] ${
                        c.met ? "text-emerald-600 font-medium" : "text-slate-400"
                      }`}
                    >
                      <CheckCircle2
                        className={`h-3 w-3 ${c.met ? "text-emerald-500" : "text-slate-300"}`}
                      />
                      <span>{c.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Confirm New Password</label>
                <Input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1"
                  required
                />
              </div>
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={savingPassword}
                  className="bg-[#2563EB] hover:bg-blue-700 text-white"
                >
                  {savingPassword ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating Password...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Update Password
                    </span>
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                Active Session
              </h4>
              <div className="mt-2 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <div>
                    <span className="font-semibold text-slate-800">Current Web Browser</span>
                    <p className="text-[11px] text-slate-500">JWT Token Session (NextAuth / Auth.js)</p>
                  </div>
                </div>
                <Button
                  onClick={() => setSignOutOpen(true)}
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs text-red-600 hover:bg-red-50"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Company Profile */}
      {activeTab === "general" && (
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Company Profile</CardTitle>
            <CardDescription className="text-xs">
              Primary organization metadata displayed on invoices and receipts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-w-xl">
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
                <Button
                  onClick={() => toast.success("Company profile defaults updated.")}
                  className="bg-[#2563EB] hover:bg-blue-700 text-white"
                >
                  Update Company Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 4: Invoicing Defaults */}
      {activeTab === "billing" && (
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Invoice & Billing Configuration</CardTitle>
            <CardDescription className="text-xs">
              Default terms, numbering prefixes, and dunning retry schedules.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-w-xl">
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
                <Button
                  onClick={() => toast.success("Invoicing defaults saved.")}
                  className="bg-[#2563EB] hover:bg-blue-700 text-white"
                >
                  Save Invoicing Defaults
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 5: API & Webhooks */}
      {activeTab === "api" && (
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle className="text-base font-semibold">API Credentials & Endpoints</CardTitle>
            <CardDescription className="text-xs">
              Simulated API keys for programmatic customer billing and webhook listeners.
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

      {/* Tab 6: Alerts & Notifications */}
      {activeTab === "notifications" && (
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Email & In-App Alerts</CardTitle>
            <CardDescription className="text-xs">
              Configure event triggers that dispatch alerts to administrators.
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
              <Button
                onClick={() => toast.success("Notification preferences saved.")}
                className="bg-[#2563EB] hover:bg-blue-700 text-white"
              >
                Save Preferences
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 7: Danger Zone */}
      {activeTab === "danger" && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Danger Zone
            </CardTitle>
            <CardDescription className="text-xs">
              Actions here affect your authenticated session and workspace data permanence.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 max-w-xl">
            {/* Sign Out Action */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div>
                <p className="text-xs font-semibold text-slate-800">Sign Out of Billora</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  End your current session across this browser.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSignOutOpen(true)}
                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 gap-1.5"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </Button>
            </div>

            {/* Account Deletion Policy */}
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-xs text-amber-800 leading-relaxed space-y-2">
              <p className="font-bold text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Financial Audit & Ledger Protection Policy
              </p>
              <p>
                Direct account deletion is currently restricted by system compliance rules.
                Because your account is associated with historical invoices, payment settlement
                records, and active subscriptions, automated permanent account destruction is disabled
                to protect tax and GAAP audit requirements.
              </p>
              <p>
                To deactivate your tenant or request data export, please contact support at{" "}
                <span className="font-semibold text-amber-950">compliance@billora.com</span>.
              </p>
            </div>

            <Button
              disabled
              variant="outline"
              className="w-full text-slate-400 border-slate-200 cursor-not-allowed gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Account (Disabled by Policy)
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Sign Out Modal */}
      <SignOutConfirmDialog open={signOutOpen} onOpenChange={setSignOutOpen} />
    </PageContainer>
  );
}
