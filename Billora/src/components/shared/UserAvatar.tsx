"use client";

import { useState, useEffect } from "react";

interface UserAvatarProps {
  name: string;
  image?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function UserAvatar({
  name,
  image,
  size = "md",
  className = "",
}: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);

  // Reset error state when the image URL changes
  useEffect(() => {
    setImgError(false);
  }, [image]);

  const initials =
    name
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  const sizeClasses = {
    xs: "h-7 w-7 text-[10px]",
    sm: "h-8 w-8 text-xs",
    md: "h-9 w-9 text-xs",
    lg: "h-12 w-12 text-sm",
    xl: "h-16 w-16 text-lg",
  }[size];

  if (image && !imgError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt={name}
        onError={() => setImgError(true)}
        className={`rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700 ${sizeClasses} ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-[#2563EB] text-white font-semibold shrink-0 shadow-sm ${sizeClasses} ${className}`}
    >
      {initials}
    </div>
  );
}
