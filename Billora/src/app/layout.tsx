import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Billora - SaaS Subscription Management & Billing",
  description: "Modern subscription management and recurring billing platform for SaaS businesses.",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
