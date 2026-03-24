"use client";

import Link from "next/link";
import {
  Home,
  Refrigerator,
  AlertTriangle,
  Zap,
  Package,
  BookOpen,
  CheckCircle2,
  Circle,
  Info,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ProgressTrackerProps {
  property: { id: string };
  roomCount: number;
  applianceCount: number;
  hasEmergencyInfo: boolean;
  hasHandbook: boolean;
  consumableCount: number;
  hasBreakerPanel: boolean;
  compact?: boolean;
}

interface ChecklistItem {
  label: string;
  done: boolean;
  href: string;
  icon: React.ElementType;
}

function getEncouragingCopy(percent: number): string {
  if (percent >= 100) return "Your home is fully documented!";
  if (percent >= 75) return "Almost there \u2014 you're a documentation pro!";
  if (percent >= 50) return "Your home manual is really taking shape!";
  if (percent >= 25) return "You're building a solid foundation.";
  return "Great start! Add details whenever you discover them.";
}

function ProgressRing({ percent, size = 120 }: { percent: number; size?: number }) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  const color =
    percent >= 100
      ? "var(--color-sage)"
      : percent >= 50
        ? "var(--color-ember)"
        : "var(--color-clay)";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-linen-dark)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-heading font-bold text-hearth">{percent}%</span>
        <span className="text-[10px] text-stone">documented</span>
      </div>
    </div>
  );
}

export function ProgressTracker({
  property,
  roomCount,
  applianceCount,
  hasEmergencyInfo,
  hasHandbook,
  consumableCount,
  hasBreakerPanel,
  compact = false,
}: ProgressTrackerProps) {
  const propertyId = property.id;

  const checklist: ChecklistItem[] = [
    { label: "Basic info", done: true, href: `/property/${propertyId}`, icon: Info },
    { label: "Rooms documented", done: roomCount > 0, href: `/property/${propertyId}?tab=rooms`, icon: Home },
    { label: "Appliances logged", done: applianceCount > 0, href: `/property/${propertyId}?tab=appliances`, icon: Refrigerator },
    { label: "Emergency info", done: hasEmergencyInfo, href: `/property/${propertyId}?tab=emergency`, icon: AlertTriangle },
    { label: "Breaker panel mapped", done: hasBreakerPanel, href: `/property/${propertyId}?tab=emergency`, icon: Zap },
    { label: "Consumables tracked", done: consumableCount > 0, href: `/property/${propertyId}?tab=appliances`, icon: Package },
    { label: "Handbook ready", done: hasHandbook, href: `/property/${propertyId}?tab=handbook`, icon: BookOpen },
  ];

  const completedCount = checklist.filter((item) => item.done).length;
  const percent = Math.round((completedCount / checklist.length) * 100);

  if (compact) {
    return (
      <Card className="bg-white border-clay/20">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <ProgressRing percent={percent} size={64} />
            <div className="flex-1 min-w-0">
              <h3 className="font-heading font-semibold text-hearth text-sm">
                Home Documentation
              </h3>
              <p className="text-xs text-stone mt-0.5">{getEncouragingCopy(percent)}</p>
              <div className="text-xs text-stone/60 mt-1">
                {completedCount} of {checklist.length} areas complete
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-clay/20">
      <CardContent className="p-6">
        <div className="flex flex-col items-center mb-6">
          <ProgressRing percent={percent} />
          <p className="text-sm text-stone mt-4 text-center max-w-xs">
            {getEncouragingCopy(percent)}
          </p>
        </div>

        <div className="space-y-1">
          {checklist.map((item) => {
            const Icon = item.done ? CheckCircle2 : Circle;
            const content = (
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  item.done
                    ? "text-hearth"
                    : "text-stone hover:bg-linen hover:text-hearth cursor-pointer"
                }`}
              >
                <Icon
                  className={`h-4.5 w-4.5 shrink-0 ${
                    item.done ? "text-sage" : "text-clay/40"
                  }`}
                />
                <item.icon
                  className={`h-4 w-4 shrink-0 ${
                    item.done ? "text-stone/50" : "text-stone/30"
                  }`}
                />
                <span className={`text-sm ${item.done ? "line-through text-stone/50" : "font-medium"}`}>
                  {item.label}
                </span>
                {!item.done && (
                  <span className="ml-auto text-xs text-ember opacity-0 group-hover:opacity-100 transition-opacity">
                    Add
                  </span>
                )}
              </div>
            );

            if (item.done) {
              return <div key={item.label}>{content}</div>;
            }

            return (
              <Link key={item.label} href={item.href} className="block group">
                {content}
              </Link>
            );
          })}
        </div>

        <div className="mt-5 pt-4 border-t border-border">
          <p className="text-xs text-stone/50 text-center">
            {completedCount} of {checklist.length} areas documented
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
