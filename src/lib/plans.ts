export const PLAN_LIMITS = {
  free: { maxProperties: 1, maxAppliances: 10, customHandbook: false, documentVault: false },
  pro: { maxProperties: 3, maxAppliances: Infinity, customHandbook: true, documentVault: true },
  portfolio: { maxProperties: Infinity, maxAppliances: Infinity, customHandbook: true, documentVault: true },
} as const;

export type PlanTier = "free" | "pro" | "portfolio";

export function canAddProperty(tier: PlanTier, currentCount: number): boolean {
  return currentCount < PLAN_LIMITS[tier].maxProperties;
}

export function canAddAppliance(tier: PlanTier, currentCount: number): boolean {
  return currentCount < PLAN_LIMITS[tier].maxAppliances;
}

export function hasFeature(
  tier: PlanTier,
  feature: "customHandbook" | "documentVault"
): boolean {
  return PLAN_LIMITS[tier][feature];
}
