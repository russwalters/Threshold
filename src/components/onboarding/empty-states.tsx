"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Home,
  Refrigerator,
  FileText,
  Wrench,
  Package,
  AlertTriangle,
  Plus,
  Clock,
} from "lucide-react";

interface EmptyStateProps {
  propertyId: string;
}

function EmptyStateShell({
  icon: Icon,
  iconColor,
  iconBg,
  headline,
  body,
  ctaLabel,
  ctaHref,
  timeEstimate,
}: {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  headline: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  timeEstimate: string;
}) {
  return (
    <div className="text-center py-16 px-4 max-w-md mx-auto animate-fade-in">
      {/* Icon */}
      <div
        className={`h-20 w-20 rounded-3xl ${iconBg} flex items-center justify-center mx-auto mb-6`}
      >
        <Icon className={`h-10 w-10 ${iconColor}`} />
      </div>

      {/* Headline */}
      <h3 className="font-heading text-xl font-semibold text-hearth mb-3">
        {headline}
      </h3>

      {/* Body text */}
      <p className="text-stone text-sm leading-relaxed mb-6">
        {body}
      </p>

      {/* CTA */}
      <Link href={ctaHref}>
        <Button className="bg-ember hover:bg-ember-dark text-white rounded-xl px-6">
          <Plus className="h-4 w-4 mr-2" />
          {ctaLabel}
        </Button>
      </Link>

      {/* Time estimate */}
      <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-stone/50">
        <Clock className="h-3 w-3" />
        <span>{timeEstimate}</span>
      </div>
    </div>
  );
}

export function EmptyRooms({ propertyId }: EmptyStateProps) {
  return (
    <EmptyStateShell
      icon={Home}
      iconColor="text-sage"
      iconBg="bg-sage/10"
      headline="No rooms yet"
      body="Rooms are the backbone of your home's documentation. Start with the ones you use most — kitchen, living room, bedrooms. You can always add more later."
      ctaLabel="Add your first room"
      ctaHref={`/property/${propertyId}?tab=rooms&action=add`}
      timeEstimate="Takes about 30 seconds per room"
    />
  );
}

export function EmptyAppliances({ propertyId }: EmptyStateProps) {
  return (
    <EmptyStateShell
      icon={Refrigerator}
      iconColor="text-ember"
      iconBg="bg-ember/10"
      headline="No appliances yet"
      body="Start with the big ones — your fridge, HVAC, and water heater. Add more whenever you discover a model number or warranty card. Every detail helps."
      ctaLabel="Add your first appliance"
      ctaHref={`/property/${propertyId}?tab=appliances&action=add`}
      timeEstimate="Takes about 1 minute per appliance"
    />
  );
}

export function EmptyDocuments({ propertyId }: EmptyStateProps) {
  return (
    <EmptyStateShell
      icon={FileText}
      iconColor="text-slate-brand"
      iconBg="bg-slate-brand/10"
      headline="No documents yet"
      body="Upload warranties, manuals, receipts, and inspection reports. Next time you need to find a warranty or recall a repair, it'll all be here."
      ctaLabel="Upload a document"
      ctaHref={`/property/${propertyId}?tab=documents&action=upload`}
      timeEstimate="Takes about 30 seconds to upload"
    />
  );
}

export function EmptyMaintenance({ propertyId }: EmptyStateProps) {
  return (
    <EmptyStateShell
      icon={Wrench}
      iconColor="text-caution"
      iconBg="bg-caution/10"
      headline="No maintenance logged yet"
      body="Track repairs, scheduled services, and upcoming tasks. When you call a plumber or change a filter, log it here so you always have a record."
      ctaLabel="Log your first maintenance"
      ctaHref={`/property/${propertyId}?tab=maintenance&action=add`}
      timeEstimate="Takes about 1 minute to log"
    />
  );
}

export function EmptyConsumables({ propertyId }: EmptyStateProps) {
  return (
    <EmptyStateShell
      icon={Package}
      iconColor="text-clay"
      iconBg="bg-clay/10"
      headline="No consumables tracked yet"
      body="Filters, batteries, light bulbs — things you replace regularly. Track them here and never scramble to find the right size again."
      ctaLabel="Track your first consumable"
      ctaHref={`/property/${propertyId}?tab=appliances&action=add-consumable`}
      timeEstimate="Takes about 30 seconds each"
    />
  );
}

export function EmptyEmergency({ propertyId }: EmptyStateProps) {
  return (
    <EmptyStateShell
      icon={AlertTriangle}
      iconColor="text-alert"
      iconBg="bg-alert/10"
      headline="No emergency info yet"
      body="Where are your water shutoffs? Electrical panel? Gas valve? Document these now so everyone in your household knows what to do in an emergency."
      ctaLabel="Add emergency info"
      ctaHref={`/property/${propertyId}?tab=emergency&action=edit`}
      timeEstimate="Takes about 2 minutes"
    />
  );
}
