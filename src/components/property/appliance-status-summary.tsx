'use client';

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2, AlertTriangle, XCircle, Shield, Clock,
} from 'lucide-react';
import type { Appliance } from '@/types/database';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ApplianceStatusSummaryProps {
  appliances: Appliance[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getWarrantyExpiringSoon(appliances: Appliance[]): number {
  const now = new Date();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  return appliances.filter((a) => {
    if (!a.warranty_expiration) return false;
    const exp = new Date(a.warranty_expiration);
    return exp > now && exp.getTime() - now.getTime() < thirtyDays;
  }).length;
}

// ---------------------------------------------------------------------------
// Donut chart (pure SVG)
// ---------------------------------------------------------------------------

function StatusDonut({
  good,
  attention,
  replace,
  total,
}: {
  good: number;
  attention: number;
  replace: number;
  total: number;
}) {
  if (total === 0) {
    return (
      <div className="h-28 w-28 rounded-full border-[10px] border-clay/15 flex items-center justify-center">
        <span className="text-xs text-stone">No data</span>
      </div>
    );
  }

  const size = 112;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const goodPct = good / total;
  const attentionPct = attention / total;
  const replacePct = replace / total;

  const goodLen = goodPct * circumference;
  const attentionLen = attentionPct * circumference;
  const replaceLen = replacePct * circumference;

  const goodOffset = 0;
  const attentionOffset = goodLen;
  const replaceOffset = goodLen + attentionLen;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-clay/10"
        />
        {/* Good */}
        {good > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#7A9E7E"
            strokeWidth={strokeWidth}
            strokeDasharray={`${goodLen} ${circumference - goodLen}`}
            strokeDashoffset={-goodOffset}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        )}
        {/* Attention */}
        {attention > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#E5A911"
            strokeWidth={strokeWidth}
            strokeDasharray={`${attentionLen} ${circumference - attentionLen}`}
            strokeDashoffset={-attentionOffset}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        )}
        {/* Replace */}
        {replace > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#D64545"
            strokeWidth={strokeWidth}
            strokeDasharray={`${replaceLen} ${circumference - replaceLen}`}
            strokeDashoffset={-replaceOffset}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-heading font-bold text-hearth">{total}</span>
        <span className="text-[10px] text-stone leading-none">total</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ApplianceStatusSummary({ appliances }: ApplianceStatusSummaryProps) {
  const counts = useMemo(() => {
    const c = { good: 0, needs_attention: 0, replace_soon: 0 };
    appliances.forEach((a) => { c[a.status]++; });
    return c;
  }, [appliances]);

  const warrantyExpiring = useMemo(() => getWarrantyExpiringSoon(appliances), [appliances]);

  const total = appliances.length;
  const needsAction = counts.needs_attention + counts.replace_soon;

  if (total === 0) {
    return null;
  }

  return (
    <Card className="bg-white border-clay/20">
      <CardContent className="p-5">
        <h3 className="font-heading font-semibold text-hearth mb-4">Appliance Health</h3>

        <div className="flex items-center gap-6">
          {/* Donut */}
          <StatusDonut
            good={counts.good}
            attention={counts.needs_attention}
            replace={counts.replace_soon}
            total={total}
          />

          {/* Breakdown */}
          <div className="flex-1 space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-sage" />
              <span className="text-sm text-hearth flex-1">Good</span>
              <span className="text-sm font-medium text-hearth">{counts.good}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-caution" />
              <span className="text-sm text-hearth flex-1">Needs Attention</span>
              <span className="text-sm font-medium text-hearth">{counts.needs_attention}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-alert" />
              <span className="text-sm text-hearth flex-1">Replace Soon</span>
              <span className="text-sm font-medium text-hearth">{counts.replace_soon}</span>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="mt-4 space-y-2">
          {needsAction > 0 && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-caution/10">
              <AlertTriangle className="h-4 w-4 text-caution shrink-0" />
              <span className="text-xs text-caution font-medium">
                {needsAction} appliance{needsAction > 1 ? 's' : ''} need{needsAction === 1 ? 's' : ''} attention
              </span>
            </div>
          )}
          {warrantyExpiring > 0 && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-ember/10">
              <Clock className="h-4 w-4 text-ember shrink-0" />
              <span className="text-xs text-ember font-medium">
                {warrantyExpiring} warrant{warrantyExpiring > 1 ? 'ies' : 'y'} expiring within 30 days
              </span>
            </div>
          )}
          {needsAction === 0 && warrantyExpiring === 0 && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-sage/10">
              <CheckCircle2 className="h-4 w-4 text-sage shrink-0" />
              <span className="text-xs text-sage font-medium">
                All appliances in good shape
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
