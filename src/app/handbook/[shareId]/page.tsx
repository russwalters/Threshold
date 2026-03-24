import { BookOpen } from "lucide-react";
import { getPublicHandbook } from "@/app/actions/handbook";
import { HandbookContent } from "@/components/handbook/handbook-content";
import { HandbookPasswordGate } from "@/components/handbook/password-gate";

export default async function HandbookPage({ params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params;

  const { data, error } = await getPublicHandbook(shareId);

  if (error || !data) {
    return (
      <div className="min-h-screen bg-linen flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 rounded-2xl bg-clay/10 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8 text-clay" />
          </div>
          <h1 className="font-heading text-2xl text-hearth mb-2">Handbook Not Found</h1>
          <p className="text-stone">This handbook doesn&apos;t exist or hasn&apos;t been published yet.</p>
        </div>
      </div>
    );
  }

  const { handbook, property, rooms, appliances, emergency_info } = data;

  // Build the public handbook URL (server-side only)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://threshold.app";
  const handbookUrl = `${baseUrl}/handbook/${shareId}`;

  const content = (
    <HandbookContent
      property={property}
      rooms={rooms}
      appliances={appliances}
      emergencyInfo={emergency_info}
      handbookConfig={handbook}
      handbookUrl={handbookUrl}
    />
  );

  // If password protected, wrap in password gate
  if (handbook.password_hash) {
    return (
      <HandbookPasswordGate shareId={shareId}>
        {content}
      </HandbookPasswordGate>
    );
  }

  return content;
}
