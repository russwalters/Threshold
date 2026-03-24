'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Wind,
  Droplets,
  Lightbulb,
  Battery,
  Sparkles,
  Package,
  Plus,
  ShoppingCart,
  RotateCcw,
  ExternalLink,
  Loader2,
} from 'lucide-react'
import { markReplaced } from '@/app/actions/consumables'
import { ConsumableForm } from './consumable-form'
import type { Consumable, Appliance } from '@/types/database'

const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  air_filter: { label: 'Air Filters', icon: Wind, color: 'bg-slate-brand/10 text-slate-brand' },
  water_filter: { label: 'Water Filters', icon: Droplets, color: 'bg-blue-100 text-blue-600' },
  light_bulb: { label: 'Light Bulbs', icon: Lightbulb, color: 'bg-caution/10 text-caution' },
  battery: { label: 'Batteries', icon: Battery, color: 'bg-sage/10 text-sage' },
  cleaning: { label: 'Cleaning Supplies', icon: Sparkles, color: 'bg-purple-100 text-purple-600' },
  other: { label: 'Other', icon: Package, color: 'bg-stone/10 text-stone' },
}

function getStatus(nextReplacement: string | null): 'good' | 'due_soon' | 'overdue' {
  if (!nextReplacement) return 'good'
  const now = new Date()
  const due = new Date(nextReplacement)
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return 'overdue'
  if (diffDays <= 14) return 'due_soon'
  return 'good'
}

function getRelativeTime(nextReplacement: string | null): string {
  if (!nextReplacement) return 'No schedule'
  const now = new Date()
  const due = new Date(nextReplacement)
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} overdue`
  if (diffDays === 0) return 'Due today'
  if (diffDays === 1) return 'Due tomorrow'
  return `in ${diffDays} days`
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  good: { label: 'Good', className: 'bg-sage/10 text-sage border-sage/20' },
  due_soon: { label: 'Replace Soon', className: 'bg-caution/10 text-caution border-caution/20' },
  overdue: { label: 'Overdue', className: 'bg-alert/10 text-alert border-alert/20' },
}

interface ConsumablesTabProps {
  propertyId: string
  consumables: Consumable[]
  appliances: Appliance[]
}

export function ConsumablesTab({ propertyId, consumables, appliances }: ConsumablesTabProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingConsumable, setEditingConsumable] = useState<Consumable | undefined>(undefined)
  const [isPending, startTransition] = useTransition()
  const [replacingId, setReplacingId] = useState<string | null>(null)

  const filtered = categoryFilter === 'all'
    ? consumables
    : consumables.filter((c) => c.category === categoryFilter)

  // Group by category
  const grouped = filtered.reduce<Record<string, Consumable[]>>((acc, c) => {
    const cat = c.category || 'other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(c)
    return acc
  }, {})

  const categories = Object.keys(CATEGORY_CONFIG)
  const usedCategories = [...new Set(consumables.map((c) => c.category || 'other'))]

  function handleMarkReplaced(id: string) {
    setReplacingId(id)
    startTransition(async () => {
      await markReplaced(id)
      setReplacingId(null)
    })
  }

  function handleEdit(consumable: Consumable) {
    setEditingConsumable(consumable)
    setDialogOpen(true)
  }

  function handleAddNew() {
    setEditingConsumable(undefined)
    setDialogOpen(true)
  }

  function handleFormSuccess() {
    setDialogOpen(false)
    setEditingConsumable(undefined)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="font-heading text-xl font-semibold text-hearth">
          Consumables ({consumables.length})
        </h2>
        <div className="flex items-center gap-2">
          <Select value={categoryFilter} onValueChange={(v) => v && setCategoryFilter(v)}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {CATEGORY_CONFIG[cat].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger
              render={<Button className="bg-ember hover:bg-ember-dark text-white" size="sm" onClick={handleAddNew} />}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Consumable
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-heading">
                  {editingConsumable ? 'Edit Consumable' : 'Add Consumable'}
                </DialogTitle>
              </DialogHeader>
              <ConsumableForm
                propertyId={propertyId}
                appliances={appliances}
                consumable={editingConsumable}
                onSuccess={handleFormSuccess}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-12 w-12 text-stone/30 mx-auto mb-4" />
          <h3 className="font-heading text-lg font-semibold text-hearth mb-2">
            No consumables tracked yet
          </h3>
          <p className="text-stone max-w-md mx-auto mb-6">
            Add filters, bulbs, and supplies to get replacement reminders.
          </p>
          <Button
            className="bg-ember hover:bg-ember-dark text-white"
            onClick={handleAddNew}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Your First Consumable
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([category, items]) => {
            const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.other
            const Icon = config.icon
            return (
              <div key={category}>
                <div className="flex items-center gap-2 mb-4">
                  <div className={`h-8 w-8 rounded-lg ${config.color} flex items-center justify-center`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-hearth">
                    {config.label}
                  </h3>
                  <Badge variant="secondary" className="ml-1">
                    {items.length}
                  </Badge>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
                  {items.map((consumable) => {
                    const status = getStatus(consumable.next_replacement)
                    const statusBadge = STATUS_BADGE[status]
                    const relTime = getRelativeTime(consumable.next_replacement)
                    const appliance = consumable.appliance_id
                      ? appliances.find((a) => a.id === consumable.appliance_id)
                      : null
                    const isReplacing = replacingId === consumable.id

                    return (
                      <Card
                        key={consumable.id}
                        className="bg-white border-clay/20 hover:shadow-lg hover:border-ember/20 transition-all duration-300 group cursor-pointer"
                        onClick={() => handleEdit(consumable)}
                      >
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className={`h-10 w-10 rounded-xl ${config.color} flex items-center justify-center`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <Badge className={statusBadge.className}>
                              {statusBadge.label}
                            </Badge>
                          </div>

                          <h4 className="font-heading font-semibold text-hearth group-hover:text-ember transition-colors">
                            {consumable.name}
                          </h4>

                          {(consumable.brand || consumable.model) && (
                            <p className="text-sm text-stone mt-0.5">
                              {[consumable.brand, consumable.model].filter(Boolean).join(' · ')}
                            </p>
                          )}

                          {consumable.size && (
                            <p className="text-xs font-mono text-stone/70 mt-0.5">
                              {consumable.size}
                            </p>
                          )}

                          {appliance && (
                            <p className="text-xs text-ember/70 mt-1 flex items-center gap-1">
                              <ExternalLink className="h-3 w-3" />
                              {appliance.name}
                            </p>
                          )}

                          <div className="mt-3 flex items-center justify-between">
                            <span className={`text-xs font-medium ${
                              status === 'overdue' ? 'text-alert' :
                              status === 'due_soon' ? 'text-caution' :
                              'text-stone'
                            }`}>
                              {relTime}
                            </span>
                            {consumable.quantity_on_hand > 0 && (
                              <span className="text-xs text-stone">
                                {consumable.quantity_on_hand} on hand
                              </span>
                            )}
                          </div>

                          {/* Action buttons */}
                          <div className="mt-4 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 text-xs"
                              disabled={isReplacing || isPending}
                              onClick={() => handleMarkReplaced(consumable.id)}
                            >
                              {isReplacing ? (
                                <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                              ) : (
                                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                              )}
                              Replace
                            </Button>

                            {consumable.purchase_url && (
                              <Button
                                size="sm"
                                className="flex-1 text-xs bg-[#FF9900] hover:bg-[#E88B00] text-white"
                                onClick={() => window.open(consumable.purchase_url!, '_blank')}
                              >
                                <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                                Buy
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
