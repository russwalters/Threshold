"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Plus,
  X,
  Camera,
  Wrench,
  Home,
  ClipboardList,
  Package,
} from "lucide-react";

interface QuickAddMenuProps {
  propertyId: string;
}

const quickActions = [
  {
    icon: Camera,
    label: "Take a photo",
    href: (id: string) => `/property/${id}?tab=rooms`,
    color: "bg-slate-brand/10 text-slate-brand",
  },
  {
    icon: Wrench,
    label: "Add appliance",
    href: (id: string) => `/property/${id}?tab=appliances`,
    color: "bg-ember/10 text-ember",
  },
  {
    icon: Home,
    label: "Add room",
    href: (id: string) => `/property/${id}?tab=rooms`,
    color: "bg-sage/10 text-sage",
  },
  {
    icon: ClipboardList,
    label: "Log maintenance",
    href: (id: string) => `/property/${id}?tab=maintenance`,
    color: "bg-caution/10 text-caution",
  },
  {
    icon: Package,
    label: "Add consumable",
    href: (id: string) => `/property/${id}?tab=appliances`,
    color: "bg-clay/10 text-clay",
  },
];

export function QuickAddMenu({ propertyId }: QuickAddMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  return (
    <div ref={menuRef} className="fixed bottom-6 right-6 z-50">
      {/* Action items */}
      <div
        className={`absolute bottom-16 right-0 flex flex-col gap-2 transition-all duration-300 ${
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        {quickActions.map((action, index) => (
          <Link
            key={action.label}
            href={action.href(propertyId)}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 group"
            style={{
              transitionDelay: isOpen ? `${index * 50}ms` : "0ms",
            }}
          >
            {/* Label */}
            <span className="bg-white border border-clay/20 text-hearth text-sm font-medium px-3 py-2 rounded-xl shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">
              {action.label}
            </span>

            {/* Icon button */}
            <div
              className={`h-12 w-12 rounded-2xl ${action.color} flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200`}
            >
              <action.icon className="h-5 w-5" />
            </div>
          </Link>
        ))}
      </div>

      {/* FAB button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`h-14 w-14 rounded-2xl shadow-xl flex items-center justify-center transition-all duration-300 ${
          isOpen
            ? "bg-hearth hover:bg-hearth/90 rotate-0"
            : "bg-ember hover:bg-ember-dark rotate-0 shadow-ember/25"
        }`}
        aria-label={isOpen ? "Close quick add menu" : "Open quick add menu"}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white transition-transform duration-300" />
        ) : (
          <Plus className="h-6 w-6 text-white transition-transform duration-300" />
        )}
      </button>
    </div>
  );
}
