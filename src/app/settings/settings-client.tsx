"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ImageUpload } from "@/components/shared/image-upload";
import { PricingCards } from "@/components/billing/pricing-cards";
import { updateProfile } from "@/app/actions/profile";
import { toast } from "sonner";
import type { Profile, Subscription } from "@/types/database";
import type { PlanTier } from "@/lib/plans";
import {
  User,
  Mail,
  Crown,
  AlertTriangle,
  Loader2,
  ExternalLink,
  Save,
} from "lucide-react";

interface SettingsClientProps {
  user: {
    id: string;
    email: string;
  };
  profile: Profile | null;
  subscription: Subscription | null;
  currentPlan: string;
}

export function SettingsClient({
  user,
  profile,
  subscription,
  currentPlan,
}: SettingsClientProps) {
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);

  async function handleSaveProfile() {
    setIsSavingProfile(true);
    try {
      const fd = new FormData();
      fd.set("full_name", fullName);
      fd.set("avatar_url", avatarUrl);

      const result = await updateProfile(fd);

      if (result.error) {
        toast.error("Failed to update profile", { description: result.error });
      } else {
        toast.success("Profile updated successfully");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleManageSubscription() {
    setIsLoadingPortal(true);
    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Could not open billing portal", { description: data.error });
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoadingPortal(false);
    }
  }

  async function handleDeleteAccount() {
    setIsDeleting(true);
    try {
      const response = await fetch("/api/account/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (data.error) {
        toast.error("Failed to delete account", { description: data.error });
      } else {
        toast.success("Account deleted. Redirecting...");
        window.location.href = "/";
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  const planLabel =
    currentPlan === "portfolio"
      ? "Portfolio"
      : currentPlan === "pro"
      ? "Pro"
      : "Free";

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-semibold text-hearth mb-2">
          Settings
        </h1>
        <p className="text-stone">
          Manage your profile, subscription, and account preferences.
        </p>
      </div>

      {/* Profile Section */}
      <Card className="bg-white border-clay/20 shadow-sm mb-8">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-ember/10 flex items-center justify-center">
              <User className="h-5 w-5 text-ember" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-semibold text-hearth">
                Profile
              </h2>
              <p className="text-sm text-stone">
                Your personal information
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-[auto_1fr] gap-8 items-start">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-2">
              <ImageUpload
                variant="avatar"
                userId={user.id}
                propertyId="profile"
                currentImageUrl={avatarUrl || undefined}
                onUpload={({ url }) => setAvatarUrl(url)}
                onRemove={() => setAvatarUrl("")}
              />
              <span className="text-xs text-stone">Avatar</span>
            </div>

            {/* Profile fields */}
            <div className="space-y-4 flex-1">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="Your name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center gap-2 mt-1.5">
                  <Input
                    id="email"
                    value={user.email}
                    disabled
                    className="bg-linen-dark text-stone"
                  />
                  <Badge
                    variant="secondary"
                    className="bg-sage/10 text-sage border-sage/20 shrink-0"
                  >
                    <Mail className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                </div>
                <p className="text-xs text-stone mt-1">
                  Email is managed through your authentication provider.
                </p>
              </div>

              <div className="pt-2">
                <Button
                  className="bg-ember hover:bg-ember-dark text-white"
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile}
                >
                  {isSavingProfile ? (
                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-1.5" />
                  )}
                  {isSavingProfile ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Section */}
      <Card className="bg-white border-clay/20 shadow-sm mb-8">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-brass/10 flex items-center justify-center">
                <Crown className="h-5 w-5 text-brass" />
              </div>
              <div>
                <h2 className="font-heading text-xl font-semibold text-hearth">
                  Subscription
                </h2>
                <p className="text-sm text-stone">
                  Current plan:{" "}
                  <span className="font-medium text-hearth">{planLabel}</span>
                  {subscription?.status === "active" && (
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-sage/10 text-sage border-sage/20"
                    >
                      Active
                    </Badge>
                  )}
                  {subscription?.status === "trialing" && (
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-ember/10 text-ember border-ember/20"
                    >
                      Trial
                    </Badge>
                  )}
                </p>
              </div>
            </div>

            {currentPlan !== "free" && (
              <Button
                variant="outline"
                onClick={handleManageSubscription}
                disabled={isLoadingPortal}
              >
                {isLoadingPortal ? (
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                ) : (
                  <ExternalLink className="h-4 w-4 mr-1.5" />
                )}
                Manage Subscription
              </Button>
            )}
          </div>

          {subscription?.current_period_end && (
            <p className="text-sm text-stone mb-6">
              {subscription.status === "active"
                ? `Renews on ${new Date(subscription.current_period_end).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
                : subscription.status === "canceled"
                ? `Access until ${new Date(subscription.current_period_end).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
                : null}
            </p>
          )}

          <Separator className="mb-8" />

          <PricingCards currentPlan={currentPlan as PlanTier} />
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-white border-alert/20 shadow-sm">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-alert/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-alert" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-semibold text-hearth">
                Danger Zone
              </h2>
              <p className="text-sm text-stone">
                Irreversible actions for your account
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border border-alert/20 rounded-xl bg-alert/5">
            <div>
              <p className="font-medium text-hearth text-sm">Delete Account</p>
              <p className="text-xs text-stone mt-0.5">
                Permanently delete your account and all associated data. This
                action cannot be undone.
              </p>
            </div>

            <Dialog
              open={isDeleteDialogOpen}
              onOpenChange={setIsDeleteDialogOpen}
            >
              <DialogTrigger
                render={
                  <Button
                    variant="outline"
                    className="border-alert text-alert hover:bg-alert/10 shrink-0"
                  />
                }
              >
                Delete Account
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-heading text-hearth">
                    Are you absolutely sure?
                  </DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account, all your properties, rooms, appliances,
                    documents, and published handbooks.
                  </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                  <Label htmlFor="deleteConfirm">
                    Type <span className="font-mono font-semibold">DELETE</span>{" "}
                    to confirm
                  </Label>
                  <Input
                    id="deleteConfirm"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="DELETE"
                    className="mt-1.5"
                  />
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDeleteDialogOpen(false);
                      setDeleteConfirmText("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmText !== "DELETE" || isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                    ) : null}
                    {isDeleting
                      ? "Deleting..."
                      : "Delete My Account"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
