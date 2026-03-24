"use client";

import Link from "next/link";

export function Logo({ className = "", size = "default" }: { className?: string; size?: "small" | "default" | "large" }) {
  const sizeClasses = {
    small: "text-lg",
    default: "text-2xl",
    large: "text-4xl",
  };

  return (
    <Link href="/" className={`font-heading font-semibold tracking-tight text-hearth hover:text-ember transition-colors ${sizeClasses[size]} ${className}`}>
      <span className="relative">
        <span className="relative inline-block">
          <span className="text-ember">t</span>
          <span>hreshold</span>
        </span>
      </span>
    </Link>
  );
}
