'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from '@/components/ui/sheet'
import { Zap, Trash2, X, Lightbulb, StickyNote } from 'lucide-react'

// ---- Types ----

export type Breaker = {
  position: number
  label: string
  amperage: number
  type: 'single' | 'double'
  rooms: string[]
  isMain: boolean
  notes?: string
}

interface BreakerPanelProps {
  propertyId: string
  breakers: Breaker[]
  rooms: Array<{ id: string; name: string }>
  onUpdate: (breakers: Breaker[]) => void
}

// ---- Constants ----

const AMPERAGE_OPTIONS = [15, 20, 30, 40, 50, 60, 100, 200] as const

const LABEL_SUGGESTIONS = [
  'Kitchen Outlets', 'Kitchen Lights', 'Bathroom GFCI', 'Master Bedroom',
  'Bedroom 2', 'Bedroom 3', 'Living Room', 'Dining Room', 'Washer',
  'Dryer', 'Washer/Dryer', 'HVAC', 'Air Conditioner', 'Furnace',
  'Water Heater', 'Garage', 'Garage Door Opener', 'Outdoor Lights',
  'Porch Lights', 'Dishwasher', 'Disposal', 'Microwave', 'Refrigerator',
  'Oven/Range', 'Laundry Room', 'Basement', 'Attic', 'Office',
  'Smoke Detectors', 'Doorbell', 'Sump Pump', 'Pool/Spa',
]

const ROOM_COLORS = [
  '#E8734A', '#7A9E7E', '#5B7B8F', '#C9A227', '#C4A882',
  '#D64545', '#8B8680', '#9B59B6', '#3498DB', '#1ABC9C',
  '#E67E22', '#2ECC71', '#E74C3C', '#F39C12', '#16A085',
]

function getRoomColor(roomId: string, allRooms: Array<{ id: string; name: string }>): string {
  const idx = allRooms.findIndex((r) => r.id === roomId)
  return ROOM_COLORS[idx % ROOM_COLORS.length]
}

// ---- Subcomponents ----

function BreakerSlot({
  breaker,
  side,
  onClick,
  rooms,
  isDoubleBottom,
}: {
  breaker: Breaker | null
  side: 'left' | 'right'
  onClick: () => void
  rooms: Array<{ id: string; name: string }>
  isDoubleBottom?: boolean
}) {
  if (isDoubleBottom) {
    // This slot is the bottom half of a double-pole breaker rendered above
    return null
  }

  const isDouble = breaker?.type === 'double'
  const isMain = breaker?.isMain
  const hasLabel = breaker && breaker.label.trim() !== ''
  const borderColor = breaker?.rooms?.[0] ? getRoomColor(breaker.rooms[0], rooms) : 'transparent'

  return (
    <button
      onClick={onClick}
      className={`
        group relative w-full text-left transition-all duration-200
        ${isDouble ? 'row-span-2' : ''}
        ${isMain
          ? 'col-span-2 h-16'
          : isDouble
            ? 'h-[5.25rem]'
            : 'h-10'
        }
      `}
      style={{ gridColumn: isMain ? '1 / -1' : undefined }}
      aria-label={breaker ? `Breaker ${breaker.position}: ${breaker.label || 'Unlabeled'}` : 'Empty slot'}
    >
      <div
        className={`
          relative flex items-center h-full rounded-md overflow-hidden
          transition-all duration-200 ease-out
          ${isMain
            ? 'bg-gradient-to-b from-red-900 to-red-950 border-2 border-red-700/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_2px_8px_rgba(0,0,0,0.3)]'
            : 'bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] border border-[#3a3a3a]/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_1px_3px_rgba(0,0,0,0.2)]'
          }
          group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_2px_8px_rgba(232,115,74,0.15)]
          group-hover:border-ember/30
          group-active:scale-[0.97] group-active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]
        `}
      >
        {/* Room color indicator */}
        {!isMain && borderColor !== 'transparent' && (
          <div
            className="absolute left-0 top-0 bottom-0 w-1 rounded-l-md"
            style={{ backgroundColor: borderColor }}
          />
        )}

        {/* Breaker toggle nub */}
        <div className={`
          shrink-0 flex items-center justify-center
          ${isMain ? 'w-14 h-10 ml-4' : 'w-8 h-6 ml-2'}
          rounded-sm
          ${isMain
            ? 'bg-gradient-to-b from-red-600 to-red-800 shadow-[0_2px_4px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]'
            : hasLabel
              ? 'bg-gradient-to-b from-[#555] to-[#333] shadow-[0_1px_3px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]'
              : 'bg-gradient-to-b from-[#444] to-[#2a2a2a] shadow-[0_1px_2px_rgba(0,0,0,0.2)]'
          }
        `}>
          <div className={`
            ${isMain ? 'w-8 h-1' : 'w-4 h-0.5'}
            rounded-full bg-white/20
          `} />
        </div>

        {/* Label area */}
        <div className={`flex-1 min-w-0 ${isMain ? 'ml-4' : 'ml-2'} ${side === 'right' ? 'pr-2' : 'pr-1'}`}>
          {isMain ? (
            <div>
              <div className="text-xs font-bold text-red-300 uppercase tracking-wider">MAIN</div>
              <div className="text-[11px] text-red-400/70">
                {breaker?.amperage ? `${breaker.amperage}A` : '200A'}
              </div>
            </div>
          ) : hasLabel ? (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-gray-200 truncate font-medium leading-tight">
                {breaker!.label}
              </span>
              <span className="text-[10px] text-gray-500 shrink-0 font-mono">
                {breaker!.amperage}A
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-gray-600 italic">---</span>
              <span className="text-[9px] text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                Tap to label
              </span>
            </div>
          )}
        </div>

        {/* Position number */}
        {!isMain && breaker && (
          <div className={`shrink-0 text-[9px] text-gray-600 font-mono tabular-nums ${side === 'right' ? 'pr-2' : 'pr-1.5'}`}>
            {breaker.position}
          </div>
        )}

        {/* Notes indicator */}
        {breaker?.notes && (
          <div className="absolute top-0.5 right-0.5">
            <StickyNote className="h-2.5 w-2.5 text-amber-500/60" />
          </div>
        )}

        {/* Double-pole indicator bar */}
        {isDouble && !isMain && (
          <div className="absolute left-[1.125rem] top-1 bottom-1 w-0.5 bg-amber-500/40 rounded-full" />
        )}
      </div>
    </button>
  )
}

function BreakerEditSheet({
  breaker,
  open,
  onOpenChange,
  onSave,
  onDelete,
  rooms,
  existingPositions,
  totalSlots,
}: {
  breaker: Breaker | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (breaker: Breaker) => void
  onDelete: (position: number) => void
  rooms: Array<{ id: string; name: string }>
  existingPositions: Set<number>
  totalSlots: number
}) {
  const [label, setLabel] = useState('')
  const [amperage, setAmperage] = useState(20)
  const [type, setType] = useState<'single' | 'double'>('single')
  const [selectedRooms, setSelectedRooms] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [isMain, setIsMain] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Reset form when breaker changes
  useEffect(() => {
    if (breaker) {
      setLabel(breaker.label)
      setAmperage(breaker.amperage)
      setType(breaker.type)
      setSelectedRooms(breaker.rooms)
      setNotes(breaker.notes || '')
      setIsMain(breaker.isMain)
    } else {
      setLabel('')
      setAmperage(20)
      setType('single')
      setSelectedRooms([])
      setNotes('')
      setIsMain(false)
    }
  }, [breaker, open])

  // Close suggestions on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filteredSuggestions = LABEL_SUGGESTIONS.filter(
    (s) => s.toLowerCase().includes(label.toLowerCase()) && s.toLowerCase() !== label.toLowerCase()
  )

  function handleSave() {
    if (!breaker) return
    onSave({
      position: breaker.position,
      label,
      amperage,
      type,
      rooms: selectedRooms,
      isMain,
      notes: notes.trim() || undefined,
    })
    onOpenChange(false)
  }

  function handleDelete() {
    if (!breaker) return
    onDelete(breaker.position)
    onOpenChange(false)
  }

  function toggleRoom(roomId: string) {
    setSelectedRooms((prev) =>
      prev.includes(roomId) ? prev.filter((r) => r !== roomId) : [...prev, roomId]
    )
  }

  const isEditing = breaker && breaker.label.trim() !== ''

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {isEditing ? 'Edit Breaker' : 'Label Breaker'}
            {breaker && !breaker.isMain && (
              <span className="text-stone font-normal text-sm ml-2">Position {breaker.position}</span>
            )}
          </SheetTitle>
          <SheetDescription>
            {isEditing
              ? 'Update this breaker\'s label and configuration.'
              : 'Give this breaker a name so you know what it controls.'
            }
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 space-y-5 flex-1">
          {/* Label input with suggestions */}
          <div className="space-y-2 relative" ref={suggestionsRef}>
            <Label htmlFor="breaker-label">Label</Label>
            <Input
              id="breaker-label"
              placeholder="e.g., Kitchen Outlets"
              value={label}
              onChange={(e) => {
                setLabel(e.target.value)
                setShowSuggestions(true)
              }}
              onFocus={() => setShowSuggestions(true)}
              className="bg-white"
            />
            {showSuggestions && label.length > 0 && filteredSuggestions.length > 0 && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-clay/20 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                {filteredSuggestions.slice(0, 8).map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm text-hearth hover:bg-linen transition-colors"
                    onClick={() => {
                      setLabel(suggestion)
                      setShowSuggestions(false)
                    }}
                  >
                    <Lightbulb className="h-3 w-3 inline mr-2 text-stone" />
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
            {label.length === 0 && showSuggestions && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-clay/20 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-stone font-semibold border-b border-clay/10">
                  Common labels
                </div>
                {LABEL_SUGGESTIONS.slice(0, 12).map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm text-hearth hover:bg-linen transition-colors"
                    onClick={() => {
                      setLabel(suggestion)
                      setShowSuggestions(false)
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Amperage */}
          <div className="space-y-2">
            <Label>Amperage</Label>
            <div className="flex flex-wrap gap-2">
              {AMPERAGE_OPTIONS.map((amp) => (
                <button
                  key={amp}
                  type="button"
                  onClick={() => setAmperage(amp)}
                  className={`
                    px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150
                    ${amperage === amp
                      ? 'bg-ember text-white shadow-sm'
                      : 'bg-linen text-hearth hover:bg-linen-dark'
                    }
                  `}
                >
                  {amp}A
                </button>
              ))}
            </div>
          </div>

          {/* Type toggle */}
          <div className="space-y-2">
            <Label>Circuit Type</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType('single')}
                className={`
                  flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 border
                  ${type === 'single'
                    ? 'bg-ember text-white border-ember shadow-sm'
                    : 'bg-white text-hearth border-clay/20 hover:border-clay/40'
                  }
                `}
              >
                <Zap className="h-4 w-4 inline mr-1.5" />
                Single Pole (120V)
              </button>
              <button
                type="button"
                onClick={() => setType('double')}
                className={`
                  flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 border
                  ${type === 'double'
                    ? 'bg-ember text-white border-ember shadow-sm'
                    : 'bg-white text-hearth border-clay/20 hover:border-clay/40'
                  }
                `}
              >
                <Zap className="h-4 w-4 inline mr-1.5" />
                Double Pole (240V)
              </button>
            </div>
            <p className="text-[11px] text-stone">
              {type === 'double'
                ? 'For 240V appliances like dryers, AC units, ovens, and water heaters.'
                : 'Standard 120V circuit for outlets and lights.'
              }
            </p>
          </div>

          {/* Room assignment */}
          {rooms.length > 0 && (
            <div className="space-y-2">
              <Label>Rooms Served</Label>
              <div className="flex flex-wrap gap-2">
                {rooms.map((room) => {
                  const isSelected = selectedRooms.includes(room.id)
                  const color = getRoomColor(room.id, rooms)
                  return (
                    <button
                      key={room.id}
                      type="button"
                      onClick={() => toggleRoom(room.id)}
                      className={`
                        px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 border
                        ${isSelected
                          ? 'text-white shadow-sm'
                          : 'bg-white text-hearth border-clay/20 hover:border-clay/40'
                        }
                      `}
                      style={isSelected ? { backgroundColor: color, borderColor: color } : undefined}
                    >
                      {room.name}
                      {isSelected && <X className="h-3 w-3 inline ml-1" />}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="breaker-notes">Notes</Label>
            <Textarea
              id="breaker-notes"
              placeholder="e.g., Trips when running microwave + toaster"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="bg-white resize-none"
            />
          </div>
        </div>

        <SheetFooter className="flex-row gap-2">
          {isEditing && (
            <Button
              variant="outline"
              onClick={handleDelete}
              className="text-alert border-alert/20 hover:bg-alert/5"
            >
              <Trash2 className="h-4 w-4 mr-1" /> Remove
            </Button>
          )}
          <div className="flex-1" />
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-ember hover:bg-ember-dark text-white"
          >
            {isEditing ? 'Save Changes' : 'Add Label'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

// ---- Main Component ----

export function BreakerPanel({ propertyId, breakers, rooms, onUpdate }: BreakerPanelProps) {
  const [editingBreaker, setEditingBreaker] = useState<Breaker | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const totalSlots = 40
  const slotsPerSide = totalSlots / 2

  // Build breaker map by position
  const breakerMap = new Map<number, Breaker>()
  const mainBreaker = breakers.find((b) => b.isMain) || null
  for (const b of breakers) {
    if (!b.isMain) {
      breakerMap.set(b.position, b)
    }
  }

  // Track which positions are occupied by the bottom half of a double
  const doubleBottomPositions = new Set<number>()
  for (const b of breakers) {
    if (b.type === 'double' && !b.isMain) {
      // A double at odd position N occupies N and N+2 (same column)
      // A double at even position N occupies N and N+2
      doubleBottomPositions.add(b.position + 2)
    }
  }

  const existingPositions = new Set(breakers.map((b) => b.position))

  // Build slot arrays: left column = odd (1,3,5,...), right column = even (2,4,6,...)
  const leftPositions: number[] = []
  const rightPositions: number[] = []
  for (let i = 1; i <= totalSlots; i++) {
    if (i % 2 === 1) leftPositions.push(i)
    else rightPositions.push(i)
  }

  function handleSlotClick(position: number, isMainClick?: boolean) {
    if (isMainClick && mainBreaker) {
      setEditingBreaker(mainBreaker)
    } else {
      const existing = breakerMap.get(position)
      setEditingBreaker(
        existing || {
          position,
          label: '',
          amperage: 20,
          type: 'single',
          rooms: [],
          isMain: false,
        }
      )
    }
    setSheetOpen(true)
  }

  function handleSave(updated: Breaker) {
    const newBreakers = breakers.filter(
      (b) => b.position !== updated.position && !(b.isMain && updated.isMain)
    )
    newBreakers.push(updated)
    newBreakers.sort((a, b) => {
      if (a.isMain && !b.isMain) return -1
      if (!a.isMain && b.isMain) return 1
      return a.position - b.position
    })
    onUpdate(newBreakers)
  }

  function handleDelete(position: number) {
    const newBreakers = breakers.filter((b) => b.position !== position)
    onUpdate(newBreakers)
  }

  // Compute stats
  const labeledCount = breakers.filter((b) => b.label.trim() !== '' && !b.isMain).length
  const totalBreakers = breakers.filter((b) => !b.isMain).length

  return (
    <>
      {/* Desktop: Panel visualization */}
      <div className="hidden md:block">
        <div
          className="mx-auto max-w-lg rounded-2xl p-1"
          style={{
            background: 'linear-gradient(145deg, #6b6b6b 0%, #4a4a4a 50%, #3a3a3a 100%)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          {/* Inner panel */}
          <div
            className="rounded-xl p-4"
            style={{
              background: 'linear-gradient(180deg, #2f2f2f 0%, #252525 30%, #1e1e1e 100%)',
              boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.4), inset 0 -1px 0 rgba(255,255,255,0.05)',
            }}
          >
            {/* Panel header label */}
            <div className="text-center mb-3">
              <div
                className="inline-block px-4 py-1 rounded-sm text-[10px] font-mono uppercase tracking-widest text-gray-400"
                style={{
                  background: 'linear-gradient(180deg, #333 0%, #2a2a2a 100%)',
                  border: '1px solid #3a3a3a',
                }}
              >
                Electrical Panel
              </div>
            </div>

            {/* Main breaker */}
            <div className="mb-3">
              <BreakerSlot
                breaker={mainBreaker || {
                  position: 0,
                  label: 'MAIN',
                  amperage: 200,
                  type: 'single',
                  rooms: [],
                  isMain: true,
                }}
                side="left"
                onClick={() => handleSlotClick(0, true)}
                rooms={rooms}
              />
            </div>

            {/* Divider */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
              <Zap className="h-3 w-3 text-gray-600" />
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
            </div>

            {/* Two-column breaker grid */}
            <div className="grid grid-cols-2 gap-x-3">
              {/* Left column (odd positions) */}
              <div className="space-y-1">
                {leftPositions.map((pos) => {
                  if (doubleBottomPositions.has(pos)) return null
                  const breaker = breakerMap.get(pos) || null
                  return (
                    <BreakerSlot
                      key={pos}
                      breaker={breaker || {
                        position: pos,
                        label: '',
                        amperage: 20,
                        type: 'single',
                        rooms: [],
                        isMain: false,
                      }}
                      side="left"
                      onClick={() => handleSlotClick(pos)}
                      rooms={rooms}
                      isDoubleBottom={false}
                    />
                  )
                })}
              </div>

              {/* Right column (even positions) */}
              <div className="space-y-1">
                {rightPositions.map((pos) => {
                  if (doubleBottomPositions.has(pos)) return null
                  const breaker = breakerMap.get(pos) || null
                  return (
                    <BreakerSlot
                      key={pos}
                      breaker={breaker || {
                        position: pos,
                        label: '',
                        amperage: 20,
                        type: 'single',
                        rooms: [],
                        isMain: false,
                      }}
                      side="right"
                      onClick={() => handleSlotClick(pos)}
                      rooms={rooms}
                      isDoubleBottom={false}
                    />
                  )
                })}
              </div>
            </div>

            {/* Panel footer */}
            <div className="mt-3 flex items-center justify-between text-[9px] text-gray-600 font-mono px-1">
              <span>{labeledCount} of {totalSlots} labeled</span>
              <span>40-Space Panel</span>
            </div>
          </div>
        </div>

        {/* Legend */}
        {rooms.length > 0 && breakers.some((b) => b.rooms.length > 0) && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            {rooms
              .filter((room) => breakers.some((b) => b.rooms.includes(room.id)))
              .map((room) => (
                <div key={room.id} className="flex items-center gap-1.5 text-xs text-stone">
                  <div
                    className="h-2.5 w-2.5 rounded-sm"
                    style={{ backgroundColor: getRoomColor(room.id, rooms) }}
                  />
                  {room.name}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Mobile: Scrollable list view */}
      <div className="md:hidden space-y-2">
        {/* Main breaker card */}
        <button
          onClick={() => handleSlotClick(0, true)}
          className="w-full text-left"
        >
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-red-950 to-red-900 border border-red-800/30 shadow-sm">
            <div className="h-10 w-10 rounded-lg bg-red-800/50 flex items-center justify-center">
              <Zap className="h-5 w-5 text-red-300" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-red-200">MAIN BREAKER</div>
              <div className="text-xs text-red-400/70">{mainBreaker?.amperage || 200}A</div>
            </div>
            <Badge className="bg-red-800/40 text-red-300 border-red-700/30 text-[10px]">MAIN</Badge>
          </div>
        </button>

        {/* All breaker slots as a list */}
        <div className="space-y-1">
          {Array.from({ length: totalSlots }, (_, i) => i + 1).map((pos) => {
            if (doubleBottomPositions.has(pos)) return null
            const breaker = breakerMap.get(pos) || null
            const hasLabel = breaker && breaker.label.trim() !== ''
            const borderColor = breaker?.rooms?.[0] ? getRoomColor(breaker.rooms[0], rooms) : undefined
            const isDouble = breaker?.type === 'double'

            return (
              <button
                key={pos}
                onClick={() => handleSlotClick(pos)}
                className="w-full text-left"
              >
                <div
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all duration-150
                    ${hasLabel
                      ? 'bg-white border-clay/20 shadow-sm'
                      : 'bg-linen/50 border-clay/10'
                    }
                    active:scale-[0.98]
                  `}
                  style={borderColor ? { borderLeftColor: borderColor, borderLeftWidth: '3px' } : undefined}
                >
                  <div className={`
                    h-8 w-8 rounded-md flex items-center justify-center shrink-0
                    ${hasLabel ? 'bg-ember/10' : 'bg-stone/5'}
                  `}>
                    <Zap className={`h-4 w-4 ${hasLabel ? 'text-ember' : 'text-stone/30'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    {hasLabel ? (
                      <>
                        <div className="text-sm font-medium text-hearth truncate">{breaker!.label}</div>
                        <div className="text-[11px] text-stone">
                          {breaker!.amperage}A {isDouble ? '240V' : '120V'}
                          {breaker!.rooms.length > 0 && (
                            <> &middot; {breaker!.rooms.map((rId) => rooms.find((r) => r.id === rId)?.name).filter(Boolean).join(', ')}</>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-stone/50 italic">Tap to label</div>
                    )}
                  </div>
                  <div className="text-[10px] text-stone/40 font-mono shrink-0">#{pos}</div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Edit sheet */}
      <BreakerEditSheet
        breaker={editingBreaker}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSave={handleSave}
        onDelete={handleDelete}
        rooms={rooms}
        existingPositions={existingPositions}
        totalSlots={totalSlots}
      />
    </>
  )
}
