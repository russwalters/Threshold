import { notFound } from "next/navigation";
import { getProperty } from "@/app/actions/properties";
import { getRooms } from "@/app/actions/rooms";
import { getAppliances } from "@/app/actions/appliances";
import { getDocuments } from "@/app/actions/documents";
import { getMaintenanceEvents } from "@/app/actions/maintenance";
import { getEmergencyInfo } from "@/app/actions/emergency";
import { getHandbookConfig } from "@/app/actions/handbook";
import { PropertyDetailClient } from "@/components/property/property-detail-client";

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [
    propertyResult,
    roomsResult,
    appliancesResult,
    documentsResult,
    maintenanceResult,
    emergencyResult,
    handbookResult,
  ] = await Promise.all([
    getProperty(id),
    getRooms(id),
    getAppliances(id),
    getDocuments(id),
    getMaintenanceEvents(id),
    getEmergencyInfo(id),
    getHandbookConfig(id),
  ]);

  if (!propertyResult.data) {
    notFound();
  }

  return (
    <PropertyDetailClient
      property={propertyResult.data}
      rooms={roomsResult.data ?? []}
      appliances={appliancesResult.data ?? []}
      documents={documentsResult.data ?? []}
      maintenanceEvents={maintenanceResult.data ?? []}
      emergencyInfo={emergencyResult.data}
      handbookConfig={handbookResult.data}
    />
  );
}
