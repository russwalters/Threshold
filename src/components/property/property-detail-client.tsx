"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { PlaceholderImage } from "@/components/shared/placeholder-image";
import {
  Home, Building2, ArrowLeft, Edit, Share2, Wrench, FileText,
  Refrigerator, AlertTriangle, BookOpen, Search, Phone, MapPin,
  Calendar, DollarSign, Shield, Clock, CheckCircle2,
  Eye, Download, Droplets, Zap, Flame, CloudRain, ChevronRight,
} from "lucide-react";
import type {
  Property, Room, Appliance, MaintenanceEvent,
  EmergencyInfo, HandbookConfig, Json,
} from "@/types/database";

// Re-export Document type with alias to avoid conflict with global Document
type DocumentRecord = import("@/types/database").Document;

const emergencyIcons: Record<string, React.ElementType> = {
  droplets: Droplets,
  zap: Zap,
  flame: Flame,
  "cloud-rain": CloudRain,
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

interface PropertyDetailClientProps {
  property: Property & { rooms_count: number; appliances_count: number; completion_percent: number };
  rooms: Room[];
  appliances: Appliance[];
  documents: DocumentRecord[];
  maintenanceEvents: MaintenanceEvent[];
  emergencyInfo: EmergencyInfo | null;
  handbookConfig: HandbookConfig | null;
}

// Helper to safely extract emergency info fields which are stored as Json
function getEmergencyString(value: Json | null | undefined): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "description" in value) return String((value as Record<string, unknown>).description);
  return "";
}

function getEmergencyContacts(value: Json): Array<{ name: string; role: string; phone: string; available: string }> {
  if (Array.isArray(value)) return value as Array<{ name: string; role: string; phone: string; available: string }>;
  return [];
}

function getEmergencyProcedures(value: Json): Array<{ title: string; icon: string; steps: string[] }> {
  if (Array.isArray(value)) return value as Array<{ title: string; icon: string; steps: string[] }>;
  return [];
}

function getRoomPaintColors(value: Json): Array<{ name: string; brand: string; code: string; hex: string; location: string }> {
  if (Array.isArray(value)) return value as Array<{ name: string; brand: string; code: string; hex: string; location: string }>;
  return [];
}

export function PropertyDetailClient({
  property,
  rooms,
  appliances,
  documents,
  maintenanceEvents,
  emergencyInfo,
  handbookConfig,
}: PropertyDetailClientProps) {
  const [applianceSearch, setApplianceSearch] = useState("");
  const [applianceCategory, setApplianceCategory] = useState("all");

  const filteredAppliances = appliances.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(applianceSearch.toLowerCase()) ||
      (a.brand || "").toLowerCase().includes(applianceSearch.toLowerCase()) ||
      (a.model || "").toLowerCase().includes(applianceSearch.toLowerCase());
    // Note: DB doesn't have a 'category' field on appliances; filter by location or skip
    const matchesCategory = applianceCategory === "all" || a.location === applianceCategory;
    return matchesSearch && matchesCategory;
  });

  const locations = [...new Set(appliances.map((a) => a.location).filter(Boolean))] as string[];

  const warrantyActive = appliances.filter(
    (a) => a.warranty_expiration && new Date(a.warranty_expiration) > new Date()
  ).length;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumb and header */}
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center text-sm text-stone hover:text-hearth transition-colors mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <PlaceholderImage type="house" seed={property.id} className="h-16 w-16 rounded-xl shrink-0" />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-hearth">{property.name}</h1>
                <Badge variant="secondary" className={property.occupancy_status === "rental" ? "bg-ember/10 text-ember" : "bg-sage/10 text-sage"}>
                  {property.occupancy_status === "rental" ? "Rental" : property.occupancy_status === "vacation" ? "Vacation" : "Primary"}
                </Badge>
              </div>
              <p className="text-stone flex items-center gap-1 mt-1">
                <MapPin className="h-4 w-4" />
                {property.address_line1}{property.address_line2 ? `, ${property.address_line2}` : ""}, {property.city}, {property.state} {property.zip}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {handbookConfig?.published && handbookConfig.share_id && (
              <Link href={`/handbook/${handbookConfig.share_id}`}>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" /> View Handbook
                </Button>
              </Link>
            )}
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-1" /> Share
            </Button>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-1" /> Edit
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-white border border-clay/20 p-1 h-auto flex-wrap">
          <TabsTrigger value="overview" className="data-[state=active]:bg-ember data-[state=active]:text-white">Overview</TabsTrigger>
          <TabsTrigger value="rooms" className="data-[state=active]:bg-ember data-[state=active]:text-white">Rooms</TabsTrigger>
          <TabsTrigger value="appliances" className="data-[state=active]:bg-ember data-[state=active]:text-white">Appliances</TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-ember data-[state=active]:text-white">Documents</TabsTrigger>
          <TabsTrigger value="maintenance" className="data-[state=active]:bg-ember data-[state=active]:text-white">Maintenance</TabsTrigger>
          <TabsTrigger value="emergency" className="data-[state=active]:bg-ember data-[state=active]:text-white">Emergency</TabsTrigger>
          <TabsTrigger value="handbook" className="data-[state=active]:bg-ember data-[state=active]:text-white">Handbook</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 bg-white border-clay/20">
              <CardContent className="p-6">
                <PlaceholderImage type="house" seed={property.id + "-main"} className="h-64 w-full rounded-xl mb-6" label={property.name} />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Bedrooms", value: property.beds ?? "—", icon: Home },
                    { label: "Bathrooms", value: property.baths ?? "—", icon: Home },
                    { label: "Sq Ft", value: property.sqft ? property.sqft.toLocaleString() : "—", icon: Building2 },
                    { label: "Year Built", value: property.year_built ?? "—", icon: Calendar },
                  ].map((item) => (
                    <div key={item.label} className="text-center p-3 bg-linen rounded-xl">
                      <div className="text-2xl font-heading font-bold text-hearth">{item.value}</div>
                      <div className="text-xs text-stone mt-1">{item.label}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card className="bg-white border-clay/20">
                <CardContent className="p-5">
                  <h3 className="font-heading font-semibold text-hearth mb-3">Documentation Progress</h3>
                  <div className="space-y-3">
                    <Progress value={property.completion_percent} className="h-3" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-stone">{property.completion_percent}% complete</span>
                      <span className={`font-medium ${property.completion_percent > 80 ? "text-sage" : "text-caution"}`}>
                        {property.completion_percent > 80 ? "Almost there!" : "Keep going!"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-clay/20">
                <CardContent className="p-5">
                  <h3 className="font-heading font-semibold text-hearth mb-3">Quick Stats</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Rooms", value: rooms.length, icon: Home },
                      { label: "Appliances", value: appliances.length, icon: Refrigerator },
                      { label: "Documents", value: documents.length, icon: FileText },
                      { label: "Active Warranties", value: warrantyActive, icon: Shield },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <span className="text-sm text-stone flex items-center gap-2">
                          <item.icon className="h-4 w-4" /> {item.label}
                        </span>
                        <span className="font-medium text-hearth">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {property.rent_amount && (
                <Card className="bg-white border-clay/20">
                  <CardContent className="p-5">
                    <h3 className="font-heading font-semibold text-hearth mb-3">Rental Info</h3>
                    <div className="flex items-center gap-2 text-lg font-heading font-bold text-hearth">
                      <DollarSign className="h-5 w-5 text-ember" />
                      ${property.rent_amount.toLocaleString()}/mo
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Rooms Tab */}
        <TabsContent value="rooms" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl font-semibold text-hearth">Rooms ({rooms.length})</h2>
            <Button className="bg-ember hover:bg-ember-dark text-white" size="sm">
              <Home className="h-4 w-4 mr-1" /> Add Room
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger-children">
            {rooms.map((room) => {
              const roomAppliances = appliances.filter((a) => a.room_id === room.id);
              const paintColors = getRoomPaintColors(room.paint_colors);
              return (
                <Link key={room.id} href={`/property/${property.id}/room/${room.id}`}>
                  <Card className="bg-white border-clay/20 hover:shadow-lg hover:border-ember/20 transition-all duration-300 group cursor-pointer overflow-hidden">
                    <PlaceholderImage type={room.type || "room"} seed={room.id} className="h-36 w-full rounded-none" label={room.name} />
                    <CardContent className="p-4">
                      <h3 className="font-heading font-semibold text-hearth group-hover:text-ember transition-colors">{room.name}</h3>
                      <div className="flex items-center gap-3 mt-2 text-xs text-stone">
                        <span className="flex items-center gap-1">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: paintColors[0]?.hex || "#ccc" }} />
                          {paintColors.length} colors
                        </span>
                        <span>{roomAppliances.length} appliances</span>
                      </div>
                      <div className="flex items-center mt-2 text-xs text-ember font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        View details <ChevronRight className="h-3 w-3 ml-0.5" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
          {rooms.length === 0 && (
            <div className="text-center py-12">
              <Home className="h-10 w-10 text-stone/30 mx-auto mb-3" />
              <p className="text-stone">No rooms added yet. Add your first room!</p>
            </div>
          )}
        </TabsContent>

        {/* Appliances Tab */}
        <TabsContent value="appliances" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="font-heading text-xl font-semibold text-hearth">Appliances ({appliances.length})</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone" />
                <Input
                  placeholder="Search appliances..."
                  className="pl-10 w-64 bg-white"
                  value={applianceSearch}
                  onChange={(e) => setApplianceSearch(e.target.value)}
                />
              </div>
              {locations.length > 0 && (
                <select
                  className="h-9 rounded-md border border-input bg-white px-3 text-sm"
                  value={applianceCategory}
                  onChange={(e) => setApplianceCategory(e.target.value)}
                >
                  <option value="all">All Locations</option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
            {filteredAppliances.map((appliance) => {
              const warrantyValid = appliance.warranty_expiration && new Date(appliance.warranty_expiration) > new Date();
              const room = rooms.find((r) => r.id === appliance.room_id);
              return (
                <Link key={appliance.id} href={`/property/${property.id}/appliance/${appliance.id}`}>
                  <Card className="bg-white border-clay/20 hover:shadow-lg hover:border-ember/20 transition-all duration-300 group cursor-pointer">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="h-11 w-11 rounded-xl bg-ember/10 flex items-center justify-center">
                          <Refrigerator className="h-5 w-5 text-ember" />
                        </div>
                        <Badge variant="secondary" className={
                          appliance.status === "good" ? "bg-sage/10 text-sage" :
                          appliance.status === "needs_attention" ? "bg-caution/10 text-caution" :
                          "bg-alert/10 text-alert"
                        }>
                          {appliance.status === "good" ? "Good" : appliance.status === "needs_attention" ? "Needs Attention" : "Replace Soon"}
                        </Badge>
                      </div>
                      <h3 className="font-heading font-semibold text-hearth group-hover:text-ember transition-colors">{appliance.name}</h3>
                      <p className="text-sm text-stone">{appliance.brand || "—"} · {appliance.model || "—"}</p>
                      {room && <p className="text-xs text-stone/70 mt-1">{room.name}</p>}
                      <div className="mt-3 flex items-center gap-2">
                        <Shield className={`h-3.5 w-3.5 ${warrantyValid ? "text-sage" : "text-stone/40"}`} />
                        <span className={`text-xs ${warrantyValid ? "text-sage" : "text-stone/60"}`}>
                          {warrantyValid ? `Warranty until ${new Date(appliance.warranty_expiration!).getFullYear()}` : "Warranty expired"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
          {filteredAppliances.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-10 w-10 text-stone/30 mx-auto mb-3" />
              <p className="text-stone">No appliances found matching your search.</p>
            </div>
          )}
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl font-semibold text-hearth">Documents ({documents.length})</h2>
            <Button className="bg-ember hover:bg-ember-dark text-white" size="sm">
              <FileText className="h-4 w-4 mr-1" /> Upload Document
            </Button>
          </div>
          <div className="grid gap-3">
            {documents.map((doc) => (
              <Card key={doc.id} className="bg-white border-clay/20 hover:shadow-sm transition-all">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-slate-brand/10 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-slate-brand" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-hearth text-sm truncate">{doc.name}</div>
                    <div className="text-xs text-stone">
                      {doc.category}
                      {doc.file_size ? ` · ${(doc.file_size / 1024).toFixed(0)} KB` : ""}
                      {doc.uploaded_at ? ` · Uploaded ${formatDate(doc.uploaded_at)}` : ""}
                    </div>
                  </div>
                  <Badge variant="secondary" className="capitalize">{doc.category}</Badge>
                  {doc.file_url && (
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon" className="shrink-0">
                        <Download className="h-4 w-4 text-stone" />
                      </Button>
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          {documents.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-10 w-10 text-stone/30 mx-auto mb-3" />
              <p className="text-stone">No documents uploaded yet.</p>
            </div>
          )}
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="space-y-6">
          <h2 className="font-heading text-xl font-semibold text-hearth">Maintenance History</h2>
          {maintenanceEvents.length === 0 ? (
            <div className="text-center py-12">
              <Wrench className="h-10 w-10 text-stone/30 mx-auto mb-3" />
              <p className="text-stone">No maintenance events recorded yet.</p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-px bg-clay/30" />
              <div className="space-y-4">
                {maintenanceEvents.map((event) => (
                  <div key={event.id} className="relative flex gap-4 pl-12">
                    <div className={`absolute left-3 top-1.5 h-5 w-5 rounded-full border-2 border-white z-10 ${
                      event.type === "upcoming" ? "bg-ember" :
                      event.type === "scheduled" ? "bg-caution" : "bg-sage"
                    }`} />
                    <Card className="flex-1 bg-white border-clay/20">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-hearth">{event.title}</h4>
                              <Badge variant="secondary" className={
                                event.type === "upcoming" ? "bg-ember/10 text-ember" :
                                event.type === "scheduled" ? "bg-caution/10 text-caution" :
                                "bg-sage/10 text-sage"
                              }>
                                {event.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-stone">{event.description}</p>
                            {event.provider && (
                              <p className="text-xs text-stone/70 mt-1">Provider: {event.provider}</p>
                            )}
                          </div>
                          <div className="text-right shrink-0 ml-4">
                            {event.date && <div className="text-sm font-medium text-hearth">{formatDate(event.date)}</div>}
                            {event.cost !== null && event.cost !== undefined && (
                              <div className="text-sm text-stone">${event.cost}</div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Emergency Tab */}
        <TabsContent value="emergency" className="space-y-6">
          <h2 className="font-heading text-xl font-semibold text-hearth">Emergency Information</h2>

          {emergencyInfo ? (
            <>
              {/* Shutoff locations */}
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { title: "Water Shutoff", icon: Droplets, color: "bg-slate-brand/10 text-slate-brand", info: getEmergencyString(emergencyInfo.water_shutoff) },
                  { title: "Electric Panel", icon: Zap, color: "bg-caution/10 text-caution", info: getEmergencyString(emergencyInfo.electric_shutoff) },
                  { title: "Gas Shutoff", icon: Flame, color: "bg-alert/10 text-alert", info: getEmergencyString(emergencyInfo.gas_shutoff) },
                  { title: "Fire Extinguishers", icon: Shield, color: "bg-ember/10 text-ember", info: getEmergencyString(emergencyInfo.fire_extinguishers) },
                ].map((item) => (
                  <Card key={item.title} className="bg-white border-clay/20">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`h-10 w-10 rounded-xl ${item.color} flex items-center justify-center`}>
                          <item.icon className="h-5 w-5" />
                        </div>
                        <h3 className="font-heading font-semibold text-hearth">{item.title}</h3>
                      </div>
                      <p className="text-sm text-stone leading-relaxed">{item.info || "Not documented yet."}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Emergency contacts */}
              {getEmergencyContacts(emergencyInfo.emergency_contacts).length > 0 && (
                <Card className="bg-white border-clay/20">
                  <CardHeader>
                    <CardTitle className="font-heading text-lg">Emergency Contacts</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-border">
                      {getEmergencyContacts(emergencyInfo.emergency_contacts).map((contact, i) => (
                        <div key={i} className="flex items-center justify-between p-4">
                          <div>
                            <div className="font-medium text-hearth text-sm">{contact.name}</div>
                            <div className="text-xs text-stone">{contact.role} · {contact.available}</div>
                          </div>
                          <a href={`tel:${contact.phone}`} className="flex items-center gap-2 text-sm text-ember hover:text-ember-dark font-medium">
                            <Phone className="h-4 w-4" /> {contact.phone}
                          </a>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Emergency procedures */}
              {getEmergencyProcedures(emergencyInfo.emergency_procedures).length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-heading text-lg font-semibold text-hearth">Emergency Procedures</h3>
                  {getEmergencyProcedures(emergencyInfo.emergency_procedures).map((procedure, i) => {
                    const Icon = emergencyIcons[procedure.icon] || AlertTriangle;
                    return (
                      <Card key={i} className="bg-white border-clay/20">
                        <CardContent className="p-5">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 rounded-xl bg-alert/10 flex items-center justify-center">
                              <Icon className="h-5 w-5 text-alert" />
                            </div>
                            <h4 className="font-heading font-semibold text-hearth">{procedure.title}</h4>
                          </div>
                          <ol className="space-y-2">
                            {procedure.steps.map((step, j) => (
                              <li key={j} className="flex items-start gap-3 text-sm text-stone">
                                <span className="h-6 w-6 rounded-full bg-linen flex items-center justify-center text-xs font-semibold text-hearth shrink-0">{j + 1}</span>
                                {step}
                              </li>
                            ))}
                          </ol>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="h-10 w-10 text-stone/30 mx-auto mb-3" />
              <p className="text-stone">No emergency information documented yet.</p>
            </div>
          )}
        </TabsContent>

        {/* Handbook Tab */}
        <TabsContent value="handbook" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl font-semibold text-hearth">Tenant Handbook</h2>
            {handbookConfig?.published ? (
              <Badge className="bg-sage/10 text-sage border-sage/20">Published</Badge>
            ) : (
              <Badge className="bg-stone/10 text-stone border-stone/20">Draft</Badge>
            )}
          </div>
          <Card className="bg-white border-clay/20">
            <CardContent className="p-8 text-center">
              {handbookConfig?.published && handbookConfig.share_id ? (
                <>
                  <div className="h-16 w-16 rounded-2xl bg-sage/10 flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-8 w-8 text-sage" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-hearth mb-2">Handbook is Live!</h3>
                  <p className="text-stone mb-6 max-w-md mx-auto">Your tenant handbook is published and ready to share. Tenants can access it via the link or QR code.</p>
                  <div className="flex items-center justify-center gap-3">
                    <Link href={`/handbook/${handbookConfig.share_id}`}>
                      <Button className="bg-ember hover:bg-ember-dark text-white">
                        <Eye className="h-4 w-4 mr-2" /> View Handbook
                      </Button>
                    </Link>
                    <Button variant="outline">
                      <Share2 className="h-4 w-4 mr-2" /> Copy Link
                    </Button>
                  </div>
                  <div className="mt-6 p-4 bg-linen rounded-xl inline-block">
                    <div className="text-xs text-stone mb-2">Share URL</div>
                    <code className="text-sm font-mono text-hearth">threshold.app/handbook/{handbookConfig.share_id}</code>
                  </div>
                </>
              ) : (
                <>
                  <div className="h-16 w-16 rounded-2xl bg-clay/10 flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-8 w-8 text-clay" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-hearth mb-2">Handbook Not Yet Published</h3>
                  <p className="text-stone mb-6 max-w-md mx-auto">Complete your property documentation and publish a beautiful handbook for your tenants.</p>
                  <Button className="bg-ember hover:bg-ember-dark text-white">
                    Publish Handbook
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
