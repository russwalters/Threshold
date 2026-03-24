'use client'

import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QRCode } from "@/components/shared/qr-code";
import {
  Home, MapPin, Wifi, Car, Trash2, Phone,
  AlertTriangle, Droplets, Zap, Flame, CloudRain,
  Shield, Lightbulb, Coffee, ShoppingBag,
  UtensilsCrossed, TreePine, Dumbbell, Cross, Wrench as WrenchIcon,
  Star, ChevronDown, ChevronUp, Heart,
  Copy, Check, Eye, EyeOff, Search,
  Paintbrush, ClipboardList, Users, BookOpen,
  Compass, ScrollText, ChevronRight,
} from "lucide-react";
import type { Json } from "@/types/database";

// ---------- helper types for the JSON blobs ----------

interface PaintColor {
  name: string;
  hex: string;
}

interface LightBulb {
  location: string;
  type: string;
  base: string;
}

interface EmergencyContact {
  name: string;
  role: string;
  phone: string;
  available?: string;
}

interface EmergencyProcedure {
  title: string;
  icon: string;
  steps: string[];
}

interface LocalRecommendation {
  name: string;
  category: string;
  description: string;
  distance: string;
}

interface UtilityEntry {
  type: string;
  provider: string;
  accountNote?: string;
  phone: string;
}

interface WifiInfo {
  network: string;
  password: string;
}

interface FireExtinguisher {
  location: string;
  type?: string;
}

// ---------- icon maps ----------

const emergencyIcons: Record<string, React.ElementType> = {
  droplets: Droplets,
  zap: Zap,
  flame: Flame,
  "cloud-rain": CloudRain,
};

const categoryIcons: Record<string, React.ElementType> = {
  Grocery: ShoppingBag,
  Coffee: Coffee,
  Restaurant: UtensilsCrossed,
  Beach: Star,
  Park: TreePine,
  Gym: Dumbbell,
  "Urgent Care": Cross,
  Hardware: WrenchIcon,
};

const categoryEmojis: Record<string, string> = {
  Restaurant: "\uD83C\uDF7D\uFE0F",
  Grocery: "\uD83D\uDED2",
  Beach: "\uD83C\uDFD6\uFE0F",
  Park: "\uD83C\uDF33",
  Coffee: "\u2615",
  Gym: "\uD83C\uDFCB\uFE0F",
  "Urgent Care": "\uD83C\uDFE5",
  Hardware: "\uD83D\uDD27",
};

// ---------- props ----------

export interface HandbookContentProps {
  property: {
    name: string;
    address_line1: string;
    address_line2?: string | null;
    city: string;
    state: string;
    zip: string;
    photo_url?: string | null;
    beds?: number | null;
    baths?: number | null;
    sqft?: number | null;
  };
  rooms: Array<{
    id: string;
    name: string;
    type: string | null;
    photo_url: string | null;
    paint_colors: Json;
    fixtures: Json;
    features: string[] | null;
    light_bulbs: Json;
    notes: string | null;
  }>;
  appliances: Array<{
    id: string;
    name: string;
    brand: string | null;
    model: string | null;
    location: string | null;
    room_id: string | null;
    status: string;
    operating_tips: string[] | null;
  }>;
  emergencyInfo: {
    water_shutoff: Json | null;
    electric_shutoff: Json | null;
    gas_shutoff: Json | null;
    fire_extinguishers: Json | null;
    emergency_contacts: Json;
    emergency_procedures: Json;
  } | null;
  handbookConfig: {
    welcome_message: string | null;
    wifi: Json | null;
    parking: string | null;
    trash: string | null;
    house_rules: string[] | null;
    local_recommendations: Json;
    utility_info: Json;
    share_id: string | null;
  };
  handbookUrl: string;
}

// ---------- small helpers ----------

function asString(val: Json | null | undefined): string {
  if (typeof val === "string") return val;
  if (val && typeof val === "object" && !Array.isArray(val)) {
    const obj = val as Record<string, Json | undefined>;
    const parts: string[] = [];
    if (obj.location) parts.push(String(obj.location));
    if (obj.description) parts.push(String(obj.description));
    return parts.join(" - ") || JSON.stringify(val);
  }
  return val != null ? String(val) : "";
}

function asPaintColors(val: Json): PaintColor[] {
  if (!Array.isArray(val)) return [];
  return val as unknown as PaintColor[];
}

function asLightBulbs(val: Json): LightBulb[] {
  if (!Array.isArray(val)) return [];
  return val as unknown as LightBulb[];
}

function asEmergencyContacts(val: Json): EmergencyContact[] {
  if (!Array.isArray(val)) return [];
  return val as unknown as EmergencyContact[];
}

function asEmergencyProcedures(val: Json): EmergencyProcedure[] {
  if (!Array.isArray(val)) return [];
  return val as unknown as EmergencyProcedure[];
}

function asLocalRecommendations(val: Json): LocalRecommendation[] {
  if (!Array.isArray(val)) return [];
  return val as unknown as LocalRecommendation[];
}

function asUtilityInfo(val: Json): UtilityEntry[] {
  if (!Array.isArray(val)) return [];
  return val as unknown as UtilityEntry[];
}

function asWifi(val: Json | null): WifiInfo | null {
  if (!val || typeof val !== "object" || Array.isArray(val)) return null;
  const obj = val as Record<string, Json | undefined>;
  if (obj.network || obj.password) {
    return { network: String(obj.network ?? ""), password: String(obj.password ?? "") };
  }
  return null;
}

function asFireExtinguishers(val: Json | null): FireExtinguisher[] {
  if (!val || !Array.isArray(val)) return [];
  return val as unknown as FireExtinguisher[];
}

function asFixtures(val: Json): string[] {
  if (!Array.isArray(val)) return [];
  return val.map((v) => String(v));
}

// Derive unique room locations from appliances for filtering
function deriveApplianceLocations(
  appliances: HandbookContentProps["appliances"],
  rooms: HandbookContentProps["rooms"]
): string[] {
  const locations = new Set<string>();
  appliances.forEach((a) => {
    if (a.room_id) {
      const room = rooms.find((r) => r.id === a.room_id);
      if (room) locations.add(room.name);
    } else if (a.location) {
      locations.add(a.location);
    }
  });
  return Array.from(locations).sort();
}

// ---------- sub-components ----------

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 rounded-lg bg-white/20 hover:bg-white/30 px-2 py-1 text-xs font-medium transition-all active:scale-95"
      aria-label="Copy to clipboard"
    >
      {copied ? (
        <>
          <Check className="h-3 w-3" /> Copied
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" /> Copy
        </>
      )}
    </button>
  );
}

function ExpandableCard({
  title,
  icon: Icon,
  iconColor = "text-ember",
  children,
  defaultOpen = false,
  accentBorder = false,
}: {
  title: string;
  icon: React.ElementType;
  iconColor?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  accentBorder?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Card className={`bg-white border-clay/20 overflow-hidden transition-shadow hover:shadow-md ${accentBorder ? "border-l-4 border-l-alert" : ""}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 sm:p-5 text-left"
      >
        <div className="flex items-center gap-3">
          <div className={`h-9 w-9 rounded-xl bg-linen flex items-center justify-center shrink-0`}>
            <Icon className={`h-4.5 w-4.5 ${iconColor}`} />
          </div>
          <span className="font-heading font-semibold text-hearth text-sm sm:text-base">{title}</span>
        </div>
        <div className="text-stone">
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>
      {open && (
        <div className="px-4 sm:px-5 pb-4 sm:pb-5 animate-fade-in">
          {children}
        </div>
      )}
    </Card>
  );
}

// ---------- section navigation ----------

interface NavSection {
  id: string;
  label: string;
  icon: React.ElementType;
}

// ---------- main component ----------

export function HandbookContent({
  property,
  rooms,
  appliances,
  emergencyInfo,
  handbookConfig,
  handbookUrl,
}: HandbookContentProps) {
  const wifi = asWifi(handbookConfig.wifi);
  const localRecs = asLocalRecommendations(handbookConfig.local_recommendations);
  const utilityInfo = asUtilityInfo(handbookConfig.utility_info);
  const houseRules = handbookConfig.house_rules ?? [];
  const emergencyContacts = emergencyInfo ? asEmergencyContacts(emergencyInfo.emergency_contacts) : [];
  const emergencyProcedures = emergencyInfo ? asEmergencyProcedures(emergencyInfo.emergency_procedures) : [];
  const fireExtinguishers = emergencyInfo ? asFireExtinguishers(emergencyInfo.fire_extinguishers) : [];

  // State
  const [activeSection, setActiveSection] = useState("essentials");
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null); // null = "All Rooms"
  const [welcomeExpanded, setWelcomeExpanded] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [applianceSearch, setApplianceSearch] = useState("");
  const [applianceFilter, setApplianceFilter] = useState("All");
  const [expandedAppliances, setExpandedAppliances] = useState<Set<string>>(new Set());
  const [expandedProcedures, setExpandedProcedures] = useState<Set<number>>(new Set());

  // Refs for sections
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const navRef = useRef<HTMLDivElement>(null);

  // Build nav sections dynamically
  const navSections: NavSection[] = [];
  navSections.push({ id: "essentials", label: "Essentials", icon: ClipboardList });
  if (rooms.length > 0) navSections.push({ id: "rooms", label: "Rooms", icon: Home });
  if (appliances.length > 0) navSections.push({ id: "appliances", label: "Appliances", icon: WrenchIcon });
  if (emergencyInfo) navSections.push({ id: "emergency", label: "Emergency", icon: AlertTriangle });
  if (localRecs.length > 0) navSections.push({ id: "getting-around", label: "Getting Around", icon: Compass });
  if (houseRules.length > 0) navSections.push({ id: "house-rules", label: "House Rules", icon: ScrollText });

  // Scroll to section
  const scrollToSection = useCallback((id: string) => {
    setActiveSection(id);
    const el = sectionRefs.current[id];
    if (el) {
      const offset = 80; // account for sticky nav
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }, []);

  // Intersection observer for active section tracking
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    navSections.forEach(({ id }) => {
      const el = sectionRefs.current[id];
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id);
          }
        },
        { rootMargin: "-100px 0px -60% 0px", threshold: 0 }
      );
      observer.observe(el);
      observers.push(observer);
    });
    return () => observers.forEach((o) => o.disconnect());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navSections.length]);

  // Toggle appliance expansion
  const toggleAppliance = useCallback((id: string) => {
    setExpandedAppliances((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Toggle procedure expansion
  const toggleProcedure = useCallback((idx: number) => {
    setExpandedProcedures((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }, []);

  // Compute all paint colors across rooms
  const allPaintColors = rooms.flatMap((room) =>
    asPaintColors(room.paint_colors).map((color) => ({ ...color, roomName: room.name }))
  );

  // Appliance filtering
  const applianceLocations = deriveApplianceLocations(appliances, rooms);
  const filteredAppliances = appliances.filter((a) => {
    const matchesSearch =
      !applianceSearch ||
      a.name.toLowerCase().includes(applianceSearch.toLowerCase()) ||
      (a.brand && a.brand.toLowerCase().includes(applianceSearch.toLowerCase())) ||
      (a.model && a.model.toLowerCase().includes(applianceSearch.toLowerCase()));
    const matchesFilter = applianceFilter === "All" || (() => {
      if (a.room_id) {
        const room = rooms.find((r) => r.id === a.room_id);
        return room?.name === applianceFilter;
      }
      return a.location === applianceFilter;
    })();
    return matchesSearch && matchesFilter;
  });

  // Group local recommendations by category
  const recsByCategory = localRecs.reduce<Record<string, LocalRecommendation[]>>((acc, rec) => {
    if (!acc[rec.category]) acc[rec.category] = [];
    acc[rec.category].push(rec);
    return acc;
  }, {});

  // Selected room data
  const selectedRoomData = selectedRoom ? rooms.find((r) => r.id === selectedRoom) : null;

  // Primary contact for Quick Reference
  const primaryContact = emergencyContacts[0] ?? null;

  return (
    <div className="min-h-screen bg-linen">
      {/* ========== 1. HERO SECTION ========== */}
      <header className="relative bg-hearth text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-ember rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-clay rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />
        </div>
        {property.photo_url && (
          <div className="absolute inset-0">
            <img
              src={property.photo_url}
              alt={property.name}
              className="w-full h-full object-cover opacity-20"
            />
          </div>
        )}
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
          <div className="font-heading text-xs font-medium text-clay-light tracking-widest uppercase mb-4">
            Welcome to Your New Home
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold mb-3 leading-tight">
            {property.address_line1}
          </h1>
          <p className="text-clay-light text-base flex items-center justify-center gap-2">
            <MapPin className="h-4 w-4" />
            {property.city}, {property.state} {property.zip}
          </p>
          {(property.beds || property.baths || property.sqft) && (
            <div className="mt-4 flex items-center justify-center gap-3 text-sm text-clay-light">
              {property.beds && <span>{property.beds} Bed</span>}
              {property.beds && property.baths && <span className="text-white/30">&middot;</span>}
              {property.baths && <span>{property.baths} Bath</span>}
              {(property.beds || property.baths) && property.sqft && <span className="text-white/30">&middot;</span>}
              {property.sqft && <span>{property.sqft.toLocaleString()} sqft</span>}
            </div>
          )}

          {/* Compact welcome message */}
          {handbookConfig.welcome_message && (
            <div className="mt-6 max-w-xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 text-sm text-white/90">
                {welcomeExpanded || handbookConfig.welcome_message.length <= 120 ? (
                  <p>{handbookConfig.welcome_message}</p>
                ) : (
                  <p>
                    {handbookConfig.welcome_message.slice(0, 120)}...
                    <button
                      onClick={() => setWelcomeExpanded(true)}
                      className="ml-1 text-ember-light hover:text-ember font-medium underline underline-offset-2"
                    >
                      read more
                    </button>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ========== 2. QUICK REFERENCE BAR ========== */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-6 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* WiFi */}
          {wifi && (
            <Card className="bg-white border-clay/20 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-slate-brand/10 flex items-center justify-center">
                    <Wifi className="h-4 w-4 text-slate-brand" />
                  </div>
                  <span className="text-xs font-semibold text-hearth uppercase tracking-wide">WiFi</span>
                </div>
                <p className="text-sm font-mono font-semibold text-hearth truncate">{wifi.network}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <p className="text-xs font-mono text-stone truncate flex-1">
                    {passwordVisible ? wifi.password : "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
                  </p>
                  <button
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className="text-stone hover:text-hearth transition-colors shrink-0"
                    aria-label={passwordVisible ? "Hide password" : "Show password"}
                  >
                    {passwordVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </button>
                </div>
                <div className="mt-2">
                  <CopyButton text={wifi.password} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Parking */}
          {handbookConfig.parking && (
            <Card className="bg-white border-clay/20 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-sage/10 flex items-center justify-center">
                    <Car className="h-4 w-4 text-sage" />
                  </div>
                  <span className="text-xs font-semibold text-hearth uppercase tracking-wide">Parking</span>
                </div>
                <p className="text-xs text-stone leading-relaxed line-clamp-3">{handbookConfig.parking}</p>
              </CardContent>
            </Card>
          )}

          {/* Trash */}
          {handbookConfig.trash && (
            <Card className="bg-white border-clay/20 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-sage/10 flex items-center justify-center">
                    <Trash2 className="h-4 w-4 text-sage" />
                  </div>
                  <span className="text-xs font-semibold text-hearth uppercase tracking-wide">Trash</span>
                </div>
                <p className="text-xs text-stone leading-relaxed line-clamp-3">{handbookConfig.trash}</p>
              </CardContent>
            </Card>
          )}

          {/* Emergency Contact */}
          {primaryContact && (
            <Card className="bg-white border-clay/20 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-alert/10 flex items-center justify-center">
                    <Phone className="h-4 w-4 text-alert" />
                  </div>
                  <span className="text-xs font-semibold text-hearth uppercase tracking-wide">Emergency</span>
                </div>
                <p className="text-sm font-semibold text-hearth">{primaryContact.name}</p>
                <a
                  href={`tel:${primaryContact.phone}`}
                  className="inline-flex items-center gap-1 mt-1 text-xs font-semibold text-ember hover:text-ember-dark transition-colors"
                >
                  <Phone className="h-3 w-3" /> {primaryContact.phone}
                </a>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* ========== 3. SECTION NAVIGATION (sticky pills) ========== */}
      <div
        ref={navRef}
        className="sticky top-0 z-20 bg-linen/95 backdrop-blur-sm border-b border-clay/10 mt-8"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1.5 overflow-x-auto py-3 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
            {navSections.map(({ id, label, icon: NavIcon }) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                  activeSection === id
                    ? "bg-hearth text-white shadow-md"
                    : "bg-white text-stone hover:text-hearth hover:bg-white/80 border border-clay/20"
                }`}
              >
                <NavIcon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ========== CONTENT AREA ========== */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-12">

        {/* ========== 4. ESSENTIALS SECTION ========== */}
        <section
          id="essentials"
          ref={(el) => { sectionRefs.current["essentials"] = el; }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-ember/10 flex items-center justify-center">
              <ClipboardList className="h-5 w-5 text-ember" />
            </div>
            <h2 className="font-heading text-2xl font-semibold text-hearth">Essentials</h2>
          </div>

          <div className="space-y-6">
            {/* Utilities */}
            {utilityInfo.length > 0 && (
              <div>
                <h3 className="font-heading text-lg font-semibold text-hearth mb-3 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-caution" />
                  Utilities
                </h3>
                <div className="space-y-2">
                  {utilityInfo.map((util, i) => (
                    <ExpandableCard
                      key={i}
                      title={util.type}
                      icon={
                        util.type.toLowerCase().includes("electric") ? Zap :
                        util.type.toLowerCase().includes("water") ? Droplets :
                        util.type.toLowerCase().includes("gas") ? Flame :
                        util.type.toLowerCase().includes("internet") ? Wifi :
                        util.type.toLowerCase().includes("trash") ? Trash2 :
                        Star
                      }
                      iconColor={
                        util.type.toLowerCase().includes("electric") ? "text-caution" :
                        util.type.toLowerCase().includes("water") ? "text-slate-brand" :
                        util.type.toLowerCase().includes("gas") ? "text-alert" :
                        util.type.toLowerCase().includes("internet") ? "text-sage" :
                        "text-ember"
                      }
                    >
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-stone">Provider</span>
                          <span className="font-medium text-hearth">{util.provider}</span>
                        </div>
                        {util.accountNote && (
                          <p className="text-xs text-stone leading-relaxed bg-linen rounded-lg p-3">
                            {util.accountNote}
                          </p>
                        )}
                        {util.phone && (
                          <div className="flex items-center justify-between">
                            <span className="text-stone">Phone</span>
                            <a href={`tel:${util.phone}`} className="font-medium text-ember hover:underline flex items-center gap-1">
                              <Phone className="h-3 w-3" /> {util.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </ExpandableCard>
                  ))}
                </div>
              </div>
            )}

            {/* Move-in Checklist */}
            {utilityInfo.length > 0 && (
              <div>
                <h3 className="font-heading text-lg font-semibold text-hearth mb-3 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-sage" />
                  Move-in Checklist
                </h3>
                <Card className="bg-white border-clay/20">
                  <CardContent className="p-5">
                    <ul className="space-y-2.5">
                      {utilityInfo.map((util, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm">
                          <div className="h-5 w-5 rounded-md border-2 border-clay/30 shrink-0 mt-0.5" />
                          <span className="text-stone">
                            Set up <span className="font-medium text-hearth">{util.type}</span> with {util.provider}
                            {util.phone && (
                              <> &mdash; <a href={`tel:${util.phone}`} className="text-ember hover:underline">{util.phone}</a></>
                            )}
                          </span>
                        </li>
                      ))}
                      {wifi && (
                        <li className="flex items-start gap-3 text-sm">
                          <div className="h-5 w-5 rounded-md border-2 border-clay/30 shrink-0 mt-0.5" />
                          <span className="text-stone">
                            Connect to WiFi: <span className="font-mono font-medium text-hearth">{wifi.network}</span>
                          </span>
                        </li>
                      )}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Key Contacts */}
            {emergencyContacts.length > 0 && (
              <div>
                <h3 className="font-heading text-lg font-semibold text-hearth mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-brand" />
                  Key Contacts
                </h3>
                <div className="grid sm:grid-cols-2 gap-3 stagger-children">
                  {emergencyContacts.map((contact, i) => (
                    <Card key={i} className="bg-white border-clay/20 hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-hearth text-sm">{contact.name}</h4>
                            <Badge variant="secondary" className="text-xs mt-1 bg-linen">{contact.role}</Badge>
                          </div>
                          <a
                            href={`tel:${contact.phone}`}
                            className="h-9 w-9 rounded-xl bg-ember/10 hover:bg-ember/20 flex items-center justify-center transition-colors shrink-0"
                            aria-label={`Call ${contact.name}`}
                          >
                            <Phone className="h-4 w-4 text-ember" />
                          </a>
                        </div>
                        <a href={`tel:${contact.phone}`} className="text-xs font-medium text-ember hover:underline mt-2 block">
                          {contact.phone}
                        </a>
                        {contact.available && (
                          <p className="text-xs text-stone mt-0.5">{contact.available}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ========== 5. ROOMS SECTION ========== */}
        {rooms.length > 0 && (
          <section
            id="rooms"
            ref={(el) => { sectionRefs.current["rooms"] = el; }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-ember/10 flex items-center justify-center">
                <Home className="h-5 w-5 text-ember" />
              </div>
              <h2 className="font-heading text-2xl font-semibold text-hearth">Rooms</h2>
            </div>

            {/* Room Selector Pills */}
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
              <button
                onClick={() => setSelectedRoom(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                  selectedRoom === null
                    ? "bg-hearth text-white shadow-md"
                    : "bg-white text-stone hover:text-hearth border border-clay/20"
                }`}
              >
                All Rooms
              </button>
              {rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                    selectedRoom === room.id
                      ? "bg-hearth text-white shadow-md"
                      : "bg-white text-stone hover:text-hearth border border-clay/20"
                  }`}
                >
                  {room.name}
                </button>
              ))}
            </div>

            {/* ALL ROOMS VIEW */}
            {selectedRoom === null && (
              <div className="space-y-8 animate-fade-in">
                {/* Paint Colors Palette */}
                {allPaintColors.length > 0 && (
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-hearth mb-4 flex items-center gap-2">
                      <Paintbrush className="h-4 w-4 text-ember" />
                      Paint Color Palette
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {allPaintColors.map((color, i) => (
                        <div
                          key={i}
                          className="group relative rounded-xl overflow-hidden border border-clay/20 hover:shadow-lg transition-all hover:-translate-y-0.5"
                        >
                          <div
                            className="h-20 w-full"
                            style={{ backgroundColor: color.hex }}
                          />
                          <div className="bg-white p-3">
                            <p className="text-xs font-semibold text-hearth leading-tight">{color.name}</p>
                            <div className="flex items-center justify-between mt-1.5">
                              <span className="text-xs font-mono text-stone uppercase">{color.hex}</span>
                              <Badge variant="secondary" className="text-[10px] bg-linen px-1.5 py-0">{color.roomName}</Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Room Cards */}
                <div>
                  <h3 className="font-heading text-lg font-semibold text-hearth mb-4">Room Overview</h3>
                  <div className="grid sm:grid-cols-2 gap-3 stagger-children">
                    {rooms.map((room) => {
                      const paintColors = asPaintColors(room.paint_colors);
                      const lightBulbs = asLightBulbs(room.light_bulbs);
                      const fixtures = asFixtures(room.fixtures);
                      const roomAppliances = appliances.filter((a) => a.room_id === room.id);

                      return (
                        <Card
                          key={room.id}
                          className="bg-white border-clay/20 hover:shadow-md transition-all cursor-pointer group"
                          onClick={() => setSelectedRoom(room.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="font-heading font-semibold text-hearth">{room.name}</h4>
                              <ChevronRight className="h-4 w-4 text-stone group-hover:text-ember transition-colors" />
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                              {paintColors.length > 0 && (
                                <div className="flex items-center gap-1">
                                  {paintColors.map((color, ci) => (
                                    <div
                                      key={ci}
                                      className="h-5 w-5 rounded-full border-2 border-white shadow-sm"
                                      style={{ backgroundColor: color.hex }}
                                      title={color.name}
                                    />
                                  ))}
                                </div>
                              )}
                              {fixtures.length > 0 && (
                                <Badge variant="secondary" className="text-xs bg-linen">
                                  {fixtures.length} fixture{fixtures.length !== 1 ? "s" : ""}
                                </Badge>
                              )}
                              {lightBulbs.length > 0 && (
                                <Badge variant="secondary" className="text-xs bg-linen">
                                  <Lightbulb className="h-3 w-3 mr-0.5" />
                                  {lightBulbs.length} bulb type{lightBulbs.length !== 1 ? "s" : ""}
                                </Badge>
                              )}
                              {roomAppliances.length > 0 && (
                                <Badge variant="secondary" className="text-xs bg-linen">
                                  {roomAppliances.length} appliance{roomAppliances.length !== 1 ? "s" : ""}
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* SPECIFIC ROOM VIEW */}
            {selectedRoomData && (
              <div className="animate-fade-in">
                {(() => {
                  const paintColors = asPaintColors(selectedRoomData.paint_colors);
                  const lightBulbs = asLightBulbs(selectedRoomData.light_bulbs);
                  const fixtures = asFixtures(selectedRoomData.fixtures);
                  const roomAppliances = appliances.filter((a) => a.room_id === selectedRoomData.id);

                  return (
                    <Card className="bg-white border-clay/20 shadow-md">
                      <CardContent className="p-6 sm:p-8 space-y-6">
                        <div className="flex items-center gap-3">
                          {selectedRoomData.photo_url ? (
                            <img
                              src={selectedRoomData.photo_url}
                              alt={selectedRoomData.name}
                              className="h-14 w-14 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="h-14 w-14 rounded-xl bg-linen flex items-center justify-center">
                              <Home className="h-6 w-6 text-clay" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-heading text-xl font-semibold text-hearth">{selectedRoomData.name}</h3>
                            {selectedRoomData.type && (
                              <Badge variant="secondary" className="text-xs mt-1 bg-linen capitalize">
                                {selectedRoomData.type.replace(/_/g, " ")}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Paint Colors */}
                        {paintColors.length > 0 && (
                          <div>
                            <h4 className="text-xs font-semibold text-stone uppercase tracking-wider mb-3 flex items-center gap-1.5">
                              <Paintbrush className="h-3.5 w-3.5" /> Paint Colors
                            </h4>
                            <div className="flex flex-wrap gap-3">
                              {paintColors.map((color, ci) => (
                                <div key={ci} className="flex items-center gap-2.5 bg-linen rounded-lg px-3 py-2">
                                  <div
                                    className="h-8 w-8 rounded-lg border border-clay/20 shadow-inner"
                                    style={{ backgroundColor: color.hex }}
                                  />
                                  <div>
                                    <p className="text-sm font-medium text-hearth">{color.name}</p>
                                    <p className="text-xs font-mono text-stone">{color.hex}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Fixtures */}
                        {fixtures.length > 0 && (
                          <div>
                            <h4 className="text-xs font-semibold text-stone uppercase tracking-wider mb-3">Fixtures</h4>
                            <ul className="space-y-1.5">
                              {fixtures.map((fixture, fi) => (
                                <li key={fi} className="flex items-start gap-2 text-sm text-stone">
                                  <div className="h-1.5 w-1.5 rounded-full bg-clay mt-2 shrink-0" />
                                  {fixture}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Light Bulbs */}
                        {lightBulbs.length > 0 && (
                          <div>
                            <h4 className="text-xs font-semibold text-stone uppercase tracking-wider mb-3 flex items-center gap-1.5">
                              <Lightbulb className="h-3.5 w-3.5" /> Light Bulbs
                            </h4>
                            <div className="space-y-2">
                              {lightBulbs.map((bulb, bi) => (
                                <div key={bi} className="bg-linen rounded-lg px-4 py-2.5 flex items-start gap-3">
                                  <div className="text-sm">
                                    <span className="font-medium text-hearth">{bulb.location}</span>
                                    <p className="text-xs text-stone mt-0.5">
                                      <span className="font-mono">{bulb.type}</span>
                                      {bulb.base !== "N/A" && <> &middot; Base: {bulb.base}</>}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Features */}
                        {selectedRoomData.features && selectedRoomData.features.length > 0 && (
                          <div>
                            <h4 className="text-xs font-semibold text-stone uppercase tracking-wider mb-3">Features</h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedRoomData.features.map((feat, fi) => (
                                <Badge key={fi} variant="secondary" className="bg-sage/10 text-sage border-sage/20 text-xs">
                                  {feat}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Appliances in this room */}
                        {roomAppliances.length > 0 && (
                          <div>
                            <h4 className="text-xs font-semibold text-stone uppercase tracking-wider mb-3 flex items-center gap-1.5">
                              <WrenchIcon className="h-3.5 w-3.5" /> Appliances
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {roomAppliances.map((a) => (
                                <Badge key={a.id} variant="secondary" className="bg-linen text-hearth text-xs">
                                  {a.name}
                                  {a.brand && <span className="text-stone ml-1">({a.brand})</span>}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        {selectedRoomData.notes && (
                          <div className="bg-caution/5 border border-caution/20 rounded-lg px-4 py-3">
                            <p className="text-sm text-stone leading-relaxed">
                              <span className="font-semibold text-hearth">Note: </span>
                              {selectedRoomData.notes}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })()}
              </div>
            )}
          </section>
        )}

        {/* ========== 6. APPLIANCES SECTION ========== */}
        {appliances.length > 0 && (
          <section
            id="appliances"
            ref={(el) => { sectionRefs.current["appliances"] = el; }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-ember/10 flex items-center justify-center">
                <WrenchIcon className="h-5 w-5 text-ember" />
              </div>
              <h2 className="font-heading text-2xl font-semibold text-hearth">Appliances</h2>
              <Badge variant="secondary" className="text-xs">{appliances.length} total</Badge>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone" />
              <Input
                placeholder="Search appliances..."
                value={applianceSearch}
                onChange={(e) => setApplianceSearch(e.target.value)}
                className="pl-10 bg-white border-clay/20"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
              <button
                onClick={() => setApplianceFilter("All")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                  applianceFilter === "All"
                    ? "bg-hearth text-white"
                    : "bg-white text-stone hover:text-hearth border border-clay/20"
                }`}
              >
                All
              </button>
              {applianceLocations.map((loc) => (
                <button
                  key={loc}
                  onClick={() => setApplianceFilter(loc)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                    applianceFilter === loc
                      ? "bg-hearth text-white"
                      : "bg-white text-stone hover:text-hearth border border-clay/20"
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>

            {/* Appliance Cards Grid */}
            <div className="grid sm:grid-cols-2 gap-3">
              {filteredAppliances.map((appliance) => {
                const room = rooms.find((r) => r.id === appliance.room_id);
                const isExpanded = expandedAppliances.has(appliance.id);

                return (
                  <Card
                    key={appliance.id}
                    className="bg-white border-clay/20 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => toggleAppliance(appliance.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="h-10 w-10 rounded-xl bg-linen flex items-center justify-center shrink-0">
                            <WrenchIcon className="h-5 w-5 text-clay" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-hearth text-sm truncate">{appliance.name}</h4>
                            <p className="text-xs text-stone truncate">
                              {appliance.brand && <>{appliance.brand}</>}
                              {appliance.brand && appliance.model && " \u00b7 "}
                              {appliance.model && <span className="font-mono">{appliance.model}</span>}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {room && (
                            <Badge variant="secondary" className="text-[10px] bg-linen hidden sm:inline-flex">{room.name}</Badge>
                          )}
                          <Badge
                            variant="secondary"
                            className={`text-[10px] ${
                              appliance.status === "good" ? "bg-sage/10 text-sage" :
                              appliance.status === "needs_attention" ? "bg-caution/10 text-caution" :
                              "bg-alert/10 text-alert"
                            }`}
                          >
                            {appliance.status === "good" ? "Good" :
                             appliance.status === "needs_attention" ? "Attention" : appliance.status}
                          </Badge>
                        </div>
                      </div>

                      {appliance.location && (
                        <p className="text-xs text-stone mt-1.5 ml-13">
                          <MapPin className="h-3 w-3 inline mr-0.5" />{appliance.location}
                        </p>
                      )}

                      {/* Expanded content */}
                      {isExpanded && (
                        <div className="mt-4 pt-3 border-t border-clay/10 animate-fade-in space-y-3">
                          {appliance.operating_tips && appliance.operating_tips.length > 0 && (
                            <div>
                              <h5 className="text-xs font-semibold text-stone uppercase tracking-wider mb-2">
                                Operating Tips
                              </h5>
                              <ul className="space-y-1.5">
                                {appliance.operating_tips.map((tip, i) => (
                                  <li key={i} className="text-xs text-stone flex items-start gap-2">
                                    <Lightbulb className="h-3 w-3 text-caution mt-0.5 shrink-0" />
                                    {tip}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredAppliances.length === 0 && (
              <div className="text-center py-8 text-stone text-sm">
                No appliances match your search.
              </div>
            )}
          </section>
        )}

        {/* ========== 7. EMERGENCY SECTION ========== */}
        {emergencyInfo && (
          <section
            id="emergency"
            ref={(el) => { sectionRefs.current["emergency"] = el; }}
          >
            <div className="bg-alert/5 border-2 border-alert/20 rounded-2xl p-6 sm:p-8 space-y-8">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-alert/20 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-alert" />
                </div>
                <h2 className="font-heading text-2xl font-semibold text-hearth">Emergency Information</h2>
              </div>

              {/* Shutoff Locations */}
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { label: "Water Shutoff", info: emergencyInfo.water_shutoff, icon: Droplets, color: "text-slate-brand", bg: "bg-slate-brand/10" },
                  { label: "Electric Panel", info: emergencyInfo.electric_shutoff, icon: Zap, color: "text-caution", bg: "bg-caution/10" },
                  { label: "Gas Shutoff", info: emergencyInfo.gas_shutoff, icon: Flame, color: "text-alert", bg: "bg-alert/10" },
                ]
                  .filter((item) => item.info)
                  .map((item) => (
                    <Card key={item.label} className="bg-white border-clay/20">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className={`h-8 w-8 rounded-lg ${item.bg} flex items-center justify-center`}>
                            <item.icon className={`h-4 w-4 ${item.color}`} />
                          </div>
                          <h4 className="font-semibold text-hearth text-sm">{item.label}</h4>
                        </div>
                        <p className="text-xs text-stone leading-relaxed">{asString(item.info)}</p>
                      </CardContent>
                    </Card>
                  ))}
              </div>

              {/* Fire Extinguishers */}
              {fireExtinguishers.length > 0 && (
                <div>
                  <h3 className="font-heading text-base font-semibold text-hearth mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-ember" />
                    Fire Extinguishers
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {fireExtinguishers.map((ext, i) => (
                      <Badge key={i} variant="secondary" className="bg-white text-stone text-xs border border-clay/20 py-1.5 px-3">
                        <MapPin className="h-3 w-3 mr-1 text-ember" />
                        {ext.location}
                        {ext.type && <span className="text-stone/60 ml-1">({ext.type})</span>}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Emergency Procedures */}
              {emergencyProcedures.length > 0 && (
                <div>
                  <h3 className="font-heading text-base font-semibold text-hearth mb-3">Emergency Procedures</h3>
                  <div className="space-y-2">
                    {emergencyProcedures.map((proc, i) => {
                      const Icon = emergencyIcons[proc.icon] || AlertTriangle;
                      const isOpen = expandedProcedures.has(i);
                      const severityColor =
                        proc.icon === "flame" ? "border-l-alert" :
                        proc.icon === "droplets" ? "border-l-slate-brand" :
                        proc.icon === "cloud-rain" ? "border-l-slate-brand" :
                        "border-l-caution";

                      return (
                        <Card key={i} className={`bg-white border-clay/20 overflow-hidden border-l-4 ${severityColor}`}>
                          <button
                            onClick={() => toggleProcedure(i)}
                            className="w-full flex items-center justify-between p-4 text-left"
                          >
                            <div className="flex items-center gap-3">
                              <Icon className="h-5 w-5 text-alert" />
                              <span className="font-heading font-semibold text-hearth text-sm">{proc.title}</span>
                            </div>
                            {isOpen ? <ChevronUp className="h-4 w-4 text-stone" /> : <ChevronDown className="h-4 w-4 text-stone" />}
                          </button>
                          {isOpen && (
                            <div className="px-4 pb-4 animate-fade-in">
                              <ol className="space-y-2 ml-8">
                                {proc.steps.map((step, j) => (
                                  <li key={j} className="flex items-start gap-3 text-sm text-stone">
                                    <span className="h-5 w-5 rounded-full bg-alert/10 text-alert text-xs font-bold flex items-center justify-center shrink-0">
                                      {j + 1}
                                    </span>
                                    {step}
                                  </li>
                                ))}
                              </ol>
                            </div>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Emergency Contacts (full list) */}
              {emergencyContacts.length > 0 && (
                <div>
                  <h3 className="font-heading text-base font-semibold text-hearth mb-3 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-alert" />
                    Emergency Contacts
                  </h3>
                  <div className="space-y-2">
                    {emergencyContacts.map((contact, i) => (
                      <div key={i} className="bg-white rounded-xl p-4 border border-clay/20 flex items-center justify-between">
                        <div>
                          <div className="font-medium text-hearth text-sm">{contact.name}</div>
                          <div className="text-xs text-stone">
                            {contact.role}
                            {contact.available && <> &middot; {contact.available}</>}
                          </div>
                        </div>
                        <a
                          href={`tel:${contact.phone}`}
                          className="flex items-center gap-1.5 bg-ember hover:bg-ember-dark text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                        >
                          <Phone className="h-3.5 w-3.5" /> {contact.phone}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ========== 8. GETTING AROUND SECTION ========== */}
        {localRecs.length > 0 && (
          <section
            id="getting-around"
            ref={(el) => { sectionRefs.current["getting-around"] = el; }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-ember/10 flex items-center justify-center">
                <Compass className="h-5 w-5 text-ember" />
              </div>
              <h2 className="font-heading text-2xl font-semibold text-hearth">Getting Around</h2>
            </div>

            <div className="space-y-8">
              {Object.entries(recsByCategory).map(([category, recs]) => {
                const emoji = categoryEmojis[category] || "\u2B50";
                const Icon = categoryIcons[category] || Star;

                return (
                  <div key={category}>
                    <h3 className="font-heading text-base font-semibold text-hearth mb-3 flex items-center gap-2">
                      <span className="text-lg">{emoji}</span>
                      {category}
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {recs.map((rec, i) => (
                        <Card key={i} className="bg-white border-clay/20 hover:shadow-md transition-all">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="h-9 w-9 rounded-lg bg-ember/10 flex items-center justify-center shrink-0">
                                <Icon className="h-4 w-4 text-ember" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-hearth text-sm">{rec.name}</h4>
                                  {rec.distance && (
                                    <Badge variant="secondary" className="text-[10px] bg-linen shrink-0">{rec.distance}</Badge>
                                  )}
                                </div>
                                <p className="text-xs text-stone mt-1 leading-relaxed">{rec.description}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ========== 9. HOUSE RULES SECTION ========== */}
        {houseRules.length > 0 && (
          <section
            id="house-rules"
            ref={(el) => { sectionRefs.current["house-rules"] = el; }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-ember/10 flex items-center justify-center">
                <ScrollText className="h-5 w-5 text-ember" />
              </div>
              <h2 className="font-heading text-2xl font-semibold text-hearth">House Rules</h2>
            </div>

            <Card className="bg-white border-clay/20">
              <CardContent className="p-6 sm:p-8">
                <p className="text-sm text-stone mb-6">
                  A few friendly guidelines to keep things running smoothly for everyone.
                </p>
                <ul className="space-y-3">
                  {houseRules.map((rule, i) => (
                    <li key={i} className="flex items-start gap-3 text-stone">
                      <span className="h-6 w-6 rounded-full bg-ember/10 text-ember text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-sm leading-relaxed">{rule}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </section>
        )}

        {/* ========== 10. FOOTER ========== */}
        <section className="text-center space-y-8 pt-4">
          {/* Need Help CTA */}
          <Card className="bg-white border-clay/20">
            <CardContent className="p-8 sm:p-10 text-center">
              <h2 className="font-heading text-2xl font-semibold text-hearth mb-2">Need Help?</h2>
              <p className="text-stone mb-6">Don&apos;t hesitate to reach out if you have questions or need anything.</p>
              {primaryContact && (
                <a
                  href={`tel:${primaryContact.phone}`}
                  className="inline-flex items-center justify-center gap-2 bg-ember hover:bg-ember-dark text-white font-medium py-3 px-8 rounded-xl transition-colors"
                >
                  <Phone className="h-4 w-4" /> Call {primaryContact.name}
                </a>
              )}
            </CardContent>
          </Card>

          {/* QR Code */}
          <div className="bg-white rounded-2xl border border-clay/20 p-8 inline-block">
            <QRCode url={handbookUrl} size={128} />
            <p className="text-xs text-stone mt-3">Scan to access this handbook on your phone</p>
          </div>
        </section>
      </div>

      {/* Footer Bar */}
      <footer className="bg-hearth text-white py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="font-heading text-lg font-semibold mb-2">
            <span className="text-ember">t</span>hreshold
          </div>
          <p className="text-white/50 text-sm">The owner&apos;s manual for your home</p>
          {primaryContact && (
            <a
              href={`tel:${primaryContact.phone}`}
              className="text-white/60 text-xs hover:text-white transition-colors mt-3 inline-flex items-center gap-1"
            >
              <Phone className="h-3 w-3" /> {primaryContact.name} &mdash; {primaryContact.phone}
            </a>
          )}
        </div>
      </footer>
    </div>
  );
}
