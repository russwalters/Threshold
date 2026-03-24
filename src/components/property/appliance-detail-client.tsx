"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlaceholderImage } from "@/components/shared/placeholder-image";
import {
  ArrowLeft, Edit, Shield, ExternalLink,
  Wrench, Lightbulb, Phone, Refrigerator, CheckCircle2,
} from "lucide-react";
import type { Appliance, ServiceHistory, Room } from "@/types/database";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

const serviceTypeColors: Record<string, string> = {
  repair: "bg-alert/10 text-alert",
  maintenance: "bg-sage/10 text-sage",
  inspection: "bg-slate-brand/10 text-slate-brand",
  installation: "bg-ember/10 text-ember",
};

interface ApplianceDetailClientProps {
  propertyId: string;
  propertyName: string;
  appliance: Appliance & { service_history: ServiceHistory[] };
  room: Room | null;
}

export function ApplianceDetailClient({ propertyId, propertyName, appliance, room }: ApplianceDetailClientProps) {
  const warrantyValid = appliance.warranty_expiration && new Date(appliance.warranty_expiration) > new Date();
  const warrantyDays = appliance.warranty_expiration
    ? Math.ceil((new Date(appliance.warranty_expiration).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const operatingTips = appliance.operating_tips ?? [];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <Link href={`/property/${propertyId}`} className="inline-flex items-center text-sm text-stone hover:text-hearth transition-colors mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" /> {propertyName}
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-2xl bg-ember/10 flex items-center justify-center shrink-0">
            <Refrigerator className="h-7 w-7 text-ember" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-hearth">{appliance.name}</h1>
              <Badge variant="secondary" className={
                appliance.status === "good" ? "bg-sage/10 text-sage" :
                appliance.status === "needs_attention" ? "bg-caution/10 text-caution" :
                "bg-alert/10 text-alert"
              }>
                {appliance.status === "good" ? "Good Condition" : appliance.status === "needs_attention" ? "Needs Attention" : "Replace Soon"}
              </Badge>
            </div>
            <p className="text-stone mt-1">
              {appliance.brand || "—"} · <span className="font-mono text-sm">{appliance.model || "—"}</span>
              {room && <> · <Link href={`/property/${propertyId}/room/${room.id}`} className="text-ember hover:underline">{room.name}</Link></>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-ember hover:bg-ember-dark text-white">
            <Phone className="h-4 w-4 mr-1" /> Request Service
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-1" /> Edit
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="md:col-span-2 space-y-6">
          {/* Photo */}
          <PlaceholderImage type="appliance" seed={appliance.id} className="h-64 w-full rounded-2xl" label={`${appliance.brand || ""} ${appliance.name}`} />

          {/* Details grid */}
          <Card className="bg-white border-clay/20">
            <CardHeader>
              <CardTitle className="font-heading text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Brand", value: appliance.brand || "—" },
                  { label: "Model", value: appliance.model || "—", mono: true },
                  { label: "Serial Number", value: appliance.serial_number || "—", mono: true },
                  { label: "Location", value: appliance.location || room?.name || "—" },
                  { label: "Purchase Date", value: appliance.purchase_date ? formatDate(appliance.purchase_date) : "—" },
                  { label: "Room", value: room?.name || "—" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="text-xs text-stone uppercase tracking-wider mb-1">{item.label}</div>
                    <div className={`text-sm font-medium text-hearth ${item.mono ? "font-mono" : ""}`}>{item.value}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Service History */}
          <Card className="bg-white border-clay/20">
            <CardHeader>
              <CardTitle className="font-heading text-lg flex items-center gap-2">
                <Wrench className="h-5 w-5 text-ember" /> Service History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {appliance.service_history.length > 0 ? (
                <div className="space-y-4">
                  {appliance.service_history.map((event) => (
                    <div key={event.id} className="flex items-start gap-4 p-4 bg-linen rounded-xl">
                      <div className={`h-8 w-8 rounded-lg ${serviceTypeColors[event.type] || "bg-stone/10 text-stone"} flex items-center justify-center shrink-0`}>
                        <Wrench className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-hearth text-sm">{event.description || "Service event"}</div>
                          <Badge variant="secondary" className="capitalize text-xs">{event.type}</Badge>
                        </div>
                        <div className="text-xs text-stone mt-1">
                          {event.provider || "—"} · {formatDate(event.date)}
                          {event.cost !== null && event.cost !== undefined && event.cost > 0 && <> · ${event.cost}</>}
                        </div>
                        {event.notes && <p className="text-xs text-stone/70 mt-1">{event.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Wrench className="h-8 w-8 text-stone/30 mx-auto mb-2" />
                  <p className="text-sm text-stone">No service history recorded yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Warranty card */}
          <Card className={`border-2 ${warrantyValid ? "bg-sage/5 border-sage/30" : "bg-stone/5 border-stone/20"}`}>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Shield className={`h-5 w-5 ${warrantyValid ? "text-sage" : "text-stone"}`} />
                <h3 className="font-heading font-semibold text-hearth">Warranty</h3>
              </div>
              {warrantyValid ? (
                <>
                  <div className="text-lg font-heading font-bold text-sage mb-1">Active</div>
                  <div className="text-sm text-stone">Expires {formatDate(appliance.warranty_expiration!)}</div>
                  <div className="text-xs text-sage mt-1">{warrantyDays} days remaining</div>
                </>
              ) : appliance.warranty_expiration ? (
                <>
                  <div className="text-lg font-heading font-bold text-stone mb-1">Expired</div>
                  <div className="text-sm text-stone">Expired {formatDate(appliance.warranty_expiration)}</div>
                </>
              ) : (
                <>
                  <div className="text-lg font-heading font-bold text-stone mb-1">Not Set</div>
                  <div className="text-sm text-stone">No warranty information recorded.</div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Manual link */}
          {appliance.manual_url && (
            <Card className="bg-white border-clay/20">
              <CardContent className="p-5">
                <h3 className="font-heading font-semibold text-hearth mb-3">Product Manual</h3>
                <a href={appliance.manual_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 w-full justify-start border border-input rounded-md px-4 py-2 text-sm font-medium hover:bg-accent transition-colors">
                  <ExternalLink className="h-4 w-4" />
                  View Manual Online
                </a>
              </CardContent>
            </Card>
          )}

          {/* Operating tips */}
          {operatingTips.length > 0 && (
            <Card className="bg-white border-clay/20">
              <CardHeader>
                <CardTitle className="font-heading text-lg flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-caution" /> Operating Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {operatingTips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-stone">
                    <CheckCircle2 className="h-4 w-4 text-sage mt-0.5 shrink-0" />
                    <span>{tip}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
