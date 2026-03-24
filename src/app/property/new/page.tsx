"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft, ArrowRight, Check, Home, Building2,
  MapPin, Bed, Bath, Ruler, Calendar, Plus, X,
  Wifi, Car, Trash2, AlertTriangle, Phone,
} from "lucide-react";

const propertyTypes = [
  { value: "single_family", label: "Single Family", icon: Home },
  { value: "condo", label: "Condo", icon: Building2 },
  { value: "townhouse", label: "Townhouse", icon: Building2 },
  { value: "apartment", label: "Apartment", icon: Building2 },
];

const occupancyTypes = [
  { value: "primary", label: "Primary Residence" },
  { value: "rental", label: "Rental Property" },
  { value: "vacation", label: "Vacation Home" },
];

const roomTemplates = [
  "Living Room", "Kitchen", "Primary Bedroom", "Bedroom 2", "Bedroom 3", "Bedroom 4",
  "Primary Bathroom", "Bathroom 2", "Bathroom 3", "Garage", "Laundry Room",
  "Dining Room", "Office", "Bonus Room", "Patio/Porch", "Basement",
];

const steps = [
  { number: 1, title: "Basic Info", description: "Address and property details" },
  { number: 2, title: "Rooms", description: "Add rooms from templates" },
  { number: 3, title: "Key Details", description: "Utilities, WiFi, parking" },
  { number: 4, title: "Emergency", description: "Emergency contacts and info" },
];

export default function NewPropertyPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    type: "single_family",
    occupancy: "primary",
    beds: "3",
    baths: "2",
    sqft: "",
    yearBuilt: "",
    rooms: ["Living Room", "Kitchen", "Primary Bedroom", "Bathroom"],
    wifiName: "",
    wifiPassword: "",
    parkingInfo: "",
    trashSchedule: "",
    waterShutoff: "",
    electricPanel: "",
    gasShutoff: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
  });

  const [customRoom, setCustomRoom] = useState("");

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addRoom = (room: string) => {
    if (!formData.rooms.includes(room)) {
      setFormData((prev) => ({ ...prev, rooms: [...prev.rooms, room] }));
    }
  };

  const removeRoom = (room: string) => {
    setFormData((prev) => ({ ...prev, rooms: prev.rooms.filter((r) => r !== room) }));
  };

  const handleSubmit = () => {
    toast.success("Property created!", {
      description: `${formData.name || formData.address || "New property"} has been added to your properties.`,
    });
    router.push("/dashboard");
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/dashboard" className="inline-flex items-center text-sm text-stone hover:text-hearth transition-colors mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
      </Link>

      <h1 className="font-heading text-3xl font-semibold text-hearth mb-2">Add New Property</h1>
      <p className="text-stone mb-8">Let&apos;s document your property. You can always add more details later.</p>

      {/* Progress steps */}
      <div className="flex items-center gap-2 mb-10">
        {steps.map((step, i) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex items-center gap-3 flex-1">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm font-semibold shrink-0 transition-all ${
                currentStep > step.number ? "bg-sage text-white" :
                currentStep === step.number ? "bg-ember text-white shadow-lg shadow-ember/25" :
                "bg-linen-dark text-stone"
              }`}>
                {currentStep > step.number ? <Check className="h-5 w-5" /> : step.number}
              </div>
              <div className="hidden sm:block min-w-0">
                <div className="text-sm font-medium text-hearth">{step.title}</div>
                <div className="text-xs text-stone truncate">{step.description}</div>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-px flex-1 mx-2 ${currentStep > step.number ? "bg-sage" : "bg-clay/30"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <Card className="bg-white border-clay/20 shadow-lg">
        <CardContent className="p-8">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="font-heading text-xl font-semibold text-hearth">Property Details</h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Property Nickname (optional)</Label>
                  <Input id="name" placeholder="e.g., 'Beach House' or 'Main Street Rental'" value={formData.name} onChange={(e) => updateField("name", e.target.value)} className="mt-1.5" />
                </div>

                <div>
                  <Label htmlFor="address">Street Address</Label>
                  <Input id="address" placeholder="123 Main St" value={formData.address} onChange={(e) => updateField("address", e.target.value)} className="mt-1.5" />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input id="city" placeholder="City" value={formData.city} onChange={(e) => updateField("city", e.target.value)} className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input id="state" placeholder="FL" value={formData.state} onChange={(e) => updateField("state", e.target.value)} className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="zip">ZIP</Label>
                    <Input id="zip" placeholder="33761" value={formData.zip} onChange={(e) => updateField("zip", e.target.value)} className="mt-1.5" />
                  </div>
                </div>

                <div>
                  <Label>Property Type</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1.5">
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

                <div>
                  <Label>Occupancy</Label>
                  <div className="flex gap-2 mt-1.5">
                    {occupancyTypes.map((occ) => (
                      <button
                        key={occ.value}
                        onClick={() => updateField("occupancy", occ.value)}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                          formData.occupancy === occ.value
                            ? "border-ember bg-ember/5 text-ember"
                            : "border-clay/20 text-stone hover:border-clay"
                        }`}
                      >
                        {occ.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <Label htmlFor="beds">Bedrooms</Label>
                    <Input id="beds" type="number" value={formData.beds} onChange={(e) => updateField("beds", e.target.value)} className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="baths">Bathrooms</Label>
                    <Input id="baths" type="number" value={formData.baths} onChange={(e) => updateField("baths", e.target.value)} className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="sqft">Sq Ft</Label>
                    <Input id="sqft" type="number" placeholder="1800" value={formData.sqft} onChange={(e) => updateField("sqft", e.target.value)} className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="yearBuilt">Year Built</Label>
                    <Input id="yearBuilt" type="number" placeholder="2020" value={formData.yearBuilt} onChange={(e) => updateField("yearBuilt", e.target.value)} className="mt-1.5" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Rooms */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="font-heading text-xl font-semibold text-hearth">Add Rooms</h2>
              <p className="text-stone text-sm">Select from templates or add custom rooms. You can always add more later.</p>

              {/* Selected rooms */}
              <div>
                <Label>Your Rooms ({formData.rooms.length})</Label>
                <div className="flex flex-wrap gap-2 mt-2 min-h-[48px] p-3 border border-clay/20 rounded-xl bg-linen/50">
                  {formData.rooms.map((room) => (
                    <Badge key={room} variant="secondary" className="bg-ember/10 text-ember pl-3 pr-1.5 py-1.5 gap-1.5">
                      {room}
                      <button onClick={() => removeRoom(room)} className="hover:bg-ember/20 rounded-full p-0.5">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {formData.rooms.length === 0 && (
                    <span className="text-sm text-stone/50">Click a room below to add it</span>
                  )}
                </div>
              </div>

              {/* Room templates */}
              <div>
                <Label>Room Templates</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {roomTemplates
                    .filter((r) => !formData.rooms.includes(r))
                    .map((room) => (
                      <button
                        key={room}
                        onClick={() => addRoom(room)}
                        className="px-3 py-1.5 rounded-lg border border-clay/20 text-sm text-stone hover:border-ember hover:text-ember transition-all"
                      >
                        <Plus className="h-3 w-3 inline mr-1" />
                        {room}
                      </button>
                    ))}
                </div>
              </div>

              {/* Custom room */}
              <div>
                <Label>Custom Room</Label>
                <div className="flex gap-2 mt-1.5">
                  <Input
                    placeholder="e.g., Sunroom, Wine Cellar..."
                    value={customRoom}
                    onChange={(e) => setCustomRoom(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && customRoom.trim()) {
                        addRoom(customRoom.trim());
                        setCustomRoom("");
                      }
                    }}
                  />
                  <Button variant="outline" onClick={() => { if (customRoom.trim()) { addRoom(customRoom.trim()); setCustomRoom(""); } }}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Key Details */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="font-heading text-xl font-semibold text-hearth">Key Details</h2>
              <p className="text-stone text-sm">These details are especially helpful for rental properties and tenant handbooks.</p>

              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="wifiName" className="flex items-center gap-2"><Wifi className="h-4 w-4 text-ember" /> WiFi Network</Label>
                    <Input id="wifiName" placeholder="Network name" value={formData.wifiName} onChange={(e) => updateField("wifiName", e.target.value)} className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="wifiPassword">WiFi Password</Label>
                    <Input id="wifiPassword" placeholder="Password" value={formData.wifiPassword} onChange={(e) => updateField("wifiPassword", e.target.value)} className="mt-1.5" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="parking" className="flex items-center gap-2"><Car className="h-4 w-4 text-ember" /> Parking Information</Label>
                  <Textarea id="parking" placeholder="e.g., 2-car garage, street parking available..." value={formData.parkingInfo} onChange={(e) => updateField("parkingInfo", e.target.value)} className="mt-1.5" rows={3} />
                </div>

                <div>
                  <Label htmlFor="trash" className="flex items-center gap-2"><Trash2 className="h-4 w-4 text-sage" /> Trash & Recycling Schedule</Label>
                  <Textarea id="trash" placeholder="e.g., Tuesday pickup, recycling every other week..." value={formData.trashSchedule} onChange={(e) => updateField("trashSchedule", e.target.value)} className="mt-1.5" rows={3} />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Emergency */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="font-heading text-xl font-semibold text-hearth">Emergency Information</h2>
              <p className="text-stone text-sm">This information is critical for tenant safety and should be filled out for every property.</p>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="water" className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-alert" /> Water Shutoff Location</Label>
                  <Textarea id="water" placeholder="Describe where the main water shutoff is located..." value={formData.waterShutoff} onChange={(e) => updateField("waterShutoff", e.target.value)} className="mt-1.5" rows={2} />
                </div>

                <div>
                  <Label htmlFor="electric">Electrical Panel Location</Label>
                  <Textarea id="electric" placeholder="Describe where the electrical panel is located..." value={formData.electricPanel} onChange={(e) => updateField("electricPanel", e.target.value)} className="mt-1.5" rows={2} />
                </div>

                <div>
                  <Label htmlFor="gas">Gas Shutoff Location</Label>
                  <Textarea id="gas" placeholder="Describe where the gas shutoff is, or 'N/A' for all-electric..." value={formData.gasShutoff} onChange={(e) => updateField("gasShutoff", e.target.value)} className="mt-1.5" rows={2} />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ecName" className="flex items-center gap-2"><Phone className="h-4 w-4 text-ember" /> Emergency Contact Name</Label>
                    <Input id="ecName" placeholder="Property manager, landlord, etc." value={formData.emergencyContactName} onChange={(e) => updateField("emergencyContactName", e.target.value)} className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="ecPhone">Emergency Phone</Label>
                    <Input id="ecPhone" placeholder="(555) 555-0100" value={formData.emergencyContactPhone} onChange={(e) => updateField("emergencyContactPhone", e.target.value)} className="mt-1.5" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>

            {currentStep < 4 ? (
              <Button
                className="bg-ember hover:bg-ember-dark text-white"
                onClick={() => setCurrentStep((s) => Math.min(4, s + 1))}
              >
                Next Step <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                className="bg-ember hover:bg-ember-dark text-white"
                onClick={handleSubmit}
              >
                <Check className="h-4 w-4 mr-1" /> Create Property
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
