"use client";

import { use } from "react";
import Link from "next/link";
import { getProperty, getAppliance, getRoomForAppliance } from "@/data/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PlaceholderImage } from "@/components/shared/placeholder-image";
import {
  ArrowLeft, Edit, Shield, Calendar, Hash, ExternalLink,
  Wrench, Lightbulb, DollarSign, Clock, CheckCircle2,
  AlertCircle, AlertTriangle, Phone, Refrigerator, MapPin,
} from "lucide-react";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

const serviceTypeColors: Record<string, string> = {
  repair: "bg-alert/10 text-alert",
  maintenance: "bg-sage/10 text-sage",
  inspection: "bg-slate-brand/10 text-slate-brand",
  installation: "bg-ember/10 text-ember",
};

export default function ApplianceDetailPage({ params }: { params: Promise<{ id: string; applianceId: string }> }) {
  const { id, applianceId } = use(params);
  const property = getProperty(id);
  const appliance = getAppliance(id, applianceId);
  const room = getRoomForAppliance(id, applianceId);

  if (!property || !appliance) {
    return (
      <div className="max-w-7xl mx-auto text-center py-20">
        <h1 className="font-heading text-2xl text-hearth mb-4">Appliance not found</h1>
        <Link href={`/property/${id}`}><Button variant="outline">Back to Property</Button></Link>
      </div>
    );
  }

  const warrantyValid = new Date(appliance.warrantyExpiry) > new Date("2026-03-23");
  const warrantyDays = Math.ceil(
    (new Date(appliance.warrantyExpiry).getTime() - new Date("2026-03-23").getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <Link href={`/property/${id}`} className="inline-flex items-center text-sm text-stone hover:text-hearth transition-colors mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" /> {property.name}
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
              {appliance.brand} · <span className="font-mono text-sm">{appliance.model}</span>
              {room && <> · <Link href={`/property/${id}/room/${room.id}`} className="text-ember hover:underline">{room.name}</Link></>}
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
          <PlaceholderImage type="appliance" seed={appliance.id} className="h-64 w-full rounded-2xl" label={`${appliance.brand} ${appliance.name}`} />

          {/* Details grid */}
          <Card className="bg-white border-clay/20">
            <CardHeader>
              <CardTitle className="font-heading text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Brand", value: appliance.brand },
                  { label: "Model", value: appliance.model, mono: true },
                  { label: "Serial Number", value: appliance.serialNumber, mono: true },
                  { label: "Category", value: appliance.category },
                  { label: "Purchase Date", value: formatDate(appliance.purchaseDate) },
                  { label: "Location", value: room?.name || "—" },
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
              {appliance.serviceHistory.length > 0 ? (
                <div className="space-y-4">
                  {appliance.serviceHistory.map((event) => (
                    <div key={event.id} className="flex items-start gap-4 p-4 bg-linen rounded-xl">
                      <div className={`h-8 w-8 rounded-lg ${serviceTypeColors[event.type] || "bg-stone/10 text-stone"} flex items-center justify-center shrink-0`}>
                        <Wrench className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-hearth text-sm">{event.description}</div>
                          <Badge variant="secondary" className="capitalize text-xs">{event.type}</Badge>
                        </div>
                        <div className="text-xs text-stone mt-1">
                          {event.provider} · {formatDate(event.date)}
                          {event.cost > 0 && <> · ${event.cost}</>}
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
                  <div className="text-sm text-stone">Expires {formatDate(appliance.warrantyExpiry)}</div>
                  <div className="text-xs text-sage mt-1">{warrantyDays} days remaining</div>
                </>
              ) : (
                <>
                  <div className="text-lg font-heading font-bold text-stone mb-1">Expired</div>
                  <div className="text-sm text-stone">Expired {formatDate(appliance.warrantyExpiry)}</div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Manual link */}
          <Card className="bg-white border-clay/20">
            <CardContent className="p-5">
              <h3 className="font-heading font-semibold text-hearth mb-3">Product Manual</h3>
              <a href={appliance.manualUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 w-full justify-start border border-input rounded-md px-4 py-2 text-sm font-medium hover:bg-accent transition-colors">
                <ExternalLink className="h-4 w-4" />
                View Manual Online
              </a>
            </CardContent>
          </Card>

          {/* Operating tips */}
          <Card className="bg-white border-clay/20">
            <CardHeader>
              <CardTitle className="font-heading text-lg flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-caution" /> Operating Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {appliance.operatingTips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-stone">
                  <CheckCircle2 className="h-4 w-4 text-sage mt-0.5 shrink-0" />
                  <span>{tip}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
