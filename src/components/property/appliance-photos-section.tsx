'use client'

import { useState } from 'react'
import {
  Camera, ChevronDown, FileText, Hash, ImageIcon, Info, Refrigerator,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PhotoGallery } from '@/components/shared/photo-gallery'
import { PhotoCaptureButton } from '@/components/shared/photo-capture-button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { Appliance } from '@/types/database'

interface AppliancePhotosSectionProps {
  appliance: Appliance
  propertyId: string
  userId: string
  onPhotosUpdate: (urls: string[]) => void
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

export function AppliancePhotosSection({
  appliance,
  propertyId,
  userId,
  onPhotosUpdate,
}: AppliancePhotosSectionProps) {
  const overviewPhotos = appliance.photo_urls ?? []

  // We track serial/model plate photos and manual/warranty photos locally
  // since these are additional categorized views of the same photo_urls array
  const [serialPlatePhotos, setSerialPlatePhotos] = useState<string[]>([])
  const [manualPhotos, setManualPhotos] = useState<string[]>([])

  // Smart prompts
  const hasSerialPhoto = serialPlatePhotos.length > 0
  const missingSerialNumber = !appliance.serial_number || appliance.serial_number.trim() === ''

  const handleOverviewAdd = (url: string) => {
    const updated = [...overviewPhotos, url]
    onPhotosUpdate(updated)
  }

  const handleOverviewRemove = (url: string) => {
    const updated = overviewPhotos.filter((p) => p !== url)
    onPhotosUpdate(updated)
  }

  return (
    <div className="space-y-4">
      {/* Quick capture hero */}
      <div className="rounded-xl bg-gradient-to-r from-ember/5 to-linen p-4">
        <div className="mb-3 flex items-center gap-2">
          <Camera className="h-4 w-4 text-ember" />
          <p className="text-sm font-medium text-hearth">
            Snap it now, look it up later
          </p>
        </div>
        <p className="mb-3 text-xs text-stone">
          Photograph the model plate, serial number, and warranty card. When you
          need the info, it will be right here.
        </p>
        <PhotoCaptureButton
          onCapture={handleOverviewAdd}
          userId={userId}
          propertyId={propertyId}
          label="Quick Appliance Photo"
        />
      </div>

      {/* Smart prompt: serial number nudge */}
      {hasSerialPhoto && missingSerialNumber && (
        <Card className="border-caution/30 bg-caution/5">
          <CardContent className="flex items-start gap-3 p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-caution/10">
              <Info className="h-4 w-4 text-caution" />
            </div>
            <div>
              <p className="text-sm font-medium text-hearth">
                Serial number photo detected
              </p>
              <p className="mt-0.5 text-xs text-stone">
                You have a photo of the serial plate — want to enter the serial
                number now? Having it typed in makes searching faster.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Appliance Overview Photos */}
      <AccordionSection
        title="Appliance Overview"
        icon={Refrigerator}
        iconColor="bg-ember/10 text-ember"
        photoCount={overviewPhotos.length}
        defaultOpen={true}
      >
        <PhotoGallery
          photos={overviewPhotos}
          onAdd={handleOverviewAdd}
          onRemove={handleOverviewRemove}
          userId={userId}
          propertyId={propertyId}
          maxPhotos={8}
          hint="Capture the appliance from different angles — front, back, and any labels"
        />
      </AccordionSection>

      {/* Model / Serial Number Plate */}
      <AccordionSection
        title="Model / Serial Number Plate"
        icon={Hash}
        iconColor="bg-slate-brand/10 text-slate-brand"
        photoCount={serialPlatePhotos.length}
        defaultOpen={missingSerialNumber}
      >
        <PhotoGallery
          photos={serialPlatePhotos}
          onAdd={(url) => {
            const updated = [...serialPlatePhotos, url]
            setSerialPlatePhotos(updated)
            // Also add to the main photo_urls so it persists
            handleOverviewAdd(url)
          }}
          onRemove={(url) => {
            setSerialPlatePhotos(serialPlatePhotos.filter((p) => p !== url))
            handleOverviewRemove(url)
          }}
          userId={userId}
          propertyId={propertyId}
          maxPhotos={3}
          hint="Photograph the model and serial number plate — usually on the back or inside the door"
        />
        {missingSerialNumber && serialPlatePhotos.length === 0 && (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-linen p-3">
            <ImageIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ember" />
            <p className="text-xs text-stone">
              <span className="font-medium text-hearth">Pro tip:</span> A photo
              of the model plate is the fastest way to capture make, model, and
              serial in one shot.
            </p>
          </div>
        )}
      </AccordionSection>

      {/* Manual / Warranty Card */}
      <AccordionSection
        title="Manual / Warranty Card"
        icon={FileText}
        iconColor="bg-sage/10 text-sage"
        photoCount={manualPhotos.length}
      >
        <PhotoGallery
          photos={manualPhotos}
          onAdd={(url) => {
            const updated = [...manualPhotos, url]
            setManualPhotos(updated)
            handleOverviewAdd(url)
          }}
          onRemove={(url) => {
            setManualPhotos(manualPhotos.filter((p) => p !== url))
            handleOverviewRemove(url)
          }}
          userId={userId}
          propertyId={propertyId}
          maxPhotos={5}
          hint="Photograph the warranty card, receipt, or manual cover for quick reference"
        />
        {manualPhotos.length === 0 && (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-linen p-3">
            <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ember" />
            <p className="text-xs text-stone">
              <span className="font-medium text-hearth">Tip:</span> Snap the
              warranty card and receipt before you lose them. You will thank
              yourself later.
            </p>
          </div>
        )}
      </AccordionSection>
    </div>
  )
}
