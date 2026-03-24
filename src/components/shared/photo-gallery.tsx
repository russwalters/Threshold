'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Camera, ChevronLeft, ChevronRight, ImagePlus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ImageUpload } from '@/components/shared/image-upload'
import { Button } from '@/components/ui/button'

interface PhotoGalleryProps {
  photos: string[]
  onAdd: (url: string) => void
  onRemove: (url: string) => void
  userId: string
  propertyId: string
  maxPhotos?: number
  label?: string
  hint?: string
  className?: string
}

export function PhotoGallery({
  photos,
  onAdd,
  onRemove,
  userId,
  propertyId,
  maxPhotos = 10,
  label,
  hint,
  className,
}: PhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const lightboxRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number | null>(null)

  const canAdd = photos.length < maxPhotos

  // Close lightbox on Escape
  useEffect(() => {
    if (lightboxIndex === null) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null)
      if (e.key === 'ArrowRight') setLightboxIndex((prev) => prev !== null ? Math.min(prev + 1, photos.length - 1) : null)
      if (e.key === 'ArrowLeft') setLightboxIndex((prev) => prev !== null ? Math.max(prev - 1, 0) : null)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightboxIndex, photos.length])

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [lightboxIndex])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }, [])

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null || lightboxIndex === null) return
      const deltaX = e.changedTouches[0].clientX - touchStartX.current
      if (Math.abs(deltaX) > 60) {
        if (deltaX < 0 && lightboxIndex < photos.length - 1) {
          setLightboxIndex(lightboxIndex + 1)
        } else if (deltaX > 0 && lightboxIndex > 0) {
          setLightboxIndex(lightboxIndex - 1)
        }
      }
      touchStartX.current = null
    },
    [lightboxIndex, photos.length]
  )

  const handleUploadComplete = useCallback(
    (result: { url: string; path: string }) => {
      onAdd(result.url)
      setShowUpload(false)
    },
    [onAdd]
  )

  return (
    <div className={cn('space-y-2', className)}>
      {/* Label row */}
      {(label || maxPhotos) && (
        <div className="flex items-center justify-between">
          {label && (
            <label className="text-sm font-medium text-hearth">{label}</label>
          )}
          {photos.length > 0 && (
            <span className="text-xs text-stone">
              {photos.length} of {maxPhotos}
            </span>
          )}
        </div>
      )}

      {/* Photo grid */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {photos.map((photo, index) => (
          <div
            key={photo}
            className="group relative aspect-square cursor-pointer overflow-hidden rounded-xl bg-linen"
            onClick={() => setLightboxIndex(index)}
          >
            <img
              src={photo}
              alt={`Photo ${index + 1}`}
              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
            {/* Remove button on hover */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onRemove(photo)
              }}
              className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-hearth/70 text-white opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-alert"
              aria-label="Remove photo"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            {/* Subtle gradient for depth */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-hearth/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        ))}

        {/* Add Photo card */}
        {canAdd && !showUpload && (
          <button
            type="button"
            onClick={() => setShowUpload(true)}
            className={cn(
              'flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-clay/40 bg-linen/50 transition-all duration-200',
              'hover:border-ember/50 hover:bg-ember/5 active:scale-95'
            )}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ember/10">
              <Camera className="h-4.5 w-4.5 text-ember" />
            </div>
            <span className="text-xs font-medium text-hearth">Add Photo</span>
          </button>
        )}
      </div>

      {/* Upload component (slides in when adding) */}
      {showUpload && canAdd && (
        <div className="relative rounded-xl border border-clay/20 bg-white p-3">
          <button
            type="button"
            onClick={() => setShowUpload(false)}
            className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-linen text-stone transition-colors hover:bg-clay/20 hover:text-hearth"
            aria-label="Cancel upload"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <ImageUpload
            onUpload={handleUploadComplete}
            userId={userId}
            propertyId={propertyId}
            className="aspect-[3/2]"
          />
        </div>
      )}

      {/* Empty state: just the prompt */}
      {photos.length === 0 && !showUpload && (
        <p className="text-xs text-stone/70">
          No photos yet — tap the camera to start capturing.
        </p>
      )}

      {/* Hint */}
      {hint && (
        <p className="flex items-start gap-1.5 text-xs text-stone/80">
          <ImagePlus className="mt-0.5 h-3 w-3 shrink-0 text-ember/60" />
          {hint}
        </p>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && photos[lightboxIndex] && (
        <div
          ref={lightboxRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-hearth/90 backdrop-blur-sm"
          onClick={() => setLightboxIndex(null)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Close lightbox"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Counter */}
          <div className="absolute left-4 top-4 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-sm">
            {lightboxIndex + 1} / {photos.length}
          </div>

          {/* Previous */}
          {lightboxIndex > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setLightboxIndex(lightboxIndex - 1)
              }}
              className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          {/* Image */}
          <img
            src={photos[lightboxIndex]}
            alt={`Photo ${lightboxIndex + 1}`}
            className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next */}
          {lightboxIndex < photos.length - 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setLightboxIndex(lightboxIndex + 1)
              }}
              className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              aria-label="Next photo"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
