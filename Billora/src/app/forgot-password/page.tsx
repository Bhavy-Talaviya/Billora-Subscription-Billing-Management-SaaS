"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, ArrowLeft, ArrowRight, Loader2, CheckCircle2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { forgotPasswordSchema, ForgotPasswordInput } from "@/lib/validations/auth";
import { AuthCardLayout } from "@/components/auth/AuthCardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setLoading(true);
    setDevResetUrl(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      setSubmitted(true);
      if (json.devResetUrl) {
        setDevResetUrl(json.devResetUrl);
      }
      toast.success("Password reset request submitted.");
    } catch {
      toast.error("Failed to request password reset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCardLayout
      heading="Reset your password"
      subheading="Enter your account email and we'll send you instructions to recover your password."
    >
      {submitted ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
              <div className="text-xs text-emerald-800 leading-relaxed">
                <p className="font-semibold text-emerald-900 mb-1">
                  Check your inbox
                </p>
                If an account with that email exists, we have generated a secure,
                single-use reset link valid for 60 minutes.
              </div>
            </div>
          </div>

          {/* Development simulation helper */}
          {devResetUrl && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-xs text-blue-900">
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <span>[Development Testing Mode]</span>
              </div>
              <p className="text-blue-700 mb-2">
                Simulated email link generated:
              </p>
              <Link
                href={devResetUrl}
                className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-[#2563EB] underline break-all hover:text-blue-800"
              >
                Click here to test Reset Password page
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          )}

          <div className="pt-2">
            <Link href="/sign-in">
              <Button
                variant="outline"
                className="w-full h-10 gap-2 border-slate-200 text-slate-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Return to Sign In
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Account Email
            </label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                {...register("email")}
                type="email"
                placeholder="admin@billora.com"
                disabled={loading}
                className={`pl-9 h-10 text-sm ${errors.email ? "border-red-500" : ""}`}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-10 bg-[#2563EB] hover:bg-blue-700 text-white font-medium shadow-sm transition-all"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending Instructions...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Send Reset Link
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>

          <div className="pt-2 text-center text-xs">
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Sign In
            </Link>
          </div>
        </form>
      )}
    </AuthCardLayout>
  );
}
