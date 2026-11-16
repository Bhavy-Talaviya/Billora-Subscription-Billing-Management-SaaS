import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Billora - SaaS Subscription Management & Billing",
  description:
    "Modern portfolio-grade subscription lifecycle management and recurring billing platform for SaaS businesses.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full font-sans antialiased text-slate-900 bg-[#F8FAFC]">
        {children}
      </body>
    </html>
  );
}
