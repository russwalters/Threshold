"use client";

import { use } from "react";
import { getPropertyByShareId, getAppliancesForRoom } from "@/data/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PlaceholderImage } from "@/components/shared/placeholder-image";
import {
  Home, MapPin, Wifi, Car, Trash2, Phone, BookOpen,
  AlertTriangle, Droplets, Zap, Flame, CloudRain,
  Shield, Refrigerator, Lightbulb, Coffee, ShoppingBag,
  UtensilsCrossed, TreePine, Dumbbell, Cross, Wrench as WrenchIcon,
  Star, ChevronDown, ExternalLink, QrCode, Clock, ChevronRight,
  Heart,
} from "lucide-react";

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

export default function HandbookPage({ params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = use(params);
  const property = getPropertyByShareId(shareId);

  if (!property || !property.handbook.published) {
    return (
      <div className="min-h-screen bg-linen flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 rounded-2xl bg-clay/10 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8 text-clay" />
          </div>
          <h1 className="font-heading text-2xl text-hearth mb-2">Handbook Not Found</h1>
          <p className="text-stone">This handbook doesn&apos;t exist or hasn&apos;t been published yet.</p>
        </div>
      </div>
    );
  }

  const handbook = property.handbook;

  return (
    <div className="min-h-screen bg-linen">
      {/* Beautiful header */}
      <header className="relative bg-hearth text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-ember rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-clay rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <div className="font-heading text-sm font-medium text-clay-light tracking-widest uppercase mb-6">
            Welcome to Your New Home
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-semibold mb-4 leading-tight">
            {property.address}
          </h1>
          <p className="text-clay-light text-lg flex items-center justify-center gap-2">
            <MapPin className="h-5 w-5" />
            {property.city}, {property.state} {property.zip}
          </p>
          <div className="mt-8 flex items-center justify-center gap-4 text-sm text-clay-light">
            <span>{property.beds} Bedrooms</span>
            <span className="text-white/30">·</span>
            <span>{property.baths} Bathrooms</span>
            <span className="text-white/30">·</span>
            <span>{property.sqft.toLocaleString()} sq ft</span>
          </div>
        </div>
      </header>

      {/* Welcome message */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <Card className="bg-white border-clay/20 shadow-lg">
          <CardContent className="p-8 sm:p-10">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="h-6 w-6 text-ember" />
              <h2 className="font-heading text-2xl font-semibold text-hearth">Welcome Home</h2>
            </div>
            <p className="text-stone leading-relaxed text-lg">{handbook.welcomeMessage}</p>
          </CardContent>
        </Card>
      </div>

      {/* Table of Contents */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-12">
        <Card className="bg-white border-clay/20">
          <CardContent className="p-8">
            <h2 className="font-heading text-xl font-semibold text-hearth mb-4">What&apos;s Inside</h2>
            <nav className="grid sm:grid-cols-2 gap-2">
              {[
                { label: "WiFi & Getting Connected", href: "#wifi" },
                { label: "Room-by-Room Guide", href: "#rooms" },
                { label: "Appliance Quick Reference", href: "#appliances" },
                { label: "Emergency Procedures", href: "#emergency" },
                { label: "Utility Setup", href: "#utilities" },
                { label: "House Rules", href: "#rules" },
                { label: "Parking & Trash", href: "#parking" },
                { label: "Local Recommendations", href: "#local" },
                { label: "Contact Information", href: "#contact" },
              ].map((item) => (
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

      {/* WiFi Section */}
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
                <div className="text-xl font-mono font-semibold">{handbook.wifiName}</div>
              </div>
              <div>
                <div className="text-sm text-clay-light uppercase tracking-wider mb-1">Password</div>
                <div className="text-xl font-mono font-semibold">{handbook.wifiPassword}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Room-by-Room Guide */}
      <section id="rooms" className="max-w-3xl mx-auto px-4 sm:px-6 pb-12">
        <h2 className="font-heading text-2xl font-semibold text-hearth mb-6">Room-by-Room Guide</h2>
        <div className="space-y-4">
          {property.rooms.map((room) => {
            const roomAppliances = getAppliancesForRoom(property.id, room.id);
            return (
              <Card key={room.id} className="bg-white border-clay/20 overflow-hidden">
                <CardContent className="p-0">
                  <div className="sm:flex">
                    <PlaceholderImage type={room.type} seed={room.id + "-hb"} className="h-48 sm:h-auto sm:w-48 rounded-none shrink-0" label={room.name} />
                    <div className="p-6 flex-1">
                      <h3 className="font-heading text-lg font-semibold text-hearth mb-3">{room.name}</h3>

                      {room.paintColors.length > 0 && (
                        <div className="mb-3">
                          <div className="text-xs text-stone uppercase tracking-wider mb-1">Paint Colors</div>
                          <div className="flex flex-wrap gap-2">
                            {room.paintColors.map((color, i) => (
                              <div key={i} className="flex items-center gap-1.5">
                                <div className="h-4 w-4 rounded-full border border-clay/30" style={{ backgroundColor: color.hex }} />
                                <span className="text-xs text-hearth">{color.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {room.lightBulbs.length > 0 && (
                        <div className="mb-3">
                          <div className="text-xs text-stone uppercase tracking-wider mb-1">Light Bulbs</div>
                          <div className="text-xs text-stone space-y-0.5">
                            {room.lightBulbs.map((bulb, i) => (
                              <div key={i}>{bulb.location}: <span className="font-mono">{bulb.type}</span>, {bulb.base}</div>
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

      {/* Appliance Quick Reference */}
      <section id="appliances" className="max-w-3xl mx-auto px-4 sm:px-6 pb-12">
        <h2 className="font-heading text-2xl font-semibold text-hearth mb-6">Appliance Quick Reference</h2>
        <Card className="bg-white border-clay/20 overflow-hidden">
          <div className="divide-y divide-border">
            {property.appliances.map((appliance) => {
              const room = property.rooms.find((r) => r.id === appliance.roomId);
              return (
                <div key={appliance.id} className="p-4 sm:p-5 hover:bg-linen/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-hearth">{appliance.name}</h4>
                      <p className="text-sm text-stone">{appliance.brand} · <span className="font-mono text-xs">{appliance.model}</span></p>
                    </div>
                    {room && <Badge variant="secondary" className="text-xs">{room.name}</Badge>}
                  </div>
                  {appliance.operatingTips.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {appliance.operatingTips.slice(0, 2).map((tip, i) => (
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

      {/* Emergency Procedures */}
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
              { label: "Water Shutoff", info: property.emergencyInfo.waterShutoff, icon: Droplets, color: "text-slate-brand" },
              { label: "Electric Panel", info: property.emergencyInfo.electricPanel, icon: Zap, color: "text-caution" },
              { label: "Gas Shutoff", info: property.emergencyInfo.gasShutoff, icon: Flame, color: "text-alert" },
              { label: "Fire Extinguishers", info: property.emergencyInfo.fireExtinguishers, icon: Shield, color: "text-ember" },
            ].map((item) => (
              <div key={item.label} className="bg-white rounded-xl p-4 border border-clay/20">
                <div className="flex items-center gap-2 mb-2">
                  <item.icon className={`h-4 w-4 ${item.color}`} />
                  <h4 className="font-semibold text-hearth text-sm">{item.label}</h4>
                </div>
                <p className="text-xs text-stone leading-relaxed">{item.info}</p>
              </div>
            ))}
          </div>

          {/* Emergency contacts */}
          <h3 className="font-heading text-lg font-semibold text-hearth mb-4">Emergency Contacts</h3>
          <div className="space-y-2 mb-8">
            {property.emergencyInfo.emergencyContacts.map((contact, i) => (
              <div key={i} className="bg-white rounded-xl p-4 border border-clay/20 flex items-center justify-between">
                <div>
                  <div className="font-medium text-hearth text-sm">{contact.name}</div>
                  <div className="text-xs text-stone">{contact.role} · {contact.available}</div>
                </div>
                <a href={`tel:${contact.phone}`} className="font-medium text-ember text-sm hover:underline flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" /> {contact.phone}
                </a>
              </div>
            ))}
          </div>

          {/* Procedures */}
          <h3 className="font-heading text-lg font-semibold text-hearth mb-4">What To Do In An Emergency</h3>
          <div className="space-y-4">
            {property.emergencyInfo.procedures.map((proc, i) => {
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
        </div>
      </section>

      {/* Utilities */}
      <section id="utilities" className="max-w-3xl mx-auto px-4 sm:px-6 pb-12">
        <h2 className="font-heading text-2xl font-semibold text-hearth mb-6">Utility Setup</h2>
        <Card className="bg-white border-clay/20">
          <div className="divide-y divide-border">
            {handbook.utilityInfo.map((util, i) => (
              <div key={i} className="p-5 flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-hearth">{util.type}</h4>
                  <p className="text-sm text-stone">{util.provider} · {util.accountNote}</p>
                </div>
                <a href={`tel:${util.phone}`} className="text-sm text-ember hover:underline font-medium">{util.phone}</a>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* House Rules */}
      <section id="rules" className="max-w-3xl mx-auto px-4 sm:px-6 pb-12">
        <h2 className="font-heading text-2xl font-semibold text-hearth mb-6">House Rules</h2>
        <Card className="bg-white border-clay/20">
          <CardContent className="p-6 sm:p-8">
            {handbook.houseRules.length > 0 ? (
              <ul className="space-y-3">
                {handbook.houseRules.map((rule, i) => (
                  <li key={i} className="flex items-start gap-3 text-stone">
                    <span className="h-6 w-6 rounded-full bg-ember/10 text-ember text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    <span className="text-sm leading-relaxed">{rule}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-stone text-sm">No house rules set yet.</p>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Parking & Trash */}
      <section id="parking" className="max-w-3xl mx-auto px-4 sm:px-6 pb-12">
        <div className="grid sm:grid-cols-2 gap-4">
          <Card className="bg-white border-clay/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Car className="h-5 w-5 text-ember" />
                <h3 className="font-heading text-lg font-semibold text-hearth">Parking</h3>
              </div>
              <p className="text-sm text-stone leading-relaxed">{handbook.parkingInfo}</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-clay/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Trash2 className="h-5 w-5 text-sage" />
                <h3 className="font-heading text-lg font-semibold text-hearth">Trash & Recycling</h3>
              </div>
              <p className="text-sm text-stone leading-relaxed">{handbook.trashSchedule}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Local Recommendations */}
      {handbook.localRecommendations.length > 0 && (
        <section id="local" className="max-w-3xl mx-auto px-4 sm:px-6 pb-12">
          <h2 className="font-heading text-2xl font-semibold text-hearth mb-6">Local Recommendations</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {handbook.localRecommendations.map((rec, i) => {
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
                          <Badge variant="secondary" className="text-xs">{rec.distance}</Badge>
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
            <div className="space-y-3 max-w-sm mx-auto">
              {property.emergencyInfo.emergencyContacts.slice(0, 1).map((contact, i) => (
                <a key={i} href={`tel:${contact.phone}`} className="flex items-center justify-center gap-2 bg-ember hover:bg-ember-dark text-white font-medium py-3 px-6 rounded-xl transition-colors">
                  <Phone className="h-4 w-4" /> Call {contact.name}
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* QR Code placeholder */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-12 text-center">
        <div className="bg-white rounded-2xl border border-clay/20 p-8 inline-block">
          <div className="h-32 w-32 bg-hearth/5 rounded-xl flex items-center justify-center mx-auto mb-3 border-2 border-dashed border-clay/30">
            <QrCode className="h-12 w-12 text-stone/40" />
          </div>
          <p className="text-xs text-stone">Scan to access this handbook on your phone</p>
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
