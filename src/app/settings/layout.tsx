import { AppShell } from "@/components/layout/app-shell";
import { requireAuth } from "@/lib/auth";

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  await requireAuth();
  return <AppShell>{children}</AppShell>;
}
