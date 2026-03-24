import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QRCode } from "@/components/shared/qr-code";
import {
  Home, MapPin, Wifi, Car, Trash2, Phone,
  AlertTriangle, Droplets, Zap, Flame, CloudRain,
  Shield, Lightbulb, Coffee, ShoppingBag,
  UtensilsCrossed, TreePine, Dumbbell, Cross, Wrench as WrenchIcon,
  Star, ChevronRight, Heart,
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
    // Could be { location: "...", description: "..." }
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

// ---------- component ----------

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

  // Build table of contents items dynamically
  const tocItems: Array<{ label: string; href: string }> = [];
  if (wifi) tocItems.push({ label: "WiFi & Getting Connected", href: "#wifi" });
  if (rooms.length > 0) tocItems.push({ label: "Room-by-Room Guide", href: "#rooms" });
  if (appliances.length > 0) tocItems.push({ label: "Appliance Quick Reference", href: "#appliances" });
  if (emergencyInfo) tocItems.push({ label: "Emergency Procedures", href: "#emergency" });
  if (utilityInfo.length > 0) tocItems.push({ label: "Utility Setup", href: "#utilities" });
  if (houseRules.length > 0) tocItems.push({ label: "House Rules", href: "#rules" });
  if (handbookConfig.parking || handbookConfig.trash) tocItems.push({ label: "Parking & Trash", href: "#parking" });
  if (localRecs.length > 0) tocItems.push({ label: "Local Recommendations", href: "#local" });
  tocItems.push({ label: "Contact Information", href: "#contact" });

  return (
    <div className="min-h-screen bg-linen">
      {/* Header */}
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
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <div className="font-heading text-sm font-medium text-clay-light tracking-widest uppercase mb-6">
            Welcome to Your New Home
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-semibold mb-4 leading-tight">
            {property.address_line1}
          </h1>
          <p className="text-clay-light text-lg flex items-center justify-center gap-2">
            <MapPin className="h-5 w-5" />
            {property.city}, {property.state} {property.zip}
          </p>
          {(property.beds || property.baths || property.sqft) && (
            <div className="mt-8 flex items-center justify-center gap-4 text-sm text-clay-light">
              {property.beds && <span>{property.beds} Bedrooms</span>}
              {property.beds && property.baths && <span className="text-white/30">&middot;</span>}
              {property.baths && <span>{property.baths} Bathrooms</span>}
              {(property.beds || property.baths) && property.sqft && <span className="text-white/30">&middot;</span>}
              {property.sqft && <span>{property.sqft.toLocaleString()} sq ft</span>}
            </div>
          )}
        </div>
      </header>

      {/* Welcome message */}
      {handbookConfig.welcome_message && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <Card className="bg-white border-clay/20 shadow-lg">
            <CardContent className="p-8 sm:p-10">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="h-6 w-6 text-ember" />
                <h2 className="font-heading text-2xl font-semibold text-hearth">Welcome Home</h2>
              </div>
              <p className="text-stone leading-relaxed text-lg">{handbookConfig.welcome_message}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Table of Contents */}
      {tocItems.length > 1 && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-12">
          <Card className="bg-white border-clay/20">
            <CardContent className="p-8">
              <h2 className="font-heading text-xl font-semibold text-hearth mb-4">What&apos;s Inside</h2>
              <nav className="grid sm:grid-cols-2 gap-2">
                {tocItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2 p-3 rounded-lg hover:bg-linen transition-colors text-stone hover:text-hearth"
                  >
                    <ChevronRight className="h-4 w-4 text-ember" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </a>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>
      )}

      {/* WiFi Section */}
      {wifi && (
        <section id="wifi" className="max-w-3xl mx-auto px-4 sm:px-6 pb-12">
          <Card className="bg-gradient-to-br from-hearth to-hearth/90 text-white border-0 shadow-xl">
            <CardContent className="p-8 sm:p-10">
              <div className="flex items-center gap-3 mb-6">
                <Wifi className="h-6 w-6 text-ember-light" />
                <h2 className="font-heading text-2xl font-semibold">WiFi Network</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-clay-light uppercase tracking-wider mb-1">Network Name</div>
                  <div className="text-xl font-mono font-semibold">{wifi.network}</div>
                </div>
                <div>
                  <div className="text-sm text-clay-light uppercase tracking-wider mb-1">Password</div>
                  <div className="text-xl font-mono font-semibold">{wifi.password}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Room-by-Room Guide */}
      {rooms.length > 0 && (
        <section id="rooms" className="max-w-3xl mx-auto px-4 sm:px-6 pb-12">
          <h2 className="font-heading text-2xl font-semibold text-hearth mb-6">Room-by-Room Guide</h2>
          <div className="space-y-4">
            {rooms.map((room) => {
              const paintColors = asPaintColors(room.paint_colors);
              const lightBulbs = asLightBulbs(room.light_bulbs);
              const roomAppliances = appliances.filter((a) => a.room_id === room.id);

              return (
                <Card key={room.id} className="bg-white border-clay/20 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="sm:flex">
                      {room.photo_url ? (
                        <div className="h-48 sm:h-auto sm:w-48 shrink-0 overflow-hidden">
                          <img
                            src={room.photo_url}
                            alt={room.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-48 sm:h-auto sm:w-48 shrink-0 bg-linen-dark flex items-center justify-center">
                          <Home className="h-10 w-10 text-clay" />
                        </div>
                      )}
                      <div className="p-6 flex-1">
                        <h3 className="font-heading text-lg font-semibold text-hearth mb-3">{room.name}</h3>

                        {paintColors.length > 0 && (
                          <div className="mb-3">
                            <div className="text-xs text-stone uppercase tracking-wider mb-1">Paint Colors</div>
                            <div className="flex flex-wrap gap-2">
                              {paintColors.map((color, i) => (
                                <div key={i} className="flex items-center gap-1.5">
                                  <div className="h-4 w-4 rounded-full border border-clay/30" style={{ backgroundColor: color.hex }} />
                                  <span className="text-xs text-hearth">{color.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {lightBulbs.length > 0 && (
                          <div className="mb-3">
                            <div className="text-xs text-stone uppercase tracking-wider mb-1">Light Bulbs</div>
                            <div className="text-xs text-stone space-y-0.5">
                              {lightBulbs.map((bulb, i) => (
                                <div key={i}>{bulb.location}: <span className="font-mono">{bulb.type}</span>, {bulb.base}</div>
                              ))}
                            </div>
                          </div>
                        )}

                        {room.features && room.features.length > 0 && (
                          <div className="mb-3">
                            <div className="text-xs text-stone uppercase tracking-wider mb-1">Features</div>
                            <div className="flex flex-wrap gap-1.5">
                              {room.features.map((feat, i) => (
                                <Badge key={i} variant="secondary" className="text-xs bg-linen">{feat}</Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {roomAppliances.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {roomAppliances.map((a) => (
                              <Badge key={a.id} variant="secondary" className="text-xs bg-linen">{a.name}</Badge>
                            ))}
                          </div>
                        )}

                        {room.notes && (
                          <p className="text-xs text-stone mt-3 italic">{room.notes}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Appliance Quick Reference */}
      {appliances.length > 0 && (
        <section id="appliances" className="max-w-3xl mx-auto px-4 sm:px-6 pb-12">
          <h2 className="font-heading text-2xl font-semibold text-hearth mb-6">Appliance Quick Reference</h2>
          <Card className="bg-white border-clay/20 overflow-hidden">
            <div className="divide-y divide-border">
              {appliances.map((appliance) => {
                const room = rooms.find((r) => r.id === appliance.room_id);
                return (
                  <div key={appliance.id} className="p-4 sm:p-5 hover:bg-linen/50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-hearth">{appliance.name}</h4>
                        <p className="text-sm text-stone">
                          {appliance.brand && <>{appliance.brand}</>}
                          {appliance.brand && appliance.model && " \u00b7 "}
                          {appliance.model && <span className="font-mono text-xs">{appliance.model}</span>}
                        </p>
                        {appliance.location && (
                          <p className="text-xs text-stone mt-0.5">{appliance.location}</p>
                        )}
                      </div>
                      {room && <Badge variant="secondary" className="text-xs">{room.name}</Badge>}
                    </div>
                    {appliance.operating_tips && appliance.operating_tips.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {appliance.operating_tips.slice(0, 2).map((tip, i) => (
                          <li key={i} className="text-xs text-stone flex items-start gap-1.5">
                            <Lightbulb className="h-3 w-3 text-caution mt-0.5 shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </section>
      )}

      {/* Emergency Procedures */}
      {emergencyInfo && (
        <section id="emergency" className="max-w-3xl mx-auto px-4 sm:px-6 pb-12">
          <div className="bg-alert/5 border-2 border-alert/20 rounded-2xl p-8 sm:p-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-alert/20 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-alert" />
              </div>
              <h2 className="font-heading text-2xl font-semibold text-hearth">Emergency Information</h2>
            </div>

            {/* Key locations */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {[
                { label: "Water Shutoff", info: emergencyInfo.water_shutoff, icon: Droplets, color: "text-slate-brand" },
                { label: "Electric Panel", info: emergencyInfo.electric_shutoff, icon: Zap, color: "text-caution" },
                { label: "Gas Shutoff", info: emergencyInfo.gas_shutoff, icon: Flame, color: "text-alert" },
                { label: "Fire Extinguishers", info: emergencyInfo.fire_extinguishers, icon: Shield, color: "text-ember" },
              ]
                .filter((item) => item.info)
                .map((item) => (
                  <div key={item.label} className="bg-white rounded-xl p-4 border border-clay/20">
                    <div className="flex items-center gap-2 mb-2">
                      <item.icon className={`h-4 w-4 ${item.color}`} />
                      <h4 className="font-semibold text-hearth text-sm">{item.label}</h4>
                    </div>
                    <p className="text-xs text-stone leading-relaxed">{asString(item.info)}</p>
                  </div>
                ))}
            </div>

            {/* Emergency contacts */}
            {emergencyContacts.length > 0 && (
              <>
                <h3 className="font-heading text-lg font-semibold text-hearth mb-4">Emergency Contacts</h3>
                <div className="space-y-2 mb-8">
                  {emergencyContacts.map((contact, i) => (
                    <div key={i} className="bg-white rounded-xl p-4 border border-clay/20 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-hearth text-sm">{contact.name}</div>
                        <div className="text-xs text-stone">
                          {contact.role}
                          {contact.available && <> &middot; {contact.available}</>}
                        </div>
                      </div>
                      <a href={`tel:${contact.phone}`} className="font-medium text-ember text-sm hover:underline flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" /> {contact.phone}
                      </a>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Procedures */}
            {emergencyProcedures.length > 0 && (
              <>
                <h3 className="font-heading text-lg font-semibold text-hearth mb-4">What To Do In An Emergency</h3>
                <div className="space-y-4">
                  {emergencyProcedures.map((proc, i) => {
                    const Icon = emergencyIcons[proc.icon] || AlertTriangle;
                    return (
                      <div key={i} className="bg-white rounded-xl p-5 border border-clay/20">
                        <div className="flex items-center gap-2 mb-3">
                          <Icon className="h-5 w-5 text-alert" />
                          <h4 className="font-heading font-semibold text-hearth">{proc.title}</h4>
                        </div>
                        <ol className="space-y-2">
                          {proc.steps.map((step, j) => (
                            <li key={j} className="flex items-start gap-3 text-sm text-stone">
                              <span className="h-5 w-5 rounded-full bg-alert/10 text-alert text-xs font-bold flex items-center justify-center shrink-0">{j + 1}</span>
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* Utilities */}
      {utilityInfo.length > 0 && (
        <section id="utilities" className="max-w-3xl mx-auto px-4 sm:px-6 pb-12">
          <h2 className="font-heading text-2xl font-semibold text-hearth mb-6">Utility Setup</h2>
          <Card className="bg-white border-clay/20">
            <div className="divide-y divide-border">
              {utilityInfo.map((util, i) => (
                <div key={i} className="p-5 flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-hearth">{util.type}</h4>
                    <p className="text-sm text-stone">
                      {util.provider}
                      {util.accountNote && <> &middot; {util.accountNote}</>}
                    </p>
                  </div>
                  {util.phone && (
                    <a href={`tel:${util.phone}`} className="text-sm text-ember hover:underline font-medium">{util.phone}</a>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </section>
      )}

      {/* House Rules */}
      {houseRules.length > 0 && (
        <section id="rules" className="max-w-3xl mx-auto px-4 sm:px-6 pb-12">
          <h2 className="font-heading text-2xl font-semibold text-hearth mb-6">House Rules</h2>
          <Card className="bg-white border-clay/20">
            <CardContent className="p-6 sm:p-8">
              <ul className="space-y-3">
                {houseRules.map((rule, i) => (
                  <li key={i} className="flex items-start gap-3 text-stone">
                    <span className="h-6 w-6 rounded-full bg-ember/10 text-ember text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    <span className="text-sm leading-relaxed">{rule}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Parking & Trash */}
      {(handbookConfig.parking || handbookConfig.trash) && (
        <section id="parking" className="max-w-3xl mx-auto px-4 sm:px-6 pb-12">
          <div className="grid sm:grid-cols-2 gap-4">
            {handbookConfig.parking && (
              <Card className="bg-white border-clay/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Car className="h-5 w-5 text-ember" />
                    <h3 className="font-heading text-lg font-semibold text-hearth">Parking</h3>
                  </div>
                  <p className="text-sm text-stone leading-relaxed">{handbookConfig.parking}</p>
                </CardContent>
              </Card>
            )}
            {handbookConfig.trash && (
              <Card className="bg-white border-clay/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Trash2 className="h-5 w-5 text-sage" />
                    <h3 className="font-heading text-lg font-semibold text-hearth">Trash & Recycling</h3>
                  </div>
                  <p className="text-sm text-stone leading-relaxed">{handbookConfig.trash}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      )}

      {/* Local Recommendations */}
      {localRecs.length > 0 && (
        <section id="local" className="max-w-3xl mx-auto px-4 sm:px-6 pb-12">
          <h2 className="font-heading text-2xl font-semibold text-hearth mb-6">Local Recommendations</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {localRecs.map((rec, i) => {
              const Icon = categoryIcons[rec.category] || Star;
              return (
                <Card key={i} className="bg-white border-clay/20 hover:shadow-sm transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-lg bg-ember/10 flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4 text-ember" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-hearth text-sm">{rec.name}</h4>
                          {rec.distance && <Badge variant="secondary" className="text-xs">{rec.distance}</Badge>}
                        </div>
                        <p className="text-xs text-stone mt-0.5">{rec.description}</p>
                        <Badge variant="outline" className="text-xs mt-1.5">{rec.category}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Contact */}
      <section id="contact" className="max-w-3xl mx-auto px-4 sm:px-6 pb-12">
        <Card className="bg-white border-clay/20">
          <CardContent className="p-8 sm:p-10 text-center">
            <h2 className="font-heading text-2xl font-semibold text-hearth mb-2">Need Help?</h2>
            <p className="text-stone mb-6">Don&apos;t hesitate to reach out if you have questions or need anything.</p>
            {emergencyContacts.length > 0 && (
              <div className="space-y-3 max-w-sm mx-auto">
                <a
                  href={`tel:${emergencyContacts[0].phone}`}
                  className="flex items-center justify-center gap-2 bg-ember hover:bg-ember-dark text-white font-medium py-3 px-6 rounded-xl transition-colors"
                >
                  <Phone className="h-4 w-4" /> Call {emergencyContacts[0].name}
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* QR Code */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-12 text-center">
        <div className="bg-white rounded-2xl border border-clay/20 p-8 inline-block">
          <QRCode url={handbookUrl} size={128} />
          <p className="text-xs text-stone mt-3">Scan to access this handbook on your phone</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-hearth text-white py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="font-heading text-lg font-semibold mb-2">
            <span className="text-ember">t</span>hreshold
          </div>
          <p className="text-white/50 text-sm">The owner&apos;s manual for your home</p>
        </div>
      </footer>
    </div>
  );
}
