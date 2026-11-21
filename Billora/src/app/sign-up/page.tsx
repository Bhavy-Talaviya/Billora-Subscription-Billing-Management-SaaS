"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Lock, Mail, User, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { signUpSchema, SignUpInput } from "@/lib/validations/auth";
import { AuthCardLayout } from "@/components/auth/AuthCardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SignUpPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = watch("password", "");

  // Visual password criteria indicators
  const criteria = [
    { label: "At least 8 characters", met: passwordValue.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(passwordValue) },
    { label: "One lowercase letter", met: /[a-z]/.test(passwordValue) },
    { label: "One number", met: /[0-9]/.test(passwordValue) },
  ];

  const onSubmit = async (data: SignUpInput) => {
    setLoading(true);
    setServerError(null);

    try {
      // 1. Register user
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to create account.");
      }

      toast.success("Account created successfully! Signing you in...");

      // 2. Automatically authenticate user
      const signInResult = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (signInResult?.error) {
        toast.info("Registration successful. Please sign in with your credentials.");
        router.push("/sign-in");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setServerError(err.message || "An unexpected error occurred.");
      toast.error(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCardLayout
      heading="Create your account"
      subheading="Get started with Billora subscription & recurring billing management."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {serverError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs font-medium text-red-700">
            {serverError}
          </div>
        )}

        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700">
            Full Name
          </label>
          <div className="relative mt-1">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              {...register("name")}
              placeholder="Bhavy Talaviya"
              disabled={loading}
              className={`pl-9 h-9 text-xs sm:text-sm ${errors.name ? "border-red-500" : ""}`}
            />
          </div>
          {errors.name && (
            <p className="mt-0.5 text-[11px] text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-xs font-semibold text-slate-700">
            Work Email Address
          </label>
          <div className="relative mt-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              {...register("email")}
              type="email"
              placeholder="admin@billora.com"
              disabled={loading}
              className={`pl-9 h-9 text-xs sm:text-sm ${errors.email ? "border-red-500" : ""}`}
            />
          </div>
          {errors.email && (
            <p className="mt-0.5 text-[11px] text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-700">
            Password
          </label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              disabled={loading}
              className={`pl-9 pr-10 h-9 text-xs sm:text-sm ${errors.password ? "border-red-500" : ""}`}
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
            <p className="mt-0.5 text-[11px] text-red-600">{errors.password.message}</p>
          )}

          {/* Password complexity helper chips */}
          <div className="mt-1.5 grid grid-cols-2 gap-1">
            {criteria.map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-1.5 text-[10.5px] ${
                  item.met ? "text-emerald-600 font-medium" : "text-slate-400"
                }`}
              >
                <CheckCircle2
                  className={`h-3 w-3 shrink-0 ${item.met ? "text-emerald-500" : "text-slate-300"}`}
                />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-700">
            Confirm Password
          </label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              {...register("confirmPassword")}
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              disabled={loading}
              className={`pl-9 pr-10 h-9 text-xs sm:text-sm ${errors.confirmPassword ? "border-red-500" : ""}`}
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
            <p className="mt-0.5 text-[11px] text-red-600">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-9 mt-1 bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-xs sm:text-sm shadow-sm transition-all"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Creating Account...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Create Account
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          )}
        </Button>

        <div className="pt-1.5 text-center text-xs text-slate-500">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-semibold text-[#2563EB] hover:underline"
          >
            Sign in
          </Link>
        </div>
      </form>
    </AuthCardLayout>
  );
}
