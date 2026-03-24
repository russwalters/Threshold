"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Loader2, Sparkles, Building2, Home } from "lucide-react";
import type { PlanTier } from "@/lib/plans";

interface PricingCardsProps {
  currentPlan: PlanTier;
}

const plans = [
  {
    tier: "free" as PlanTier,
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for a single home",
    icon: Home,
    features: [
      "1 property",
      "10 appliances",
      "Basic handbook",
      "Emergency info",
      "Community support",
    ],
  },
  {
    tier: "pro" as PlanTier,
    name: "Pro",
    price: "$9",
    period: "/month",
    description: "For landlords and serious homeowners",
    icon: Sparkles,
    popular: true,
    features: [
      "Up to 3 properties",
      "Unlimited appliances",
      "Custom branded handbooks",
      "Document vault",
      "Email support",
      "Maintenance scheduling",
      "QR codes for rooms",
    ],
  },
  {
    tier: "portfolio" as PlanTier,
    name: "Portfolio",
    price: "$29",
    period: "/month",
    description: "For property managers at scale",
    icon: Building2,
    features: [
      "Unlimited properties",
      "Unlimited appliances",
      "Custom branded handbooks",
      "Document vault",
      "Priority support",
      "Team access (coming soon)",
      "Analytics & reports (coming soon)",
    ],
  },
];

export function PricingCards({ currentPlan }: PricingCardsProps) {
  const [loadingTier, setLoadingTier] = useState<PlanTier | null>(null);

  async function handleUpgrade(tier: PlanTier) {
    setLoadingTier(tier);
    try {
      const priceIdMap: Record<string, string> = {
        pro: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID!,
        portfolio: process.env.NEXT_PUBLIC_STRIPE_PORTFOLIO_PRICE_ID!,
      };

      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: priceIdMap[tier] }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Checkout error:", data.error);
      }
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setLoadingTier(null);
    }
  }

  async function handleManage() {
    setLoadingTier(currentPlan);
    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Portal error:", data.error);
      }
    } catch (error) {
      console.error("Portal error:", error);
    } finally {
      setLoadingTier(null);
    }
  }

  return (
    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
      {plans.map((plan) => {
        const isCurrentPlan = currentPlan === plan.tier;
        const isLoading = loadingTier === plan.tier;

        return (
          <Card
            key={plan.tier}
            className={`relative bg-white border-clay/20 transition-all duration-300 ${
              plan.popular
                ? "border-ember shadow-xl shadow-ember/10 scale-105"
                : "hover:shadow-lg hover:shadow-hearth/5"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-ember text-white border-0 shadow-lg shadow-ember/25">
                  Most Popular
                </Badge>
              </div>
            )}
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-1">
                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                    plan.popular
                      ? "bg-ember/10"
                      : plan.tier === "portfolio"
                      ? "bg-brass/10"
                      : "bg-sage/10"
                  }`}
                >
                  <plan.icon
                    className={`h-5 w-5 ${
                      plan.popular
                        ? "text-ember"
                        : plan.tier === "portfolio"
                        ? "text-brass"
                        : "text-sage"
                    }`}
                  />
                </div>
                <h3 className="font-heading text-xl font-semibold text-hearth">
                  {plan.name}
                </h3>
              </div>
              <p className="text-sm text-stone mb-4">{plan.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-heading font-bold text-hearth">
                  {plan.price}
                </span>
                <span className="text-stone text-sm">{plan.period}</span>
              </div>

              {plan.tier === "free" ? (
                <Button
                  className="w-full bg-hearth/10 text-hearth hover:bg-hearth/15 cursor-default"
                  disabled
                >
                  {isCurrentPlan ? "Current Plan" : "Free Forever"}
                </Button>
              ) : isCurrentPlan ? (
                <Button
                  className="w-full bg-hearth hover:bg-hearth/90 text-white"
                  onClick={handleManage}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Manage Subscription
                </Button>
              ) : (
                <Button
                  className={`w-full ${
                    plan.popular
                      ? "bg-ember hover:bg-ember-dark text-white shadow-lg shadow-ember/25"
                      : "bg-hearth hover:bg-hearth/90 text-white"
                  }`}
                  onClick={() => handleUpgrade(plan.tier)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Upgrade to {plan.name}
                </Button>
              )}

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm text-stone"
                  >
                    <CheckCircle2 className="h-4 w-4 text-sage shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
