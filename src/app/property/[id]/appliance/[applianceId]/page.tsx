import { notFound } from "next/navigation";
import { getProperty } from "@/app/actions/properties";
import { getAppliance } from "@/app/actions/appliances";
import { getRoom } from "@/app/actions/rooms";
import { ApplianceDetailClient } from "@/components/property/appliance-detail-client";

export default async function ApplianceDetailPage({ params }: { params: Promise<{ id: string; applianceId: string }> }) {
  const { id, applianceId } = await params;

  const [propertyResult, applianceResult] = await Promise.all([
    getProperty(id),
    getAppliance(applianceId),
  ]);

  if (!propertyResult.data || !applianceResult.data) {
    notFound();
  }

  // Fetch the room if the appliance is assigned to one
  let room = null;
  if (applianceResult.data.room_id) {
    const roomResult = await getRoom(applianceResult.data.room_id);
    room = roomResult.data;
  }

  return (
    <ApplianceDetailClient
      propertyId={id}
      propertyName={propertyResult.data.name}
      appliance={applianceResult.data}
      room={room}
    />
  );
}
