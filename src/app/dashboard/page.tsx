"use client";

import Link from "next/link";
import { properties, getRecentActivities } from "@/data/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PlaceholderImage } from "@/components/shared/placeholder-image";
import {
  Home,
  Building2,
  Plus,
  Wrench,
  FileText,
  Refrigerator,
  ArrowRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Upload,
  Settings,
  TrendingUp,
} from "lucide-react";

const activityIcons: Record<string, React.ElementType> = {
  appliance_added: Refrigerator,
  document_uploaded: Upload,
  maintenance_completed: Wrench,
  room_updated: Home,
  handbook_published: BookOpen,
  property_created: Building2,
};

const activityColors: Record<string, string> = {
  appliance_added: "bg-ember/10 text-ember",
  document_uploaded: "bg-slate-brand/10 text-slate-brand",
  maintenance_completed: "bg-sage/10 text-sage",
  room_updated: "bg-clay/10 text-clay",
  handbook_published: "bg-good/10 text-good",
  property_created: "bg-brass/10 text-brass",
};

function formatTimeAgo(timestamp: string): string {
  const now = new Date("2026-03-23T12:00:00Z");
  const date = new Date(timestamp);
  const days = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

export default function DashboardPage() {
  const totalAppliances = properties.reduce((sum, p) => sum + p.appliances.length, 0);
  const totalDocuments = properties.reduce((sum, p) => sum + p.documents.length, 0);
  const upcomingMaintenance = properties.reduce(
    (sum, p) => sum + p.maintenanceHistory.filter((m) => m.type === "upcoming" || m.type === "scheduled").length,
    0
  );
  const activities = getRecentActivities(8);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl font-semibold text-hearth">Welcome back, Jordan</h1>
          <p className="text-stone mt-1">Here&apos;s what&apos;s happening with your properties.</p>
        </div>
        <Link href="/property/new">
          <Button className="bg-ember hover:bg-ember-dark text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </Link>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Properties", value: properties.length, icon: Building2, color: "text-ember", bg: "bg-ember/10" },
          { label: "Appliances", value: totalAppliances, icon: Refrigerator, color: "text-sage", bg: "bg-sage/10" },
          { label: "Upcoming Maintenance", value: upcomingMaintenance, icon: Wrench, color: "text-caution", bg: "bg-caution/10" },
          { label: "Documents", value: totalDocuments, icon: FileText, color: "text-slate-brand", bg: "bg-slate-brand/10" },
        ].map((stat) => (
          <Card key={stat.label} className="bg-white border-clay/20">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <TrendingUp className="h-4 w-4 text-sage" />
              </div>
              <div className="text-2xl font-heading font-bold text-hearth">{stat.value}</div>
              <div className="text-sm text-stone">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Property cards */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-heading text-xl font-semibold text-hearth">Your Properties</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {properties.map((property) => (
              <Link key={property.id} href={`/property/${property.id}`}>
                <Card className="bg-white border-clay/20 hover:shadow-lg hover:border-ember/20 transition-all duration-300 group cursor-pointer overflow-hidden">
                  <PlaceholderImage
                    type="house"
                    seed={property.id}
                    className="h-40 w-full rounded-none rounded-t-xl"
                    label={property.name}
                  />
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-heading text-lg font-semibold text-hearth group-hover:text-ember transition-colors">{property.name}</h3>
                        <p className="text-sm text-stone">{property.city}, {property.state}</p>
                      </div>
                      <Badge variant="secondary" className={property.occupancy === "rental" ? "bg-ember/10 text-ember" : "bg-sage/10 text-sage"}>
                        {property.occupancy === "rental" ? "Rental" : "Primary"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-stone mb-3">
                      <span>{property.beds} bed</span>
                      <span>·</span>
                      <span>{property.baths} bath</span>
                      <span>·</span>
                      <span>{property.sqft.toLocaleString()} sqft</span>
                    </div>
                    {property.rentAmount && (
                      <div className="text-sm font-medium text-hearth mb-3">${property.rentAmount.toLocaleString()}/mo</div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <Progress value={property.completionPercent} className="h-2" />
                      </div>
                      <span className={`text-xs font-medium ${property.completionPercent > 80 ? "text-sage" : "text-caution"}`}>
                        {property.completionPercent}% documented
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-xs text-stone">
                      <span className="flex items-center gap-1"><Home className="h-3.5 w-3.5" /> {property.rooms.length} rooms</span>
                      <span className="flex items-center gap-1"><Refrigerator className="h-3.5 w-3.5" /> {property.appliances.length} appliances</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}

            {/* Add property card */}
            <Link href="/property/new">
              <Card className="bg-white/50 border-dashed border-clay/30 hover:border-ember/30 hover:bg-white transition-all duration-300 cursor-pointer flex flex-col items-center justify-center min-h-[320px]">
                <CardContent className="p-6 text-center">
                  <div className="h-14 w-14 rounded-2xl bg-ember/10 flex items-center justify-center mx-auto mb-4">
                    <Plus className="h-7 w-7 text-ember" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-hearth mb-1">Add a Property</h3>
                  <p className="text-sm text-stone">Start documenting a new home</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Activity feed */}
        <div>
          <h2 className="font-heading text-xl font-semibold text-hearth mb-4">Recent Activity</h2>
          <Card className="bg-white border-clay/20">
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {activities.map((activity) => {
                  const Icon = activityIcons[activity.type] || Clock;
                  const colorClass = activityColors[activity.type] || "bg-stone/10 text-stone";
                  return (
                    <div key={activity.id} className="flex items-start gap-3 p-4 hover:bg-linen/50 transition-colors">
                      <div className={`h-9 w-9 rounded-lg ${colorClass} flex items-center justify-center shrink-0 mt-0.5`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-hearth">{activity.title}</div>
                        <div className="text-xs text-stone mt-0.5 line-clamp-2">{activity.description}</div>
                        <div className="text-xs text-stone/60 mt-1">{formatTimeAgo(activity.timestamp)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
