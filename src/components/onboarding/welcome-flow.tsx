"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createProperty } from "@/app/actions/properties";
import {
  Home,
  Building2,
  ArrowRight,
  Camera,
  Wrench,
  Palette,
  ClipboardList,
  Sparkles,
  Loader2,
  ChevronRight,
} from "lucide-react";

const propertyTypes = [
  { value: "single_family", label: "Single Family", icon: Home },
  { value: "condo", label: "Condo", icon: Building2 },
  { value: "townhouse", label: "Townhouse", icon: Building2 },
  { value: "apartment", label: "Apartment", icon: Building2 },
];

const microMissions = [
  {
    icon: Camera,
    title: "Photograph your breaker panel",
    description: "Snap a quick photo so you always know which breaker controls what.",
    time: "2 min",
    href: "emergency",
  },
  {
    icon: Wrench,
    title: "Add your first appliance",
    description: "Start with your HVAC, water heater, or fridge — the big ones.",
    time: "1 min",
    href: "appliances",
  },
  {
    icon: Palette,
    title: "Record a paint color",
    description: "Next time you see a paint can, jot down the name and code.",
    time: "30 sec",
    href: "rooms",
  },
  {
    icon: ClipboardList,
    title: "Set up emergency contacts",
    description: "Add your plumber, electrician, or property manager for quick access.",
    time: "2 min",
    href: "emergency",
  },
];

export function WelcomeFlow() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [createdPropertyId, setCreatedPropertyId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    type: "single_family",
  });

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateProperty = async () => {
    if (!formData.address.trim()) {
      toast.error("Please enter a street address to get started.");
      return;
    }

    setIsSaving(true);
    try {
      const fd = new FormData();
      fd.set("name", formData.name || formData.address);
      fd.set("address_line1", formData.address);
      fd.set("city", formData.city);
      fd.set("state", formData.state);
      fd.set("zip", formData.zip);
      fd.set("property_type", formData.type);
      fd.set("occupancy_status", "primary");

      const result = await createProperty(fd);

      if (result.error) {
        toast.error("Something went wrong", { description: result.error });
        return;
      }

      setCreatedPropertyId(result.data!.id);
      toast.success("Your home has been added!");
      setStep(3);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkipToDashboard = () => {
    router.push("/dashboard");
  };

  const handleGoToProperty = () => {
    if (createdPropertyId) {
      router.push(`/property/${createdPropertyId}`);
    } else {
      router.push("/dashboard");
    }
  };

  const handleMicroMission = (href: string) => {
    if (createdPropertyId) {
      router.push(`/property/${createdPropertyId}?tab=${href}`);
    }
  };

  return (
    <div className="min-h-screen bg-linen flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="text-center animate-fade-in">
            {/* Warm glow house icon */}
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-ember/20 rounded-full blur-2xl scale-150" />
              <div className="relative h-24 w-24 rounded-3xl bg-gradient-to-br from-ember/20 to-ember/5 border border-ember/10 flex items-center justify-center mx-auto">
                <Home className="h-12 w-12 text-ember" />
              </div>
            </div>

            <h1 className="font-heading text-4xl font-semibold text-hearth mb-4">
              Welcome to Threshold!
            </h1>
            <p className="text-stone text-lg leading-relaxed mb-3 max-w-md mx-auto">
              Your home&apos;s owner manual starts here. Don&apos;t worry — you don&apos;t need to do everything today.
            </p>
            <p className="text-stone/70 text-sm mb-10 max-w-sm mx-auto">
              Start with just your address, and add details whenever you discover them.
            </p>

            <Button
              className="bg-ember hover:bg-ember-dark text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-ember/20"
              onClick={() => setStep(2)}
            >
              Let&apos;s start <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        )}

        {/* Step 2: Quick Property Setup */}
        {step === 2 && (
          <div className="animate-fade-in">
            <Card className="bg-white border-clay/20 shadow-xl">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <div className="h-12 w-12 rounded-2xl bg-ember/10 flex items-center justify-center mx-auto mb-4">
                    <Home className="h-6 w-6 text-ember" />
                  </div>
                  <h2 className="font-heading text-2xl font-semibold text-hearth mb-2">
                    Let&apos;s add your home
                  </h2>
                  <p className="text-stone text-sm">
                    Just the basics — you can add more details anytime.
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <Label htmlFor="welcome-name">Give it a nickname (optional)</Label>
                    <Input
                      id="welcome-name"
                      placeholder="e.g., 'Our House' or 'Beach Cottage'"
                      value={formData.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="welcome-address">
                      Street Address <span className="text-ember">*</span>
                    </Label>
                    <Input
                      id="welcome-address"
                      placeholder="123 Main St"
                      value={formData.address}
                      onChange={(e) => updateField("address", e.target.value)}
                      className="mt-1.5"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor="welcome-city">City</Label>
                      <Input
                        id="welcome-city"
                        placeholder="City"
                        value={formData.city}
                        onChange={(e) => updateField("city", e.target.value)}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="welcome-state">State</Label>
                      <Input
                        id="welcome-state"
                        placeholder="FL"
                        value={formData.state}
                        onChange={(e) => updateField("state", e.target.value)}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="welcome-zip">ZIP</Label>
                      <Input
                        id="welcome-zip"
                        placeholder="33761"
                        value={formData.zip}
                        onChange={(e) => updateField("zip", e.target.value)}
                        className="mt-1.5"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Property Type</Label>
                    <div className="grid grid-cols-2 gap-2 mt-1.5">
                      {propertyTypes.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => updateField("type", type.value)}
                          className={`p-3 rounded-xl border text-sm font-medium transition-all text-center ${
                            formData.type === type.value
                              ? "border-ember bg-ember/5 text-ember"
                              : "border-clay/20 text-stone hover:border-clay"
                          }`}
                        >
                          <type.icon className="h-5 w-5 mx-auto mb-1" />
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* That's it messaging */}
                <div className="mt-8 p-4 bg-sage/5 border border-sage/10 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-sage shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-hearth">That&apos;s it for now!</p>
                      <p className="text-xs text-stone mt-0.5">
                        You can add bedrooms, bathrooms, square footage, and more at any time. No rush.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                  <button
                    onClick={handleSkipToDashboard}
                    className="text-sm text-stone hover:text-hearth transition-colors"
                  >
                    Skip to dashboard
                  </button>
                  <Button
                    className="bg-ember hover:bg-ember-dark text-white"
                    onClick={handleCreateProperty}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        Create my home <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: What's Next */}
        {step === 3 && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <div className="h-16 w-16 rounded-3xl bg-sage/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-sage" />
              </div>
              <h2 className="font-heading text-3xl font-semibold text-hearth mb-2">
                You&apos;re all set!
              </h2>
              <p className="text-stone max-w-sm mx-auto">
                Your home is ready. Here are some quick things you can do anytime — each one makes your home easier to manage.
              </p>
            </div>

            <div className="space-y-3 mb-8">
              {microMissions.map((mission) => (
                <button
                  key={mission.title}
                  onClick={() => handleMicroMission(mission.href)}
                  className="w-full text-left"
                >
                  <Card className="bg-white border-clay/20 hover:border-ember/20 hover:shadow-md transition-all duration-200 cursor-pointer group">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="h-11 w-11 rounded-xl bg-ember/10 flex items-center justify-center shrink-0 group-hover:bg-ember/15 transition-colors">
                        <mission.icon className="h-5 w-5 text-ember" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-hearth text-sm group-hover:text-ember transition-colors">
                          {mission.title}
                        </div>
                        <div className="text-xs text-stone mt-0.5">{mission.description}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-stone/60 bg-linen px-2 py-1 rounded-lg">
                          {mission.time}
                        </span>
                        <ChevronRight className="h-4 w-4 text-stone/30 group-hover:text-ember transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </button>
              ))}
            </div>

            <p className="text-center text-sm text-stone/70 mb-6">
              Every detail you add makes your home easier to manage.
            </p>

            <div className="flex flex-col gap-3">
              <Button
                className="bg-ember hover:bg-ember-dark text-white w-full py-6 text-base rounded-xl"
                onClick={handleGoToProperty}
              >
                Go to my home <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <button
                onClick={handleSkipToDashboard}
                className="text-sm text-stone hover:text-hearth transition-colors text-center py-2"
              >
                I&apos;ll come back later
              </button>
            </div>
          </div>
        )}

        {/* Step indicator dots */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                s === step ? "w-8 bg-ember" : s < step ? "w-2 bg-sage" : "w-2 bg-clay/30"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
