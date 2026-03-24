import { AppShell } from "@/components/layout/app-shell";
import { requireAuth, getUserProfile } from "@/lib/auth";
import { getProperties } from "@/app/actions/properties";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuth();
  const { profile } = await getUserProfile();
  const { data: properties } = await getProperties();

  const sidebarProperties = (properties ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    city: p.city,
    state: p.state,
  }));

  return (
    <AppShell
      properties={sidebarProperties}
      userFullName={profile?.full_name}
      subscriptionTier={profile?.subscription_tier}
    >
      {children}
    </AppShell>
  );
}
