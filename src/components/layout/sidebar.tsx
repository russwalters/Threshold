"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  LayoutDashboard,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Logo } from "./logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface SidebarProperty {
  id: string;
  name: string;
  city: string;
  state: string;
}

interface SidebarProps {
  properties?: SidebarProperty[];
  userFullName?: string | null;
  subscriptionTier?: string | null;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export function Sidebar({ properties = [], userFullName, subscriptionTier }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const initials = userFullName
    ? userFullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  const tierLabel =
    subscriptionTier === "portfolio"
      ? "Portfolio Plan"
      : subscriptionTier === "pro"
      ? "Pro Plan"
      : "Free Plan";

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-white border-r border-border flex flex-col z-40 transition-all duration-300",
        collapsed ? "w-[68px]" : "w-64"
      )}
    >
      {/* Logo area */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-border">
        {!collapsed && <Logo size="small" />}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {/* Main nav */}
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all mb-1",
                active
                  ? "bg-ember/10 text-ember"
                  : "text-stone hover:bg-linen-dark hover:text-hearth"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}

        <Separator className="my-4" />

        {/* Properties */}
        {!collapsed && (
          <div className="px-3 mb-2">
            <span className="text-xs font-semibold text-stone uppercase tracking-wider">Properties</span>
          </div>
        )}

        {properties.map((property) => {
          const active = pathname.startsWith(`/property/${property.id}`);
          return (
            <Link
              key={property.id}
              href={`/property/${property.id}`}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all mb-1",
                active
                  ? "bg-ember/10 text-ember font-medium"
                  : "text-stone hover:bg-linen-dark hover:text-hearth"
              )}
            >
              <Building2 className="h-5 w-5 shrink-0" />
              {!collapsed && (
                <div className="min-w-0">
                  <div className="truncate font-medium">{property.name}</div>
                  <div className="text-xs text-stone truncate">{property.city}, {property.state}</div>
                </div>
              )}
            </Link>
          );
        })}

        <Link
          href="/property/new"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-stone hover:bg-linen-dark hover:text-hearth transition-all mt-1"
        >
          <Plus className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Add Property</span>}
        </Link>
      </nav>

      {/* User area */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-ember text-white text-xs font-semibold">{initials}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-hearth truncate">{userFullName || "User"}</div>
              <div className="text-xs text-stone truncate">{tierLabel}</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
