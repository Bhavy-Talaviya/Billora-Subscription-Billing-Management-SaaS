"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-xs text-slate-500">
      <Link
        href="/dashboard"
        className="flex items-center gap-1 hover:text-slate-900 transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
        <span className="sr-only">Home</span>
      </Link>
      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join("/")}`;
        const isLast = index === segments.length - 1;
        const formattedTitle = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");

        return (
          <div key={href} className="flex items-center">
            <ChevronRight className="h-3.5 w-3.5 mx-1.5 text-slate-400" />
            {isLast ? (
              <span className="font-medium text-slate-900">{formattedTitle}</span>
            ) : (
              <Link href={href} className="hover:text-slate-900 transition-colors">
                {formattedTitle}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
