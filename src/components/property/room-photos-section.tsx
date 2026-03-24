'use client'

import { useState } from 'react'
import {
  Camera, ChevronDown, Home, Lightbulb, Paintbrush, Plug, Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PhotoGallery } from '@/components/shared/photo-gallery'
import { PhotoCaptureButton } from '@/components/shared/photo-capture-button'
import { Badge } from '@/components/ui/badge'
import type { Room, Json } from '@/types/database'

interface RoomPhotosSectionProps {
  room: Room
  propertyId: string
  userId: string
  onPhotosUpdate: (field: string, urls: string[]) => void
}

interface PaintColor {
  name: string
  brand: string
  code: string
  hex: string
  location: string
  photo_urls?: string[]
}

interface LightBulb {
  location: string
  type: string
  wattage: string
  base: string
  photo_urls?: string[]
}

function parsePaintColors(val: Json): PaintColor[] {
  if (Array.isArray(val)) return val as unknown as PaintColor[]
  return []
}

function parseLightBulbs(val: Json): LightBulb[] {
  if (Array.isArray(val)) return val as unknown as LightBulb[]
  return []
}

function parseFixtures(val: Json): string[] {
  if (Array.isArray(val)) return val as unknown as string[]
  return []
}

interface AccordionSectionProps {
  title: string
  icon: React.ElementType
  iconColor: string
  photoCount: number
  defaultOpen?: boolean
  children: React.ReactNode
}

function AccordionSection({
  title,
  icon: Icon,
  iconColor,
  photoCount,
  defaultOpen = false,
  children,
}: AccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="overflow-hidden rounded-xl border border-clay/20 bg-white">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-linen/50"
      >
        <div className="flex items-center gap-3">
          <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', iconColor)}>
            <Icon className="h-4 w-4" />
          </div>
          <span className="font-heading text-sm font-semibold text-hearth">{title}</span>
          {photoCount > 0 && (
            <Badge variant="secondary" className="bg-ember/10 text-ember text-xs">
              {photoCount} {photoCount === 1 ? 'photo' : 'photos'}
            </Badge>
          )}
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-stone transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      {isOpen && <div className="border-t border-clay/10 px-4 pb-4 pt-3">{children}</div>}
    </div>
  )
}

export function RoomPhotosSection({
  room,
  propertyId,
  userId,
  onPhotosUpdate,
}: RoomPhotosSectionProps) {
  const roomPhotos = room.photo_urls ?? []
  const paintColors = parsePaintColors(room.paint_colors)
  const lightBulbs = parseLightBulbs(room.light_bulbs)
  const fixtures = parseFixtures(room.fixtures)
  const features = room.features ?? []

  // Count total photos across all sections
  const paintPhotoCount = paintColors.reduce(
    (sum, c) => sum + (c.photo_urls?.length ?? 0),
    0
  )
  const bulbPhotoCount = lightBulbs.reduce(
    (sum, b) => sum + (b.photo_urls?.length ?? 0),
    0
  )

  return (
    <div className="space-y-4">
      {/* Quick capture CTA */}
      <div className="rounded-xl bg-gradient-to-r from-ember/5 to-linen p-4">
        <div className="mb-3 flex items-center gap-2">
          <Camera className="h-4 w-4 text-ember" />
          <p className="text-sm font-medium text-hearth">
            Photos now, details later
          </p>
        </div>
        <p className="mb-3 text-xs text-stone">
          Snap photos of paint cans, light bulbs, fixtures, and serial plates.
          You can fill in the details any time.
        </p>
        <PhotoCaptureButton
          onCapture={(url) => onPhotosUpdate('photo_urls', [...roomPhotos, url])}
          userId={userId}
          propertyId={propertyId}
          label="Quick Room Photo"
        />
      </div>

      {/* Room Overview Photos */}
      <AccordionSection
        title="Room Overview Photos"
        icon={Home}
        iconColor="bg-sage/10 text-sage"
        photoCount={roomPhotos.length}
        defaultOpen={true}
      >
        <PhotoGallery
          photos={roomPhotos}
          onAdd={(url) => onPhotosUpdate('photo_urls', [...roomPhotos, url])}
          onRemove={(url) =>
            onPhotosUpdate(
              'photo_urls',
              roomPhotos.filter((p) => p !== url)
            )
          }
          userId={userId}
          propertyId={propertyId}
          maxPhotos={10}
          hint="Capture each angle of the room for a complete visual record"
        />
      </AccordionSection>

      {/* Paint Colors */}
      <AccordionSection
        title="Paint Colors"
        icon={Paintbrush}
        iconColor="bg-ember/10 text-ember"
        photoCount={paintPhotoCount}
      >
        {paintColors.length > 0 ? (
          <div className="space-y-4">
            {paintColors.map((color, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center gap-3">
                  <div
                    className="h-8 w-8 shrink-0 rounded-lg border-2 border-white shadow-sm"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div>
                    <p className="text-sm font-medium text-hearth">{color.name}</p>
                    <p className="text-xs text-stone">
                      {color.brand} {color.code && `\u00B7 ${color.code}`}
                      {color.location && ` \u00B7 ${color.location}`}
                    </p>
                  </div>
                </div>
                <PhotoGallery
                  photos={color.photo_urls ?? []}
                  onAdd={(url) => {
                    const updated = [...paintColors]
                    updated[i] = {
                      ...updated[i],
                      photo_urls: [...(updated[i].photo_urls ?? []), url],
                    }
                    onPhotosUpdate('paint_colors', updated as unknown as string[])
                  }}
                  onRemove={(url) => {
                    const updated = [...paintColors]
                    updated[i] = {
                      ...updated[i],
                      photo_urls: (updated[i].photo_urls ?? []).filter(
                        (p) => p !== url
                      ),
                    }
                    onPhotosUpdate('paint_colors', updated as unknown as string[])
                  }}
                  userId={userId}
                  propertyId={propertyId}
                  maxPhotos={5}
                  hint="Photo the paint can label for easy color matching later"
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-stone">
            No paint colors documented yet. Add paint colors to photograph
            their labels.
          </p>
        )}
      </AccordionSection>

      {/* Fixtures */}
      <AccordionSection
        title="Fixtures"
        icon={Plug}
        iconColor="bg-slate-brand/10 text-slate-brand"
        photoCount={0}
      >
        {fixtures.length > 0 ? (
          <div className="space-y-3">
            {fixtures.map((fixture, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-clay" />
                  <p className="text-sm text-hearth">{fixture}</p>
                </div>
              </div>
            ))}
            <PhotoGallery
              photos={[]}
              onAdd={(url) => onPhotosUpdate('fixture_photos', [url])}
              onRemove={() => {}}
              userId={userId}
              propertyId={propertyId}
              maxPhotos={10}
              hint="Photograph fixture labels and model numbers for easy replacements"
            />
          </div>
        ) : (
          <p className="text-sm text-stone">
            No fixtures documented yet. Add fixtures to photograph their labels.
          </p>
        )}
      </AccordionSection>

      {/* Light Bulbs */}
      <AccordionSection
        title="Light Bulbs"
        icon={Lightbulb}
        iconColor="bg-caution/10 text-caution"
        photoCount={bulbPhotoCount}
      >
        {lightBulbs.length > 0 ? (
          <div className="space-y-4">
            {lightBulbs.map((bulb, i) => (
              <div key={i} className="space-y-2">
                <div className="rounded-lg bg-linen p-2.5">
                  <p className="text-sm font-medium text-hearth">
                    {bulb.location}
                  </p>
                  <p className="text-xs text-stone">
                    <span className="font-mono">{bulb.type}</span>
                    {bulb.wattage && ` \u00B7 ${bulb.wattage}`}
                    {bulb.base && ` \u00B7 ${bulb.base}`}
                  </p>
                </div>
                <PhotoGallery
                  photos={bulb.photo_urls ?? []}
                  onAdd={(url) => {
                    const updated = [...lightBulbs]
                    updated[i] = {
                      ...updated[i],
                      photo_urls: [...(updated[i].photo_urls ?? []), url],
                    }
                    onPhotosUpdate('light_bulbs', updated as unknown as string[])
                  }}
                  onRemove={(url) => {
                    const updated = [...lightBulbs]
                    updated[i] = {
                      ...updated[i],
                      photo_urls: (updated[i].photo_urls ?? []).filter(
                        (p) => p !== url
                      ),
                    }
                    onPhotosUpdate('light_bulbs', updated as unknown as string[])
                  }}
                  userId={userId}
                  propertyId={propertyId}
                  maxPhotos={3}
                  hint="Snap the bulb package for easy replacement"
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-stone">
            No light bulbs documented yet. Add bulbs to photograph their
            packaging.
          </p>
        )}
      </AccordionSection>

      {/* Features */}
      <AccordionSection
        title="Features"
        icon={Sparkles}
        iconColor="bg-sage/10 text-sage"
        photoCount={0}
      >
        {features.length > 0 ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {features.map((feature, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="bg-linen text-hearth"
                >
                  {feature}
                </Badge>
              ))}
            </div>
            <PhotoGallery
              photos={[]}
              onAdd={(url) => onPhotosUpdate('feature_photos', [url])}
              onRemove={() => {}}
              userId={userId}
              propertyId={propertyId}
              maxPhotos={10}
              hint="Photograph noteworthy features — built-ins, crown molding, hardware, etc."
            />
          </div>
        ) : (
          <p className="text-sm text-stone">
            No features documented yet. Add features to photograph them.
          </p>
        )}
      </AccordionSection>
    </div>
  )
}
