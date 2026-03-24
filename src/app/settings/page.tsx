import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/auth";
import { getSubscriptionStatus } from "@/app/actions/profile";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const { user, profile } = await getUserProfile();

  if (!user) {
    redirect("/login");
  }

  const subResult = await getSubscriptionStatus();

  const subscription = subResult.data?.subscription ?? null;
  const tier = profile?.subscription_tier ?? "free";

  return (
    <SettingsClient
      user={{
        id: user.id,
        email: user.email ?? "",
      }}
      profile={profile}
      subscription={subscription}
      currentPlan={tier}
    />
  );
}
