'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Package, ShoppingCart, ChevronRight } from 'lucide-react'

interface Replacement {
  id: string
  name: string
  property_name: string
  next_replacement: string
  purchase_url: string | null
}

interface UpcomingReplacementsProps {
  replacements: Replacement[]
}

function getDaysUntil(dateStr: string): number {
  const now = new Date()
  const due = new Date(dateStr)
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function getDueLabel(days: number): { text: string; className: string } {
  if (days < 0) {
    return {
      text: `${Math.abs(days)}d overdue`,
      className: 'bg-alert/10 text-alert border-alert/20',
    }
  }
  if (days === 0) {
    return { text: 'Due today', className: 'bg-caution/10 text-caution border-caution/20' }
  }
  if (days <= 14) {
    return { text: `${days}d left`, className: 'bg-caution/10 text-caution border-caution/20' }
  }
  return { text: `${days}d left`, className: 'bg-sage/10 text-sage border-sage/20' }
}

export function UpcomingReplacements({ replacements }: UpcomingReplacementsProps) {
  const visible = replacements.slice(0, 5)

  return (
    <Card className="bg-white border-clay/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-heading text-lg flex items-center gap-2">
            <Package className="h-5 w-5 text-ember" />
            Upcoming Replacements
          </CardTitle>
          {replacements.length > 5 && (
            <Link href="/dashboard?tab=consumables">
              <Button variant="ghost" size="sm" className="text-xs text-ember hover:text-ember-dark">
                View all <ChevronRight className="h-3 w-3 ml-0.5" />
              </Button>
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {visible.length === 0 ? (
          <div className="text-center py-6">
            <Package className="h-8 w-8 text-stone/30 mx-auto mb-2" />
            <p className="text-sm text-stone">No replacements due</p>
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map((item) => {
              const days = getDaysUntil(item.next_replacement)
              const due = getDueLabel(days)
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg bg-linen/50 hover:bg-linen transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm text-hearth truncate">
                      {item.name}
                    </div>
                    <div className="text-xs text-stone truncate">
                      {item.property_name}
                    </div>
                  </div>

                  <Badge className={`shrink-0 text-[10px] ${due.className}`}>
                    {due.text}
                  </Badge>

                  {item.purchase_url && (
                    <a
                      href={item.purchase_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        size="sm"
                        className="h-7 px-2 text-[10px] bg-[#FF9900] hover:bg-[#E88B00] text-white shrink-0"
                      >
                        <ShoppingCart className="h-3 w-3 mr-0.5" />
                        Buy
                      </Button>
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
