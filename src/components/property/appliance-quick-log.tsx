'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Wrench, CheckCircle2, Search as SearchIcon, Eye, Settings, Package,
} from 'lucide-react';
import { addServiceEntry } from '@/app/actions/appliances';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ApplianceQuickLogProps {
  applianceId: string;
  applianceName: string;
  onSuccess: () => void;
}

type ServiceType = 'repair' | 'maintenance' | 'inspection' | 'installation';

const SERVICE_TYPES: Array<{
  value: ServiceType;
  label: string;
  icon: React.ElementType;
  color: string;
}> = [
  { value: 'repair', label: 'Repair', icon: Wrench, color: 'border-alert bg-alert/5 text-alert' },
  { value: 'maintenance', label: 'Maintenance', icon: Settings, color: 'border-sage bg-sage/5 text-sage' },
  { value: 'inspection', label: 'Inspection', icon: Eye, color: 'border-slate-brand bg-slate-brand/5 text-slate-brand' },
  { value: 'installation', label: 'Installation', icon: Package, color: 'border-ember bg-ember/5 text-ember' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ApplianceQuickLog({ applianceId, applianceName, onSuccess }: ApplianceQuickLogProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const [type, setType] = useState<ServiceType>('maintenance');
  const [date, setDate] = useState(today);
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');
  const [provider, setProvider] = useState('');

  const reset = () => {
    setType('maintenance');
    setDate(today);
    setDescription('');
    setCost('');
    setProvider('');
    setError(null);
  };

  const handleSave = async () => {
    if (!description.trim()) {
      setError('Please describe what happened.');
      return;
    }

    setSaving(true);
    setError(null);

    const formData = new FormData();
    formData.set('type', type);
    formData.set('date', date);
    formData.set('description', description);
    if (cost) formData.set('cost', cost);
    if (provider) formData.set('provider', provider);

    const result = await addServiceEntry(applianceId, formData);

    if (result.error) {
      setError(result.error);
      setSaving(false);
      return;
    }

    setSaving(false);
    setOpen(false);
    reset();
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger
        render={<Button variant="outline" size="sm" className="gap-1.5" />}
      >
        <Wrench className="h-3.5 w-3.5" /> Log Service
      </DialogTrigger>

      <DialogContent className="sm:max-w-md bg-linen border-clay/20">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg text-hearth">
            Log Service
          </DialogTitle>
          <p className="text-sm text-stone">{applianceName}</p>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Service type */}
          <div className="space-y-2">
            <Label className="text-sm text-hearth">What happened?</Label>
            <div className="grid grid-cols-2 gap-2">
              {SERVICE_TYPES.map((st) => {
                const Icon = st.icon;
                const isSelected = type === st.value;
                return (
                  <button
                    key={st.value}
                    onClick={() => setType(st.value)}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      isSelected ? st.color : 'border-clay/20 bg-white text-stone hover:border-clay/40'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {st.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label className="text-sm text-hearth">Date</Label>
            <Input
              type="date"
              className="bg-white"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-sm text-hearth">Description</Label>
            <Textarea
              placeholder="What was done? Any issues found?"
              className="bg-white min-h-[80px] resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Cost + Provider */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-sm text-hearth">Cost (optional)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-stone">$</span>
                <Input
                  type="number"
                  placeholder="0.00"
                  className="bg-white pl-7"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-hearth">Provider (optional)</Label>
              <Input
                placeholder="Company or person"
                className="bg-white"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-xl bg-alert/10 text-alert text-sm text-center">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => { setOpen(false); reset(); }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-ember hover:bg-ember-dark text-white"
            >
              {saving ? 'Saving...' : 'Save'}
              {!saving && <CheckCircle2 className="h-4 w-4 ml-1" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
