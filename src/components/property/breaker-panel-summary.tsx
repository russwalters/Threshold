'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Zap, ChevronRight } from 'lucide-react'

export type Breaker = {
  position: number
  label: string
  amperage: number
  type: 'single' | 'double'
  rooms: string[]
  isMain: boolean
  notes?: string
}

interface BreakerPanelSummaryProps {
  breakers: Breaker[]
  totalSlots?: number
  onOpenFullPanel?: () => void
  rooms?: Array<{ id: string; name: string }>
}

const ROOM_COLORS = [
  '#E8734A', '#7A9E7E', '#5B7B8F', '#C9A227', '#C4A882',
  '#D64545', '#8B8680', '#9B59B6', '#3498DB', '#1ABC9C',
  '#E67E22', '#2ECC71', '#E74C3C', '#F39C12', '#16A085',
]

function getRoomColor(roomId: string, allRooms: Array<{ id: string; name: string }>): string {
  const idx = allRooms.findIndex((r) => r.id === roomId)
  return ROOM_COLORS[idx % ROOM_COLORS.length]
}

export function BreakerPanelSummary({
  breakers,
  totalSlots = 40,
  onOpenFullPanel,
  rooms = [],
}: BreakerPanelSummaryProps) {
  const labeledBreakers = breakers.filter((b) => b.label.trim() !== '' && !b.isMain)
  const labeledCount = labeledBreakers.length
  const completionPercent = totalSlots > 0 ? Math.round((labeledCount / totalSlots) * 100) : 0

  const mainBreaker = breakers.find((b) => b.isMain)

  // Group breakers by room
  const breakersByRoom = new Map<string, Breaker[]>()
  const unassigned: Breaker[] = []

  for (const b of labeledBreakers) {
    if (b.rooms.length === 0) {
      unassigned.push(b)
    } else {
      for (const roomId of b.rooms) {
        if (!breakersByRoom.has(roomId)) {
          breakersByRoom.set(roomId, [])
        }
        breakersByRoom.get(roomId)!.push(b)
      }
    }
  }

  // Empty state
  if (labeledCount === 0) {
    return (
      <Card className="bg-white border-clay/20">
        <CardContent className="p-6 text-center">
          <div className="h-14 w-14 rounded-2xl bg-caution/10 flex items-center justify-center mx-auto mb-4">
            <Zap className="h-7 w-7 text-caution" />
          </div>
          <h3 className="font-heading text-lg font-semibold text-hearth mb-2">
            Map Your Breaker Panel
          </h3>
          <p className="text-sm text-stone mb-5 max-w-sm mx-auto leading-relaxed">
            Map your breaker panel to know exactly which switch controls what. No more guessing during an outage.
          </p>
          {onOpenFullPanel && (
            <Button
              onClick={onOpenFullPanel}
              className="bg-ember hover:bg-ember-dark text-white"
            >
              <Zap className="h-4 w-4 mr-2" />
              Start Labeling
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white border-clay/20 overflow-hidden">
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-caution/10 flex items-center justify-center">
              <Zap className="h-5 w-5 text-caution" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-hearth">Breaker Panel</h3>
              {mainBreaker && (
                <span className="text-xs text-stone">{mainBreaker.amperage}A Main</span>
              )}
            </div>
          </div>
          <Badge
            className={`text-[10px] ${
              completionPercent === 100
                ? 'bg-sage/10 text-sage border-sage/20'
                : completionPercent > 50
                  ? 'bg-caution/10 text-caution border-caution/20'
                  : 'bg-stone/10 text-stone border-stone/20'
            }`}
          >
            {labeledCount} of {totalSlots} labeled
          </Badge>
        </div>

        {/* Progress */}
        <div className="space-y-1.5">
          <Progress value={completionPercent} className="h-2" />
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-stone">{completionPercent}% mapped</span>
            <span className={completionPercent === 100 ? 'text-sage font-medium' : 'text-stone'}>
              {completionPercent === 100
                ? 'Fully mapped!'
                : `${totalSlots - labeledCount} remaining`
              }
            </span>
          </div>
        </div>

        {/* Mini panel visualization */}
        <div className="py-2">
          <div
            className="mx-auto rounded-lg p-2 max-w-xs"
            style={{
              background: 'linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%)',
              boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.3)',
            }}
          >
            {/* Main breaker mini */}
            <div className="h-3 rounded-sm mb-1.5 mx-auto w-3/4 bg-gradient-to-r from-red-900 to-red-800 border border-red-700/30" />

            {/* Mini grid */}
            <div className="grid grid-cols-2 gap-x-1.5 gap-y-[3px]">
              {Array.from({ length: totalSlots }, (_, i) => {
                const pos = i + 1
                const breaker = breakers.find((b) => !b.isMain && b.position === pos)
                const hasLabel = breaker && breaker.label.trim() !== ''
                const roomColor = breaker?.rooms?.[0]
                  ? getRoomColor(breaker.rooms[0], rooms)
                  : undefined

                return (
                  <div
                    key={pos}
                    className="h-1.5 rounded-[2px]"
                    style={{
                      backgroundColor: hasLabel
                        ? roomColor || '#E8734A'
                        : 'rgba(255,255,255,0.06)',
                    }}
                  />
                )
              })}
            </div>
          </div>
        </div>

        {/* Breakers by room */}
        {(breakersByRoom.size > 0 || unassigned.length > 0) && (
          <div className="space-y-2">
            {Array.from(breakersByRoom.entries()).map(([roomId, roomBreakers]) => {
              const room = rooms.find((r) => r.id === roomId)
              const color = getRoomColor(roomId, rooms)
              return (
                <div key={roomId} className="flex items-start gap-2">
                  <div
                    className="h-3 w-3 rounded-sm shrink-0 mt-0.5"
                    style={{ backgroundColor: color }}
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-hearth">
                      {room?.name || 'Unknown Room'}
                    </div>
                    <div className="text-[11px] text-stone">
                      {roomBreakers.map((b) => `${b.label} (${b.amperage}A)`).join(', ')}
                    </div>
                  </div>
                </div>
              )
            })}
            {unassigned.length > 0 && (
              <div className="flex items-start gap-2">
                <div className="h-3 w-3 rounded-sm shrink-0 mt-0.5 bg-stone/20" />
                <div className="min-w-0">
                  <div className="text-xs font-medium text-stone">Unassigned</div>
                  <div className="text-[11px] text-stone/70">
                    {unassigned.map((b) => `${b.label} (${b.amperage}A)`).join(', ')}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Open full panel button */}
        {onOpenFullPanel && (
          <Button
            onClick={onOpenFullPanel}
            variant="outline"
            className="w-full group"
          >
            <Zap className="h-4 w-4 mr-2 text-ember" />
            Open Full Panel
            <ChevronRight className="h-4 w-4 ml-auto text-stone group-hover:text-ember transition-colors" />
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
