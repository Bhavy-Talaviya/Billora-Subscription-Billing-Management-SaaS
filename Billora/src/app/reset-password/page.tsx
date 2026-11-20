"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, ArrowRight, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { resetPasswordSchema, ResetPasswordInput } from "@/lib/validations/auth";
import { AuthCardLayout } from "@/components/auth/AuthCardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = watch("password", "");

  const criteria = [
    { label: "At least 8 characters", met: passwordValue.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(passwordValue) },
    { label: "One lowercase letter", met: /[a-z]/.test(passwordValue) },
    { label: "One number", met: /[0-9]/.test(passwordValue) },
  ];

  const onSubmit = async (data: ResetPasswordInput) => {
    setLoading(true);
    setServerError(null);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token || data.token,
          password: data.password,
          confirmPassword: data.confirmPassword,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to reset password.");
      }

      toast.success("Password reset successfully! Please sign in with your new password.");
      router.push("/sign-in");
    } catch (err: any) {
      setServerError(err.message || "Failed to reset password.");
      toast.error(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-amber-900 mb-1">
              Missing or invalid security token
            </p>
            Please use the reset password link provided in your recovery email or request a new one.
          </div>
        </div>
        <Link href="/forgot-password">
          <Button className="w-full bg-[#2563EB] hover:bg-blue-700 text-white">
            Request New Reset Link
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
          {serverError}
        </div>
      )}

      <input type="hidden" {...register("token")} value={token} />

      {/* New Password */}
      <div>
        <label className="block text-xs font-semibold text-slate-700">
          New Password
        </label>
        <div className="relative mt-1">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            {...register("password")}
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            disabled={loading}
            className={`pl-9 pr-10 h-10 text-sm ${errors.password ? "border-red-500" : ""}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
        )}

        {/* Criteria chips */}
        <div className="mt-2 grid grid-cols-2 gap-1.5 pt-1">
          {criteria.map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-1.5 text-[11px] ${
                item.met ? "text-emerald-600 font-medium" : "text-slate-400"
              }`}
            >
              <CheckCircle2
                className={`h-3 w-3 ${item.met ? "text-emerald-500" : "text-slate-300"}`}
              />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Confirm New Password */}
      <div>
        <label className="block text-xs font-semibold text-slate-700">
          Confirm New Password
        </label>
        <div className="relative mt-1">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            {...register("confirmPassword")}
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            disabled={loading}
            className={`pl-9 pr-10 h-10 text-sm ${errors.confirmPassword ? "border-red-500" : ""}`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            tabIndex={-1}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 text-xs text-red-600">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-10 mt-2 bg-[#2563EB] hover:bg-blue-700 text-white font-medium shadow-sm transition-all"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Updating Password...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            Update Password
            <ArrowRight className="h-4 w-4" />
          </span>
        )}
      </Button>

      <div className="pt-2 text-center text-xs">
        <Link
          href="/sign-in"
          className="text-slate-600 hover:text-slate-900 font-medium"
        >
          Cancel and Return to Sign In
        </Link>
      </div>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthCardLayout
      heading="Set new password"
      subheading="Create a new strong password for your Billora account."
    >
      <Suspense
        fallback={
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-[#2563EB]" />
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </AuthCardLayout>
  );
}
