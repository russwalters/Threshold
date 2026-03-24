"use client";

import { cn } from "@/lib/utils";
import { Home, ImageIcon, Refrigerator, BedDouble, Bath, UtensilsCrossed, Car, WashingMachine, Sofa } from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  house: Home,
  kitchen: UtensilsCrossed,
  bedroom: BedDouble,
  bathroom: Bath,
  garage: Car,
  laundry: WashingMachine,
  living: Sofa,
  default: ImageIcon,
  appliance: Refrigerator,
};

interface PlaceholderImageProps {
  type?: string;
  seed?: string;
  className?: string;
  label?: string;
}

// Generate a deterministic warm color from a seed string
function seedColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hues = [15, 25, 30, 35, 200, 160, 340]; // warm hues
  const hue = hues[Math.abs(hash) % hues.length];
  return `hsl(${hue}, ${25 + (Math.abs(hash) % 20)}%, ${88 + (Math.abs(hash) % 8)}%)`;
}

export function PlaceholderImage({ type = "default", seed = "img", className, label }: PlaceholderImageProps) {
  const Icon = iconMap[type] || iconMap.default;
  const bgColor = seedColor(seed);

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-xl",
        className
      )}
      style={{ backgroundColor: bgColor }}
    >
      <div className="flex flex-col items-center gap-2 text-stone/60">
        <Icon className="h-10 w-10" />
        {label && <span className="text-xs font-medium">{label}</span>}
      </div>
    </div>
  );
}
