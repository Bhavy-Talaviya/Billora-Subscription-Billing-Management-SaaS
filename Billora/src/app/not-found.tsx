import Link from "next/link";
import { AlertCircle, ArrowLeft, LayoutDashboard, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC] px-4 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#2563EB] shadow-sm mb-6 border border-blue-100">
        <AlertCircle className="h-8 w-8 text-[#2563EB]" />
      </div>

      <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#2563EB]">
        404 — Page Not Found
      </span>

      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        We lost that billing record
      </h1>

      <p className="mt-3 max-w-md text-sm text-slate-500 leading-relaxed">
        The page or resource you are searching for does not exist, has been archived,
        or was moved to a new route within Billora.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/dashboard">
          <Button className="h-10 gap-2 bg-[#2563EB] hover:bg-blue-700 text-white font-medium shadow-sm">
            <LayoutDashboard className="h-4 w-4" />
            <span>Return to Dashboard</span>
          </Button>
        </Link>
        <Link href="/customers">
          <Button variant="outline" className="h-10 gap-2 border-slate-200 text-slate-700 hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4" />
            <span>Go to Customers</span>
          </Button>
        </Link>
      </div>

      <div className="mt-12 rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-500 shadow-sm max-w-sm">
        <div className="flex items-center justify-center gap-2 font-medium text-slate-700 mb-1">
          <HelpCircle className="h-4 w-4 text-slate-400" />
          <span>Need assistance?</span>
        </div>
        Contact system administrator or check our documentation in Settings.
      </div>
    </div>
  );
}
