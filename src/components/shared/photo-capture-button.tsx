'use client'

import { useCallback, useRef, useState } from 'react'
import { Camera } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { uploadImage } from '@/lib/storage'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

interface PhotoCaptureButtonProps {
  onCapture: (url: string) => void
  userId: string
  propertyId: string
  className?: string
  label?: string
}

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export function PhotoCaptureButton({
  onCapture,
  userId,
  propertyId,
  className,
  label = 'Take Photo',
}: PhotoCaptureButtonProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    async (file: File) => {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast.error('Please select a valid image (PNG, JPG, GIF, or WebP)')
        return
      }

      if (file.size > MAX_SIZE) {
        toast.error('Image is too large. Maximum size is 10MB.')
        return
      }

      setIsUploading(true)
      setProgress(10)

      try {
        const progressInterval = setInterval(() => {
          setProgress((prev) => Math.min(prev + 15, 85))
        }, 200)

        const result = await uploadImage(file, userId, propertyId)

        clearInterval(progressInterval)
        setProgress(100)

        toast.success('Photo captured!')
        onCapture(result.url)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed'
        toast.error(message)
      } finally {
        setTimeout(() => {
          setIsUploading(false)
          setProgress(0)
        }, 500)
      }
    },
    [userId, propertyId, onCapture]
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
      if (inputRef.current) inputRef.current.value = ''
    },
    [handleFile]
  )

  return (
    <div className={cn('relative', className)}>
      <Button
        type="button"
        onClick={() => !isUploading && inputRef.current?.click()}
        disabled={isUploading}
        className={cn(
          'relative w-full gap-2 bg-ember text-white shadow-md hover:bg-ember-dark active:scale-[0.98]',
          'h-12 rounded-xl text-sm font-semibold',
          isUploading && 'pointer-events-none'
        )}
      >
        {isUploading ? (
          <div className="flex w-full flex-col items-center gap-1.5">
            <span className="text-xs font-medium">Uploading...</span>
            <div className="w-full max-w-[140px]">
              <Progress value={progress} className="h-1.5">
                <span className="sr-only">{progress}%</span>
              </Progress>
            </div>
          </div>
        ) : (
          <>
            <Camera className="h-5 w-5" />
            {label}
          </>
        )}
      </Button>

      {/* Hidden file input — uses capture="environment" for rear camera on mobile */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  )
}
