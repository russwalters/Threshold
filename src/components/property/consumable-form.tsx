'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, Zap } from 'lucide-react'
import { ImageUpload } from '@/components/shared/image-upload'
import { createConsumable, updateConsumable } from '@/app/actions/consumables'
import type { Consumable, Appliance } from '@/types/database'

const CATEGORIES = [
  { value: 'air_filter', label: 'Air Filter' },
  { value: 'water_filter', label: 'Water Filter' },
  { value: 'light_bulb', label: 'Light Bulb' },
  { value: 'battery', label: 'Battery' },
  { value: 'cleaning', label: 'Cleaning Supply' },
  { value: 'other', label: 'Other' },
]

const INTERVAL_UNITS = [
  { value: 'days', label: 'Days', multiplier: 1 },
  { value: 'weeks', label: 'Weeks', multiplier: 7 },
  { value: 'months', label: 'Months', multiplier: 30 },
]

const PRESETS = [
  { label: 'Air Filter (90 days)', name: 'Air Filter', category: 'air_filter', intervalDays: 90 },
  { label: 'Water Filter (180 days)', name: 'Water Filter', category: 'water_filter', intervalDays: 180 },
  { label: 'Smoke Detector Battery (365 days)', name: 'Smoke Detector Battery', category: 'battery', intervalDays: 365 },
]

function daysToUnitValue(days: number): { value: number; unit: string } {
  if (days % 30 === 0) return { value: days / 30, unit: 'months' }
  if (days % 7 === 0) return { value: days / 7, unit: 'weeks' }
  return { value: days, unit: 'days' }
}

interface ConsumableFormProps {
  propertyId: string
  appliances: Appliance[]
  consumable?: Consumable
  onSuccess: () => void
}

export function ConsumableForm({
  propertyId,
  appliances,
  consumable,
  onSuccess,
}: ConsumableFormProps) {
  const isEditing = !!consumable

  const existingInterval = consumable?.replacement_interval_days
    ? daysToUnitValue(consumable.replacement_interval_days)
    : { value: '', unit: 'days' }

  const [name, setName] = useState(consumable?.name ?? '')
  const [category, setCategory] = useState(consumable?.category ?? 'other')
  const [brand, setBrand] = useState(consumable?.brand ?? '')
  const [model, setModel] = useState(consumable?.model ?? '')
  const [size, setSize] = useState(consumable?.size ?? '')
  const [applianceId, setApplianceId] = useState(consumable?.appliance_id ?? '')
  const [purchaseUrl, setPurchaseUrl] = useState(consumable?.purchase_url ?? '')
  const [lastReplaced, setLastReplaced] = useState(consumable?.last_replaced ?? '')
  const [intervalValue, setIntervalValue] = useState<string | number>(existingInterval.value)
  const [intervalUnit, setIntervalUnit] = useState(existingInterval.unit)
  const [quantityOnHand, setQuantityOnHand] = useState(consumable?.quantity_on_hand ?? 0)
  const [photoUrl, setPhotoUrl] = useState(consumable?.photo_url ?? '')
  const [notes, setNotes] = useState(consumable?.notes ?? '')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function applyPreset(preset: typeof PRESETS[number]) {
    setName(preset.name)
    setCategory(preset.category)
    const converted = daysToUnitValue(preset.intervalDays)
    setIntervalValue(converted.value)
    setIntervalUnit(converted.unit)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Name is required')
      return
    }

    const unitMultiplier = INTERVAL_UNITS.find((u) => u.value === intervalUnit)?.multiplier ?? 1
    const totalDays = intervalValue ? Number(intervalValue) * unitMultiplier : null

    const formData = new FormData()
    formData.set('name', name.trim())
    formData.set('category', category)
    formData.set('brand', brand)
    formData.set('model', model)
    formData.set('size', size)
    formData.set('appliance_id', applianceId)
    formData.set('purchase_url', purchaseUrl)
    formData.set('last_replaced', lastReplaced)
    if (totalDays !== null) {
      formData.set('replacement_interval_days', String(totalDays))
    }
    formData.set('quantity_on_hand', String(quantityOnHand))
    formData.set('photo_url', photoUrl)
    formData.set('notes', notes)

    startTransition(async () => {
      const result = isEditing
        ? await updateConsumable(consumable!.id, formData)
        : await createConsumable(propertyId, formData)

      if (result.error) {
        setError(result.error)
      } else {
        onSuccess()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Quick presets */}
      {!isEditing && (
        <div>
          <Label className="text-xs text-stone mb-2 block">Quick Presets</Label>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <Badge
                key={preset.label}
                variant="secondary"
                className="cursor-pointer hover:bg-ember/10 hover:text-ember transition-colors"
                onClick={() => applyPreset(preset)}
              >
                <Zap className="h-3 w-3 mr-1" />
                {preset.label}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Name */}
      <div>
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., HVAC Air Filter"
          className="bg-white"
        />
      </div>

      {/* Category */}
      <div>
        <Label>Category</Label>
        <Select value={category} onValueChange={(v) => v && setCategory(v)}>
          <SelectTrigger className="bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Brand + Model */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="brand">Brand</Label>
          <Input
            id="brand"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="e.g., Filtrete"
            className="bg-white"
          />
        </div>
        <div>
          <Label htmlFor="model">Model / Part Number</Label>
          <Input
            id="model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="e.g., MPR 1500"
            className="bg-white"
          />
        </div>
      </div>

      {/* Size */}
      <div>
        <Label htmlFor="size">Size</Label>
        <Input
          id="size"
          value={size}
          onChange={(e) => setSize(e.target.value)}
          placeholder='e.g., 20x25x1 for air filters'
          className="bg-white"
        />
      </div>

      {/* Associated Appliance */}
      <div>
        <Label>Associated Appliance</Label>
        <Select value={applianceId || 'none'} onValueChange={(v) => setApplianceId(v === 'none' ? '' : v ?? '')}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="None" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {appliances.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name}{a.brand ? ` (${a.brand})` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Purchase URL */}
      <div>
        <Label htmlFor="purchase_url">Purchase URL</Label>
        <Input
          id="purchase_url"
          type="url"
          value={purchaseUrl}
          onChange={(e) => setPurchaseUrl(e.target.value)}
          placeholder="Paste an Amazon link or search URL"
          className="bg-white"
        />
        <p className="text-xs text-stone mt-1">Paste an Amazon link or search URL</p>
      </div>

      {/* Last Replaced */}
      <div>
        <Label htmlFor="last_replaced">Last Replaced</Label>
        <Input
          id="last_replaced"
          type="date"
          value={lastReplaced}
          onChange={(e) => setLastReplaced(e.target.value)}
          className="bg-white"
        />
      </div>

      {/* Replacement Interval */}
      <div>
        <Label>Replacement Interval</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            value={intervalValue}
            onChange={(e) => setIntervalValue(e.target.value)}
            placeholder="e.g., 90"
            className="bg-white flex-1"
          />
          <Select value={intervalUnit} onValueChange={(v) => v && setIntervalUnit(v)}>
            <SelectTrigger className="w-[120px] bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INTERVAL_UNITS.map((u) => (
                <SelectItem key={u.value} value={u.value}>
                  {u.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quantity on Hand */}
      <div>
        <Label htmlFor="quantity">Quantity On Hand</Label>
        <Input
          id="quantity"
          type="number"
          min={0}
          value={quantityOnHand}
          onChange={(e) => setQuantityOnHand(Number(e.target.value))}
          className="bg-white w-32"
        />
      </div>

      {/* Photo */}
      <div>
        <Label>Photo</Label>
        <ImageUpload
          currentImageUrl={photoUrl || undefined}
          onUpload={({ url }) => setPhotoUrl(url)}
          onRemove={() => setPhotoUrl('')}
          userId=""
          propertyId={propertyId}
          variant="photo"
        />
      </div>

      {/* Notes */}
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional notes..."
          className="bg-white"
          rows={3}
        />
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-alert">{error}</p>
      )}

      {/* Submit */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="submit"
          className="bg-ember hover:bg-ember-dark text-white"
          disabled={isPending}
        >
          {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isEditing ? 'Save Changes' : 'Add Consumable'}
        </Button>
      </div>
    </form>
  )
}
