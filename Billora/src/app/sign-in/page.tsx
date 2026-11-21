"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Lock, Mail, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { loginSchema, LoginInput } from "@/lib/validations/auth";
import { AuthCardLayout } from "@/components/auth/AuthCardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (!res || res.error) {
        setErrorMessage("Invalid email or password. Please try again.");
        toast.error("Authentication failed.");
        return;
      }

      toast.success("Welcome back to Billora!");
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again.");
      toast.error("Failed to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
          {errorMessage}
        </div>
      )}

      {/* Email Address */}
      <div>
        <label className="block text-xs font-semibold text-slate-700">
          Email Address
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
          <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-700">
            Password
          </label>
          <Link
            href="/forgot-password"
            className="text-xs font-semibold text-[#2563EB] hover:underline"
          >
            Forgot password?
          </Link>
        </div>
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
          <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
        )}
      </div>

      {/* Remember me */}
      <div className="flex items-center justify-between py-1">
        <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
          <input
            type="checkbox"
            {...register("rememberMe")}
            className="h-4 w-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
          />
          <span>Remember this device for 30 days</span>
        </label>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-9 bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-xs sm:text-sm shadow-sm transition-all"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Signing In...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            Sign In
            <ArrowRight className="h-4 w-4" />
          </span>
        )}
      </Button>

      <div className="pt-2 text-center text-xs text-slate-500">
        Don&apos;t have an account yet?{" "}
        <Link
          href="/sign-up"
          className="font-semibold text-[#2563EB] hover:underline"
        >
          Create account
        </Link>
      </div>
    </form>
  );
}

export default function SignInPage() {
  return (
    <AuthCardLayout
      heading="Sign in to Billora"
      subheading="Enter your credentials to access your billing workspace."
    >
      <Suspense
        fallback={
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-[#2563EB]" />
          </div>
        }
      >
        <SignInForm />
      </Suspense>
    </AuthCardLayout>
  );
}
