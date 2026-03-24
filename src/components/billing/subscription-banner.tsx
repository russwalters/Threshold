"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Sparkles,
  AlertTriangle,
  ArrowUpRight,
  CreditCard,
} from "lucide-react";
import type { PlanTier } from "@/lib/plans";

interface SubscriptionBannerProps {
  plan: PlanTier;
  status?: "active" | "past_due" | "canceled" | "trialing";
  renewalDate?: string;
}

const planLabels: Record<PlanTier, string> = {
  free: "Free",
  pro: "Pro",
  portfolio: "Portfolio",
};

const planColors: Record<PlanTier, string> = {
  free: "bg-stone/10 text-stone border-stone/20",
  pro: "bg-ember/10 text-ember border-ember/20",
  portfolio: "bg-brass/10 text-brass border-brass/20",
};

export function SubscriptionBanner({
  plan,
  status = "active",
  renewalDate,
}: SubscriptionBannerProps) {
  const [loading, setLoading] = useState(false);

  async function handleManage() {
    setLoading(true);
    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Portal error:", error);
    } finally {
      setLoading(false);
    }
  }

  const isPastDue = status === "past_due";

  return (
    <div
      className={`rounded-xl border p-4 ${
        isPastDue
          ? "bg-alert/5 border-alert/20"
          : "bg-white border-clay/20"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
              isPastDue
                ? "bg-alert/10"
                : plan === "free"
                ? "bg-stone/10"
                : plan === "pro"
                ? "bg-ember/10"
                : "bg-brass/10"
            }`}
          >
            {isPastDue ? (
              <AlertTriangle className="h-4 w-4 text-alert" />
            ) : (
              <CreditCard
                className={`h-4 w-4 ${
                  plan === "free"
                    ? "text-stone"
                    : plan === "pro"
                    ? "text-ember"
                    : "text-brass"
                }`}
              />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-hearth">
                {planLabels[plan]} Plan
              </span>
              <Badge
                variant="outline"
                className={`text-xs ${planColors[plan]}`}
              >
                {planLabels[plan]}
              </Badge>
            </div>
            {isPastDue ? (
              <p className="text-xs text-alert mt-0.5">
                Payment failed — please update your payment method
              </p>
            ) : renewalDate ? (
              <p className="text-xs text-stone mt-0.5">
                Renews {new Date(renewalDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            ) : plan === "free" ? (
              <p className="text-xs text-stone mt-0.5">
                Free forever — upgrade for more features
              </p>
            ) : null}
          </div>
        </div>

        <div className="shrink-0">
          {plan === "free" ? (
            <a href="/dashboard?tab=billing">
              <Button
                size="sm"
                className="bg-ember hover:bg-ember-dark text-white text-xs gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Upgrade
              </Button>
            </a>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="text-xs border-clay/30 hover:bg-linen-dark gap-1.5"
              onClick={handleManage}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ArrowUpRight className="h-3.5 w-3.5" />
              )}
              Manage
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
