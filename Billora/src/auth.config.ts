import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/sign-in",
    newUser: "/sign-up",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

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
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return Response.redirect(new URL("/sign-up", nextUrl));
      }

      // If user is accessing protected dashboard routes
      if (isDashboardRoute) {
        if (isLoggedIn) return true;
        // Redirect to /sign-in
        const signInUrl = new URL("/sign-in", nextUrl);
        signInUrl.searchParams.set("callbackUrl", pathname);
        return Response.redirect(signInUrl);
      }

      // If logged-in user visits auth routes, redirect to dashboard
      if (isAuthRoute) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      return true;
    },
  },
  providers: [], // Initialized in auth.ts
};
