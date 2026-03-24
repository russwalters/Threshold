"use client";

import { use } from "react";
import Link from "next/link";
import { getProperty, getRoom, getAppliancesForRoom } from "@/data/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PlaceholderImage } from "@/components/shared/placeholder-image";
import {
  ArrowLeft, Edit, Lightbulb, Paintbrush, Wrench, Refrigerator,
  ChevronRight, StickyNote, Plug, Shield, Home,
} from "lucide-react";

export default function RoomDetailPage({ params }: { params: Promise<{ id: string; roomId: string }> }) {
  const { id, roomId } = use(params);
  const property = getProperty(id);
  const room = getRoom(id, roomId);
  const appliances = getAppliancesForRoom(id, roomId);

  if (!property || !room) {
    return (
      <div className="max-w-7xl mx-auto text-center py-20">
        <h1 className="font-heading text-2xl text-hearth mb-4">Room not found</h1>
        <Link href={`/property/${id}`}><Button variant="outline">Back to Property</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <Link href={`/property/${id}`} className="inline-flex items-center text-sm text-stone hover:text-hearth transition-colors mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" /> {property.name}
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-semibold text-hearth">{room.name}</h1>
          <p className="text-stone capitalize mt-1">{room.type} · {property.name}</p>
        </div>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-1" /> Edit Room
        </Button>
      </div>

      {/* Room photo */}
      <PlaceholderImage type={room.type} seed={room.id + "-detail"} className="h-64 sm:h-80 w-full rounded-2xl mb-8" label={room.name} />

      <div className="grid md:grid-cols-2 gap-6">
        {/* Paint Colors */}
        <Card className="bg-white border-clay/20">
          <CardHeader>
            <CardTitle className="font-heading text-lg flex items-center gap-2">
              <Paintbrush className="h-5 w-5 text-ember" /> Paint Colors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {room.paintColors.map((color, i) => (
              <div key={i} className="flex items-center gap-4">
                <div
                  className="h-12 w-12 rounded-xl border-2 border-white shadow-md shrink-0"
                  style={{ backgroundColor: color.hex }}
                />
                <div>
                  <div className="font-medium text-hearth text-sm">{color.name}</div>
                  <div className="text-xs text-stone">{color.brand} · {color.code}</div>
                  <div className="text-xs text-stone/70">{color.location}</div>
                </div>
              </div>
            ))}
            {room.paintColors.length === 0 && (
              <p className="text-sm text-stone">No paint colors documented yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Light Bulbs */}
        <Card className="bg-white border-clay/20">
          <CardHeader>
            <CardTitle className="font-heading text-lg flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-caution" /> Light Bulbs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {room.lightBulbs.map((bulb, i) => (
              <div key={i} className="p-3 bg-linen rounded-xl">
                <div className="font-medium text-hearth text-sm">{bulb.location}</div>
                <div className="text-xs text-stone mt-1">
                  <span className="font-mono">{bulb.type}</span> · {bulb.wattage} · {bulb.base}
                </div>
              </div>
            ))}
            {room.lightBulbs.length === 0 && (
              <p className="text-sm text-stone">No light bulbs documented yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Fixtures */}
        <Card className="bg-white border-clay/20">
          <CardHeader>
            <CardTitle className="font-heading text-lg flex items-center gap-2">
              <Plug className="h-5 w-5 text-slate-brand" /> Fixtures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {room.fixtures.map((fixture, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-stone">
                  <div className="h-1.5 w-1.5 rounded-full bg-clay mt-2 shrink-0" />
                  {fixture}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Features */}
        <Card className="bg-white border-clay/20">
          <CardHeader>
            <CardTitle className="font-heading text-lg flex items-center gap-2">
              <Home className="h-5 w-5 text-sage" /> Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {room.features.map((feature, i) => (
                <Badge key={i} variant="secondary" className="bg-linen text-hearth">{feature}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appliances in this room */}
      {appliances.length > 0 && (
        <div className="mt-8">
          <h2 className="font-heading text-xl font-semibold text-hearth mb-4">Appliances in this Room</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {appliances.map((appliance) => {
              const warrantyValid = new Date(appliance.warrantyExpiry) > new Date("2026-03-23");
              return (
                <Link key={appliance.id} href={`/property/${id}/appliance/${appliance.id}`}>
                  <Card className="bg-white border-clay/20 hover:shadow-lg hover:border-ember/20 transition-all group cursor-pointer">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <div className="h-10 w-10 rounded-xl bg-ember/10 flex items-center justify-center">
                          <Refrigerator className="h-5 w-5 text-ember" />
                        </div>
                        <Badge variant="secondary" className={warrantyValid ? "bg-sage/10 text-sage" : "bg-stone/10 text-stone"}>
                          {warrantyValid ? "Under Warranty" : "Expired"}
                        </Badge>
                      </div>
                      <h3 className="font-medium text-hearth group-hover:text-ember transition-colors">{appliance.name}</h3>
                      <p className="text-sm text-stone">{appliance.brand} · {appliance.model}</p>
                      <div className="flex items-center mt-2 text-xs text-ember font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        View details <ChevronRight className="h-3 w-3 ml-0.5" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Notes */}
      {room.notes && (
        <Card className="bg-white border-clay/20 mt-8">
          <CardHeader>
            <CardTitle className="font-heading text-lg flex items-center gap-2">
              <StickyNote className="h-5 w-5 text-caution" /> Notes & Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-stone leading-relaxed">{room.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
