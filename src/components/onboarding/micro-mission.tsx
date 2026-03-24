"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Clock } from "lucide-react";

interface MicroMissionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  estimatedTime: string;
  action: string;
  href: string;
  onDismiss?: () => void;
}

export function MicroMission({
  icon,
  title,
  description,
  estimatedTime,
  action,
  href,
  onDismiss,
}: MicroMissionProps) {
  return (
    <Card className="bg-white border-clay/20 hover:shadow-md transition-all duration-200 group relative overflow-hidden">
      {/* Subtle warm accent on left edge */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-ember/40 to-ember/10" />

      <CardContent className="p-5 pl-6">
        {/* Dismiss button */}
        {onDismiss && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDismiss();
            }}
            className="absolute top-3 right-3 h-7 w-7 rounded-lg hover:bg-linen-dark flex items-center justify-center text-stone/40 hover:text-stone transition-colors"
            aria-label="Dismiss suggestion"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="h-11 w-11 rounded-xl bg-ember/10 flex items-center justify-center shrink-0 group-hover:bg-ember/15 transition-colors">
            {icon}
          </div>

          <div className="flex-1 min-w-0 pr-6">
            {/* Title */}
            <h4 className="font-medium text-hearth text-sm leading-snug">{title}</h4>

            {/* Description */}
            <p className="text-xs text-stone mt-1 leading-relaxed">{description}</p>

            {/* Time estimate + CTA */}
            <div className="flex items-center gap-3 mt-3">
              <span className="inline-flex items-center gap-1 text-xs text-stone/60 bg-linen px-2 py-1 rounded-lg">
                <Clock className="h-3 w-3" />
                {estimatedTime}
              </span>
              <Link href={href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-3 text-xs font-medium text-ember hover:text-ember-dark hover:bg-ember/5"
                >
                  {action}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
