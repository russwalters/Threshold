import { notFound } from "next/navigation";
import { getProperty } from "@/app/actions/properties";
import { getRoom } from "@/app/actions/rooms";
import { RoomDetailClient } from "@/components/property/room-detail-client";

export default async function RoomDetailPage({ params }: { params: Promise<{ id: string; roomId: string }> }) {
  const { id, roomId } = await params;

  const [propertyResult, roomResult] = await Promise.all([
    getProperty(id),
    getRoom(roomId),
  ]);

  if (!propertyResult.data || !roomResult.data) {
    notFound();
  }

  return (
    <RoomDetailClient
      propertyId={id}
      propertyName={propertyResult.data.name}
      room={roomResult.data}
      appliances={roomResult.data.appliances}
    />
  );
}
