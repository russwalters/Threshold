"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
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
  Clock,
  BookOpen,
  Upload,
  TrendingUp,
  Trash2,
} from "lucide-react";
import { deleteProperty } from "@/app/actions/properties";
import type { Property, ActivityLog } from "@/types/database";

interface PropertyWithCounts extends Property {
  rooms_count: number;
  appliances_count: number;
  completion_percent: number;
}

interface DashboardStats {
  total_properties: number;
  total_appliances: number;
  total_rooms: number;
  upcoming_maintenance: number;
}

interface DashboardClientProps {
  properties: Property[];
  stats: DashboardStats;
  activities: ActivityLog[];
  userName: string;
  propertyCounts: Record<string, { rooms: number; appliances: number; completion: number }>;
}

const activityIcons: Record<string, React.ElementType> = {
  appliance_added: Refrigerator,
  document_uploaded: Upload,
  maintenance_completed: Wrench,
  room_added: Home,
  room_updated: Home,
  handbook_published: BookOpen,
  property_created: Building2,
  maintenance_created: Wrench,
};

const activityColors: Record<string, string> = {
  appliance_added: "bg-ember/10 text-ember",
  document_uploaded: "bg-slate-brand/10 text-slate-brand",
  maintenance_completed: "bg-sage/10 text-sage",
  room_added: "bg-clay/10 text-clay",
  room_updated: "bg-clay/10 text-clay",
  handbook_published: "bg-good/10 text-good",
  property_created: "bg-brass/10 text-brass",
  maintenance_created: "bg-caution/10 text-caution",
};

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const days = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

export function DashboardClient({ properties, stats, activities, userName, propertyCounts }: DashboardClientProps) {
  const firstName = userName ? userName.split(" ")[0] : "there";

  async function handleDeleteProperty(propertyId: string) {
    if (!confirm("Are you sure you want to delete this property? This cannot be undone.")) return;
    await deleteProperty(propertyId);
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl font-semibold text-hearth">Welcome back, {firstName}</h1>
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
          { label: "Properties", value: stats.total_properties, icon: Building2, color: "text-ember", bg: "bg-ember/10" },
          { label: "Appliances", value: stats.total_appliances, icon: Refrigerator, color: "text-sage", bg: "bg-sage/10" },
          { label: "Upcoming Maintenance", value: stats.upcoming_maintenance, icon: Wrench, color: "text-caution", bg: "bg-caution/10" },
          { label: "Rooms", value: stats.total_rooms, icon: Home, color: "text-slate-brand", bg: "bg-slate-brand/10" },
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

      {properties.length === 0 ? (
        /* Empty state */
        <div className="text-center py-20">
          <div className="h-20 w-20 rounded-3xl bg-ember/10 flex items-center justify-center mx-auto mb-6">
            <Building2 className="h-10 w-10 text-ember" />
          </div>
          <h2 className="font-heading text-2xl font-semibold text-hearth mb-3">Add your first property</h2>
          <p className="text-stone mb-8 max-w-md mx-auto">
            Start documenting your home by adding a property. Track rooms, appliances, maintenance, and more.
          </p>
          <Link href="/property/new">
            <Button className="bg-ember hover:bg-ember-dark text-white" size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Add Your First Property
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Property cards */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-heading text-xl font-semibold text-hearth">Your Properties</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {properties.map((property) => {
                const counts = propertyCounts[property.id] || { rooms: 0, appliances: 0, completion: 0 };
                return (
                  <div key={property.id} className="relative group">
                    <Link href={`/property/${property.id}`}>
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
                            <Badge variant="secondary" className={property.occupancy_status === "rental" ? "bg-ember/10 text-ember" : "bg-sage/10 text-sage"}>
                              {property.occupancy_status === "rental" ? "Rental" : property.occupancy_status === "vacation" ? "Vacation" : "Primary"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-stone mb-3">
                            {property.beds && <span>{property.beds} bed</span>}
                            {property.beds && property.baths && <span>·</span>}
                            {property.baths && <span>{property.baths} bath</span>}
                            {property.sqft && <><span>·</span><span>{property.sqft.toLocaleString()} sqft</span></>}
                          </div>
                          {property.rent_amount && (
                            <div className="text-sm font-medium text-hearth mb-3">${property.rent_amount.toLocaleString()}/mo</div>
                          )}
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <Progress value={counts.completion} className="h-2" />
                            </div>
                            <span className={`text-xs font-medium ${counts.completion > 80 ? "text-sage" : "text-caution"}`}>
                              {counts.completion}% documented
                            </span>
                          </div>
                          <div className="mt-3 flex items-center gap-4 text-xs text-stone">
                            <span className="flex items-center gap-1"><Home className="h-3.5 w-3.5" /> {counts.rooms} rooms</span>
                            <span className="flex items-center gap-1"><Refrigerator className="h-3.5 w-3.5" /> {counts.appliances} appliances</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                    <button
                      onClick={() => handleDeleteProperty(property.id)}
                      className="absolute top-2 right-2 h-8 w-8 rounded-lg bg-white/90 hover:bg-alert/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      title="Delete property"
                    >
                      <Trash2 className="h-4 w-4 text-alert" />
                    </button>
                  </div>
                );
              })}

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
                {activities.length === 0 ? (
                  <div className="p-8 text-center">
                    <Clock className="h-8 w-8 text-stone/30 mx-auto mb-2" />
                    <p className="text-sm text-stone">No recent activity yet.</p>
                  </div>
                ) : (
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
                            <div className="text-xs text-stone/60 mt-1">{formatTimeAgo(activity.created_at)}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
