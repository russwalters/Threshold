'use client';

import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Thermometer, Wind, Flame, Box, Droplets, RotateCcw,
  Zap, Trash2, DoorOpen, Bell, Plus, Search, ArrowLeft,
  ArrowRight, Camera, CheckCircle2, Sparkles, MapPin,
  X, Image as ImageIcon, SkipForward,
} from 'lucide-react';
import { createAppliance } from '@/app/actions/appliances';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ApplianceWizardProps {
  propertyId: string;
  rooms: Array<{ id: string; name: string }>;
  onSuccess: (appliance: any) => void;
  onCancel: () => void;
}

type WizardStep = 1 | 2 | 3 | 4 | 5;
type ApplianceStatus = 'good' | 'needs_attention' | 'replace_soon';

interface WizardData {
  name: string;
  presetKey: string | null;
  roomId: string | null;
  customLocation: string;
  photoUrl: string | null;
  photoPreview: string | null;
  brand: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  warrantyExpiration: string;
  status: ApplianceStatus;
}

// ---------------------------------------------------------------------------
// Preset definitions
// ---------------------------------------------------------------------------

const PRESETS = [
  { key: 'hvac', label: 'HVAC / Furnace', icon: Thermometer, brands: ['Carrier', 'Trane', 'Lennox', 'Goodman', 'Rheem', 'York'] },
  { key: 'ac', label: 'Air Conditioner', icon: Wind, brands: ['Carrier', 'Trane', 'Lennox', 'Goodman', 'Daikin', 'Rheem'] },
  { key: 'water_heater', label: 'Water Heater', icon: Flame, brands: ['Rheem', 'A.O. Smith', 'Bradford White', 'Rinnai', 'Navien'] },
  { key: 'refrigerator', label: 'Refrigerator', icon: Box, brands: ['Samsung', 'LG', 'Whirlpool', 'GE', 'Frigidaire', 'KitchenAid'] },
  { key: 'dishwasher', label: 'Dishwasher', icon: Droplets, brands: ['Bosch', 'Samsung', 'LG', 'Whirlpool', 'KitchenAid', 'GE'] },
  { key: 'washer', label: 'Washer', icon: RotateCcw, brands: ['Samsung', 'LG', 'Whirlpool', 'Maytag', 'GE', 'Speed Queen'] },
  { key: 'dryer', label: 'Dryer', icon: Wind, brands: ['Samsung', 'LG', 'Whirlpool', 'Maytag', 'GE', 'Speed Queen'] },
  { key: 'oven', label: 'Oven / Range', icon: Flame, brands: ['Samsung', 'LG', 'GE', 'Whirlpool', 'KitchenAid', 'Wolf'] },
  { key: 'microwave', label: 'Microwave', icon: Zap, brands: ['Samsung', 'LG', 'GE', 'Whirlpool', 'Panasonic', 'Sharp'] },
  { key: 'disposal', label: 'Garbage Disposal', icon: Trash2, brands: ['InSinkErator', 'Waste King', 'Moen', 'GE'] },
  { key: 'garage_door', label: 'Garage Door Opener', icon: DoorOpen, brands: ['LiftMaster', 'Chamberlain', 'Genie', 'Craftsman'] },
  { key: 'smoke_detector', label: 'Smoke Detector', icon: Bell, brands: ['Kidde', 'First Alert', 'Nest', 'Ring'] },
] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getPresetBrands(key: string | null): string[] {
  if (!key) return [];
  const preset = PRESETS.find((p) => p.key === key);
  return preset ? [...preset.brands] : [];
}

function getCompletionMessage(data: WizardData): string {
  let filled = 0;
  if (data.brand) filled++;
  if (data.model) filled++;
  if (data.serialNumber) filled++;
  if (data.purchaseDate) filled++;
  if (data.warrantyExpiration) filled++;
  if (data.photoUrl || data.photoPreview) filled++;

  if (filled >= 5) return "Amazing! You've captured nearly everything. Future-you will be grateful.";
  if (filled >= 3) return "Great start! You can always add more details later.";
  if (filled >= 1) return "Nice -- every little bit helps. Come back anytime to fill in more.";
  return "All set! You can add details whenever you find them.";
}

// ---------------------------------------------------------------------------
// Step indicator
// ---------------------------------------------------------------------------

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {Array.from({ length: total }, (_, i) => {
        const step = i + 1;
        const isActive = step === current;
        const isCompleted = step < current;
        return (
          <div
            key={step}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              isActive
                ? 'w-8 bg-ember'
                : isCompleted
                  ? 'w-2.5 bg-ember/50'
                  : 'w-2.5 bg-clay/30'
            }`}
          />
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ApplianceWizard({ propertyId, rooms, onSuccess, onCancel }: ApplianceWizardProps) {
  const [step, setStep] = useState<WizardStep>(1);
  const [presetSearch, setPresetSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedAppliance, setSavedAppliance] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [data, setData] = useState<WizardData>({
    name: '',
    presetKey: null,
    roomId: null,
    customLocation: '',
    photoUrl: null,
    photoPreview: null,
    brand: '',
    model: '',
    serialNumber: '',
    purchaseDate: '',
    warrantyExpiration: '',
    status: 'good',
  });

  const update = useCallback((partial: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  }, []);

  const canProceed = (): boolean => {
    if (step === 1) return data.name.trim().length > 0;
    return true; // all other steps are optional
  };

  const goNext = () => {
    if (step < 5) setStep((s) => (s + 1) as WizardStep);
  };

  const goBack = () => {
    if (step > 1) setStep((s) => (s - 1) as WizardStep);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    const formData = new FormData();
    formData.set('name', data.name);
    if (data.roomId) formData.set('room_id', data.roomId);
    if (data.customLocation) formData.set('location', data.customLocation);
    if (data.brand) formData.set('brand', data.brand);
    if (data.model) formData.set('model', data.model);
    if (data.serialNumber) formData.set('serial_number', data.serialNumber);
    if (data.purchaseDate) formData.set('purchase_date', data.purchaseDate);
    if (data.warrantyExpiration) formData.set('warranty_expiration', data.warrantyExpiration);
    if (data.photoUrl) formData.set('photo_url', data.photoUrl);
    formData.set('status', data.status);

    const result = await createAppliance(propertyId, formData);

    if (result.error) {
      setError(result.error);
      setSaving(false);
      return;
    }

    setSavedAppliance(result.data);
    setSaving(false);
    setStep(5);
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    update({ photoPreview: url, photoUrl: url });
  };

  const resetAndAddAnother = () => {
    setData({
      name: '',
      presetKey: null,
      roomId: null,
      customLocation: '',
      photoUrl: null,
      photoPreview: null,
      brand: '',
      model: '',
      serialNumber: '',
      purchaseDate: '',
      warrantyExpiration: '',
      status: 'good',
    });
    setPresetSearch('');
    setSavedAppliance(null);
    setStep(1);
  };

  // -------------------------------------------------------------------------
  // Filtered presets for step 1
  // -------------------------------------------------------------------------

  const filteredPresets = presetSearch
    ? PRESETS.filter((p) => p.label.toLowerCase().includes(presetSearch.toLowerCase()))
    : PRESETS;

  const suggestedBrands = getPresetBrands(data.presetKey);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        {step > 1 && step < 5 ? (
          <button
            onClick={goBack}
            className="flex items-center gap-1 text-sm text-stone hover:text-hearth transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        ) : (
          <div />
        )}
        {step < 5 && (
          <button
            onClick={onCancel}
            className="text-stone hover:text-hearth transition-colors"
            aria-label="Close wizard"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <StepDots current={step} total={5} />

      {/* ---------- Step 1: What appliance? ---------- */}
      {step === 1 && (
        <div className="animate-fade-in space-y-5">
          <div className="text-center mb-2">
            <h2 className="font-heading text-xl font-semibold text-hearth">What appliance are you adding?</h2>
            <p className="text-sm text-stone mt-1">Pick a type or choose &ldquo;Other&rdquo; to type your own.</p>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone" />
            <Input
              placeholder="Search appliances..."
              className="pl-10 bg-white"
              value={presetSearch}
              onChange={(e) => setPresetSearch(e.target.value)}
            />
          </div>

          {/* Preset grid */}
          <div className="grid grid-cols-3 gap-2.5">
            {filteredPresets.map((preset) => {
              const Icon = preset.icon;
              const isSelected = data.presetKey === preset.key;
              return (
                <button
                  key={preset.key}
                  onClick={() => {
                    update({ presetKey: preset.key, name: preset.label });
                  }}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 text-center ${
                    isSelected
                      ? 'border-ember bg-ember/5 shadow-sm'
                      : 'border-clay/20 bg-white hover:border-ember/30 hover:shadow-sm'
                  }`}
                >
                  <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                      isSelected ? 'bg-ember/15 text-ember' : 'bg-linen text-stone'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`text-xs font-medium leading-tight ${isSelected ? 'text-ember' : 'text-hearth'}`}>
                    {preset.label}
                  </span>
                </button>
              );
            })}

            {/* Other */}
            <button
              onClick={() => {
                update({ presetKey: 'other', name: '' });
              }}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 text-center ${
                data.presetKey === 'other'
                  ? 'border-ember bg-ember/5 shadow-sm'
                  : 'border-dashed border-clay/30 bg-white hover:border-ember/30'
              }`}
            >
              <div
                className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                  data.presetKey === 'other' ? 'bg-ember/15 text-ember' : 'bg-linen text-stone'
                }`}
              >
                <Plus className="h-5 w-5" />
              </div>
              <span className={`text-xs font-medium ${data.presetKey === 'other' ? 'text-ember' : 'text-hearth'}`}>
                Other
              </span>
            </button>
          </div>

          {/* Custom name field when "Other" is selected */}
          {data.presetKey === 'other' && (
            <div className="space-y-2 animate-fade-in">
              <Label className="text-sm text-hearth">Appliance name</Label>
              <Input
                placeholder="e.g., Sump Pump, Whole-House Fan..."
                className="bg-white"
                value={data.name}
                onChange={(e) => update({ name: e.target.value })}
                autoFocus
              />
            </div>
          )}

          {/* Next button */}
          <Button
            onClick={goNext}
            disabled={!canProceed()}
            className="w-full bg-ember hover:bg-ember-dark text-white h-11"
          >
            Continue <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {/* ---------- Step 2: Where is it? ---------- */}
      {step === 2 && (
        <div className="animate-fade-in space-y-5">
          <div className="text-center mb-2">
            <h2 className="font-heading text-xl font-semibold text-hearth">Where is it?</h2>
            <p className="text-sm text-stone mt-1">Select a room or describe the location.</p>
          </div>

          <div className="space-y-2">
            {rooms.map((room) => {
              const isSelected = data.roomId === room.id;
              return (
                <button
                  key={room.id}
                  onClick={() => update({ roomId: room.id, customLocation: '' })}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? 'border-ember bg-ember/5'
                      : 'border-clay/20 bg-white hover:border-ember/30'
                  }`}
                >
                  <div
                    className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-ember/15 text-ember' : 'bg-linen text-stone'
                    }`}
                  >
                    <MapPin className="h-4 w-4" />
                  </div>
                  <span className={`text-sm font-medium ${isSelected ? 'text-ember' : 'text-hearth'}`}>
                    {room.name}
                  </span>
                  {isSelected && <CheckCircle2 className="h-4 w-4 text-ember ml-auto" />}
                </button>
              );
            })}

            {/* No specific room */}
            <button
              onClick={() => update({ roomId: null, customLocation: '' })}
              className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left ${
                data.roomId === null && !data.customLocation
                  ? 'border-ember bg-ember/5'
                  : 'border-dashed border-clay/30 bg-white hover:border-ember/30'
              }`}
            >
              <div className="h-9 w-9 rounded-lg flex items-center justify-center bg-linen text-stone">
                <MapPin className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-hearth">Not in a specific room</span>
            </button>
          </div>

          {/* Custom location */}
          <div className="space-y-2">
            <Label className="text-sm text-stone">Or describe the location</Label>
            <Input
              placeholder="e.g., Basement mechanical room, Garage..."
              className="bg-white"
              value={data.customLocation}
              onChange={(e) => update({ customLocation: e.target.value, roomId: null })}
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={goNext} className="flex-1 h-11 text-stone">
              <SkipForward className="h-4 w-4 mr-1" /> Skip
            </Button>
            <Button onClick={goNext} className="flex-1 bg-ember hover:bg-ember-dark text-white h-11">
              Continue <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* ---------- Step 3: Photo ---------- */}
      {step === 3 && (
        <div className="animate-fade-in space-y-5">
          <div className="text-center mb-2">
            <h2 className="font-heading text-xl font-semibold text-hearth">Snap a photo</h2>
            <p className="text-sm text-stone mt-1">Take a photo of the appliance -- you can add details later.</p>
          </div>

          {data.photoPreview ? (
            <div className="relative">
              <img
                src={data.photoPreview}
                alt="Appliance preview"
                className="w-full h-56 object-cover rounded-2xl border-2 border-clay/20"
              />
              <button
                onClick={() => update({ photoPreview: null, photoUrl: null })}
                className="absolute top-3 right-3 h-8 w-8 rounded-full bg-hearth/70 text-white flex items-center justify-center hover:bg-hearth transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-56 rounded-2xl border-2 border-dashed border-clay/30 bg-linen/50 flex flex-col items-center justify-center gap-3 hover:border-ember/40 hover:bg-ember/5 transition-all group"
            >
              <div className="h-16 w-16 rounded-2xl bg-ember/10 flex items-center justify-center group-hover:bg-ember/20 transition-colors">
                <Camera className="h-8 w-8 text-ember" />
              </div>
              <div>
                <p className="text-sm font-medium text-hearth">Tap to take or choose a photo</p>
                <p className="text-xs text-stone mt-0.5">JPG, PNG, or HEIC</p>
              </div>
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePhotoCapture}
          />

          <div className="flex gap-3">
            <Button variant="outline" onClick={goNext} className="flex-1 h-11 text-stone">
              <SkipForward className="h-4 w-4 mr-1" /> Skip for now
            </Button>
            {data.photoPreview && (
              <Button onClick={goNext} className="flex-1 bg-ember hover:bg-ember-dark text-white h-11">
                Continue <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* ---------- Step 4: Key details ---------- */}
      {step === 4 && (
        <div className="animate-fade-in space-y-5">
          <div className="text-center mb-2">
            <h2 className="font-heading text-xl font-semibold text-hearth">Key details</h2>
            <p className="text-sm text-stone mt-1">
              Don&apos;t know these? No worries -- add them whenever you find the info.
            </p>
          </div>

          <div className="space-y-4">
            {/* Brand */}
            <div className="space-y-2">
              <Label className="text-sm text-hearth">Brand</Label>
              <Input
                placeholder="e.g., Samsung, GE, Whirlpool..."
                className="bg-white"
                value={data.brand}
                onChange={(e) => update({ brand: e.target.value })}
              />
              {suggestedBrands.length > 0 && !data.brand && (
                <div className="flex flex-wrap gap-1.5">
                  {suggestedBrands.map((b) => (
                    <button
                      key={b}
                      onClick={() => update({ brand: b })}
                      className="px-2.5 py-1 text-xs rounded-full bg-linen text-stone hover:bg-ember/10 hover:text-ember transition-colors border border-clay/20"
                    >
                      {b}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Model number */}
            <div className="space-y-2">
              <Label className="text-sm text-hearth">Model number</Label>
              <Input
                placeholder="e.g., RF28T5001SR"
                className="bg-white font-mono text-sm"
                value={data.model}
                onChange={(e) => update({ model: e.target.value })}
              />
            </div>

            {/* Serial number */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-hearth">Serial number</Label>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 text-xs text-ember hover:text-ember-dark transition-colors"
                >
                  <Camera className="h-3.5 w-3.5" /> Photo the model plate
                </button>
              </div>
              <Input
                placeholder="e.g., 0B7A4..."
                className="bg-white font-mono text-sm"
                value={data.serialNumber}
                onChange={(e) => update({ serialNumber: e.target.value })}
              />
            </div>

            {/* Purchase date */}
            <div className="space-y-2">
              <Label className="text-sm text-hearth">Purchase date</Label>
              <Input
                type="date"
                className="bg-white"
                value={data.purchaseDate}
                onChange={(e) => update({ purchaseDate: e.target.value })}
              />
            </div>

            {/* Warranty */}
            <div className="space-y-2">
              <Label className="text-sm text-hearth">Warranty expiration</Label>
              <Input
                type="date"
                className="bg-white"
                value={data.warrantyExpiration}
                onChange={(e) => update({ warrantyExpiration: e.target.value })}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label className="text-sm text-hearth">Current condition</Label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { value: 'good' as const, label: 'Good', color: 'border-sage bg-sage/5 text-sage' },
                  { value: 'needs_attention' as const, label: 'Needs Attention', color: 'border-caution bg-caution/5 text-caution' },
                  { value: 'replace_soon' as const, label: 'Replace Soon', color: 'border-alert bg-alert/5 text-alert' },
                ]).map((option) => (
                  <button
                    key={option.value}
                    onClick={() => update({ status: option.value })}
                    className={`p-2.5 rounded-xl border-2 text-xs font-medium text-center transition-all ${
                      data.status === option.value
                        ? option.color
                        : 'border-clay/20 bg-white text-stone hover:border-clay/40'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-alert/10 text-alert text-sm text-center">
              {error}
            </div>
          )}

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-ember hover:bg-ember-dark text-white h-11"
          >
            {saving ? 'Saving...' : 'Save Appliance'}
            {!saving && <CheckCircle2 className="h-4 w-4 ml-1" />}
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePhotoCapture}
          />
        </div>
      )}

      {/* ---------- Step 5: Done! ---------- */}
      {step === 5 && savedAppliance && (
        <div className="animate-fade-in space-y-6 text-center">
          <div className="h-16 w-16 rounded-2xl bg-sage/10 flex items-center justify-center mx-auto">
            <Sparkles className="h-8 w-8 text-sage" />
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold text-hearth">All set!</h2>
            <p className="text-sm text-stone mt-2 max-w-xs mx-auto">
              {getCompletionMessage(data)}
            </p>
          </div>

          {/* Summary card */}
          <Card className="bg-white border-clay/20 text-left">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                {data.photoPreview ? (
                  <img
                    src={data.photoPreview}
                    alt={data.name}
                    className="h-14 w-14 rounded-xl object-cover shrink-0"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-xl bg-ember/10 flex items-center justify-center shrink-0">
                    <ImageIcon className="h-6 w-6 text-ember" />
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="font-heading font-semibold text-hearth">{savedAppliance.name}</h3>
                  <p className="text-sm text-stone">
                    {savedAppliance.brand || 'No brand'} {savedAppliance.model ? `\u00B7 ${savedAppliance.model}` : ''}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge
                      variant="secondary"
                      className={
                        savedAppliance.status === 'good'
                          ? 'bg-sage/10 text-sage'
                          : savedAppliance.status === 'needs_attention'
                            ? 'bg-caution/10 text-caution'
                            : 'bg-alert/10 text-alert'
                      }
                    >
                      {savedAppliance.status === 'good'
                        ? 'Good'
                        : savedAppliance.status === 'needs_attention'
                          ? 'Needs Attention'
                          : 'Replace Soon'}
                    </Badge>
                    {rooms.find((r) => r.id === savedAppliance.room_id) && (
                      <span className="text-xs text-stone">
                        {rooms.find((r) => r.id === savedAppliance.room_id)?.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2.5">
            <Button
              onClick={resetAndAddAnother}
              className="w-full bg-ember hover:bg-ember-dark text-white h-11"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Another Appliance
            </Button>
            <Button
              variant="outline"
              onClick={() => onSuccess(savedAppliance)}
              className="w-full h-11"
            >
              Back to Property
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
