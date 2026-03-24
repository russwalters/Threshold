import { getProperties, getProperty, getPropertyStats, getRecentActivity } from "@/app/actions/properties";
import { getProfile } from "@/app/actions/profile";
import { requireAuth } from "@/lib/auth";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export default async function DashboardPage() {
  const user = await requireAuth();

  const [propertiesResult, statsResult, activityResult, profileResult] = await Promise.all([
    getProperties(),
    getPropertyStats(user.id),
    getRecentActivity(user.id, 8),
    getProfile(),
  ]);

  const properties = propertiesResult.data ?? [];
  const stats = statsResult.data ?? {
    total_properties: 0,
    total_appliances: 0,
    total_rooms: 0,
    upcoming_maintenance: 0,
  };
  const activities = activityResult.data ?? [];
  const profile = profileResult.data;

  // Build per-property counts by fetching individual property details
  // We compute completion inline from each property's fields
  const propertyCounts: Record<string, { rooms: number; appliances: number; completion: number }> = {};

  for (const property of properties) {
    const fields = [
      property.address_line1,
      property.city,
      property.state,
      property.zip,
      property.property_type,
      property.occupancy_status,
      property.beds,
      property.baths,
      property.sqft,
      property.year_built,
      property.photo_url,
    ];
    const filledCount = fields.filter((f) => f !== null && f !== undefined && f !== "").length;
    const completion = Math.round((filledCount / fields.length) * 100);

    // We get total rooms/appliances from the stats if there's only one property,
    // otherwise we need per-property counts. For now, use a simple approach:
    // The stats endpoint gives totals; we'll estimate per-property from the total
    // For accurate counts, we'd need per-property queries. Let's use the getProperty action.
    propertyCounts[property.id] = {
      rooms: 0,
      appliances: 0,
      completion,
    };
  }

  // Fetch per-property room/appliance counts in parallel
  if (properties.length > 0) {
    const detailResults = await Promise.all(
      properties.map((p) => getProperty(p.id))
    );
    for (let i = 0; i < properties.length; i++) {
      const detail = detailResults[i].data;
      if (detail && propertyCounts[properties[i].id]) {
        propertyCounts[properties[i].id].rooms = detail.rooms_count;
        propertyCounts[properties[i].id].appliances = detail.appliances_count;
        propertyCounts[properties[i].id].completion = detail.completion_percent;
      }
    }
  }

  return (
    <DashboardClient
      properties={properties}
      stats={stats}
      activities={activities}
      userName={profile?.full_name ?? ""}
      propertyCounts={propertyCounts}
    />
  );
}
