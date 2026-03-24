"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Home,
  Wrench,
  AlertTriangle,
  Camera,
  Package,
  PartyPopper,
  X,
  ArrowRight,
} from "lucide-react";

interface NextStepsBannerProps {
  property: { id: string };
  roomCount: number;
  applianceCount: number;
  hasEmergencyInfo: boolean;
}

interface Suggestion {
  icon: React.ElementType;
  message: string;
  cta: string;
  href: string;
  celebration?: boolean;
}

function getSuggestion(
  propertyId: string,
  roomCount: number,
  applianceCount: number,
  hasEmergencyInfo: boolean,
): Suggestion {
  if (roomCount === 0) {
    return {
      icon: Home,
      message: "Add your first room to start documenting your home. Start with the kitchen or living room!",
      cta: "Add a room",
      href: `/property/${propertyId}?tab=rooms`,
    };
  }

  if (applianceCount === 0) {
    return {
      icon: Wrench,
      message: "Log your first appliance \u2014 start with your HVAC or water heater. It takes about a minute.",
      cta: "Add an appliance",
      href: `/property/${propertyId}?tab=appliances`,
    };
  }

  if (!hasEmergencyInfo) {
    return {
      icon: AlertTriangle,
      message: "Set up emergency procedures \u2014 know where your shutoffs are. It takes 2 minutes and could save you thousands.",
      cta: "Add emergency info",
      href: `/property/${propertyId}?tab=emergency`,
    };
  }

  if (roomCount > 0 && roomCount <= 3) {
    return {
      icon: Camera,
      message: "Add photos to your rooms \u2014 snap one next time you\u2019re home. Photos make everything easier to reference.",
      cta: "View rooms",
      href: `/property/${propertyId}?tab=rooms`,
    };
  }

  if (applianceCount > 0) {
    return {
      icon: Package,
      message: "Track your first filter or supply for replacement reminders. Never forget a filter change again.",
      cta: "Add a consumable",
      href: `/property/${propertyId}?tab=appliances`,
    };
  }

  return {
    icon: PartyPopper,
    message: "Amazing work! Your home is well-documented. Keep your info up to date as things change.",
    cta: "View overview",
    href: `/property/${propertyId}`,
    celebration: true,
  };
}

export function NextStepsBanner({
  property,
  roomCount,
  applianceCount,
  hasEmergencyInfo,
}: NextStepsBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  const storageKey = `threshold-banner-dismissed-${property.id}`;

  useEffect(() => {
    setMounted(true);
    try {
      if (sessionStorage.getItem(storageKey)) {
        setDismissed(true);
      }
    } catch {
      // sessionStorage not available
    }
  }, [storageKey]);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(storageKey, "1");
    } catch {
      // sessionStorage not available
    }
  };

  if (!mounted || dismissed) return null;

  const suggestion = getSuggestion(property.id, roomCount, applianceCount, hasEmergencyInfo);
  const Icon = suggestion.icon;

  return (
    <div
      className={`relative rounded-2xl p-5 border animate-fade-in ${
        suggestion.celebration
          ? "bg-gradient-to-r from-sage/5 to-sage/10 border-sage/20"
          : "bg-gradient-to-r from-linen to-[#FBF5EC] border-clay/15"
      }`}
    >
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 h-7 w-7 rounded-lg hover:bg-white/60 flex items-center justify-center text-stone/40 hover:text-stone transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <div className="flex items-start gap-4 pr-6">
        <div
          className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${
            suggestion.celebration ? "bg-sage/15" : "bg-ember/10"
          }`}
        >
          <Icon
            className={`h-5 w-5 ${suggestion.celebration ? "text-sage" : "text-ember"}`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm text-hearth leading-relaxed">{suggestion.message}</p>
          <div className="mt-3">
            <Link href={suggestion.href}>
              <Button
                size="sm"
                className={`h-8 px-4 text-xs font-medium rounded-lg ${
                  suggestion.celebration
                    ? "bg-sage hover:bg-sage/90 text-white"
                    : "bg-ember hover:bg-ember-dark text-white"
                }`}
              >
                {suggestion.cta}
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
