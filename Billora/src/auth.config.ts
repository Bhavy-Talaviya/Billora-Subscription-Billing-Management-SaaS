import type { NextAuthConfig } from "next-auth";

/**
 * Resolves the true canonical origin for redirects.
 * Prioritizes request headers from reverse proxy (Vercel) over overridden internal URLs
 * to ensure users are never redirected to localhost in production.
 */
function getCanonicalOrigin(request: { nextUrl: URL; headers?: Headers }): string {
  // 1. Check incoming proxy host headers set by Vercel
  const forwardedHost =
    request.headers?.get("x-forwarded-host") || request.headers?.get("host");

  if (forwardedHost && !forwardedHost.includes("localhost")) {
    const proto =
      request.headers?.get("x-forwarded-proto") ||
      (forwardedHost.includes("vercel.app") ? "https" : "https");
    return `${proto}://${forwardedHost}`;
  }

  // 2. In production environments, check configured production domain variables
  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    if (
      process.env.NEXT_PUBLIC_APP_URL &&
      !process.env.NEXT_PUBLIC_APP_URL.includes("localhost")
    ) {
      return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
    }
    if (
      process.env.NEXTAUTH_URL &&
      !process.env.NEXTAUTH_URL.includes("localhost")
    ) {
      return process.env.NEXTAUTH_URL.replace(/\/$/, "");
    }
    if (
      process.env.AUTH_URL &&
      !process.env.AUTH_URL.includes("localhost")
    ) {
      return process.env.AUTH_URL.replace(/\/$/, "");
    }
    if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
      return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
    }
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
    // Hardcoded production domain fallback
    return "https://billora-subscription-billing-manage.vercel.app";
  }

  // 3. Fallback for local development
  return request.nextUrl.origin;
}

export const authConfig: NextAuthConfig = {
  trustHost: true,
  pages: {
    signIn: "/sign-in",
    newUser: "/sign-up",
  },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const pathname = request.nextUrl.pathname;
      const origin = getCanonicalOrigin(request);

      const isDashboardRoute =
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/customers") ||
        pathname.startsWith("/subscriptions") ||
        pathname.startsWith("/products") ||
        pathname.startsWith("/pricing") ||
        pathname.startsWith("/invoices") ||
        pathname.startsWith("/payments") ||
        pathname.startsWith("/analytics") ||
        pathname.startsWith("/settings");

      const isAuthRoute =
        pathname.startsWith("/sign-in") ||
        pathname.startsWith("/sign-up") ||
        pathname.startsWith("/forgot-password") ||
        pathname.startsWith("/reset-password");

      // Root route: redirect authenticated to dashboard, unauthenticated to sign-up
      if (pathname === "/") {
        if (isLoggedIn) {
          return Response.redirect(new URL("/dashboard", origin));
        }
        return Response.redirect(new URL("/sign-up", origin));
      }

      // If user is accessing protected dashboard routes
      if (isDashboardRoute) {
        if (isLoggedIn) return true;
        // Redirect to /sign-in
        const signInUrl = new URL("/sign-in", origin);
        signInUrl.searchParams.set("callbackUrl", pathname);
        return Response.redirect(signInUrl);
      }

      // If logged-in user visits auth routes, redirect to dashboard
      if (isAuthRoute) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/dashboard", origin));
        }
        return true;
      }

      return true;
    },
  },
  providers: [], // Initialized in auth.ts
};
