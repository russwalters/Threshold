'use client'

import { useCallback, useRef, useState } from 'react'
import { Camera, Trash2, Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { uploadImage, deleteFile } from '@/lib/storage'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

interface ImageUploadProps {
  onUpload: (result: { url: string; path: string }) => void
  onRemove?: () => void
  currentImageUrl?: string
  variant?: 'photo' | 'avatar'
  userId: string
  propertyId: string
  className?: string
}

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export function ImageUpload({
  onUpload,
  onRemove,
  currentImageUrl,
  variant = 'photo',
  userId,
  propertyId,
  className,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [preview, setPreview] = useState<string | null>(null)
  const [isHovering, setIsHovering] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const displayUrl = preview || currentImageUrl

  const isAvatar = variant === 'avatar'

  const handleFile = useCallback(
    async (file: File) => {
      // Validate type
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast.error('Please select a valid image file (PNG, JPG, GIF, or WebP)')
        return
      }

      // Validate size
      if (file.size > MAX_SIZE) {
        toast.error('Image is too large. Maximum size is 10MB.')
        return
      }

      // Show preview immediately
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target?.result as string)
      reader.readAsDataURL(file)

      setIsUploading(true)
      setProgress(10)

      try {
        const progressInterval = setInterval(() => {
          setProgress((prev) => Math.min(prev + 15, 85))
        }, 200)

        const maxWidth = isAvatar ? 400 : 1200
        const result = await uploadImage(file, userId, propertyId, maxWidth)

        clearInterval(progressInterval)
        setProgress(100)

        toast.success('Image uploaded successfully')
        onUpload(result)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed'
        toast.error(message)
        setPreview(null)
      } finally {
        setTimeout(() => {
          setIsUploading(false)
          setProgress(0)
        }, 500)
      }
    },
    [isAvatar, userId, propertyId, onUpload]
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
      if (inputRef.current) inputRef.current.value = ''
    },
    [handleFile]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      setPreview(null)
      onRemove?.()
    },
    [onRemove]
  )

  const containerClasses = cn(
    'group relative overflow-hidden transition-all duration-200',
    isAvatar ? 'rounded-full' : 'rounded-xl',
    isAvatar ? 'h-28 w-28' : 'aspect-[4/3] w-full',
    className
  )

  // Image is present -- show it with hover overlay
  if (displayUrl) {
    return (
      <div
        className={containerClasses}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <img
          src={displayUrl}
          alt=""
          className={cn(
            'h-full w-full object-cover',
            isAvatar ? 'rounded-full' : 'rounded-xl'
          )}
        />

        {/* Hover overlay */}
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center gap-2 bg-hearth/50 transition-opacity duration-200',
            isAvatar ? 'rounded-full' : 'rounded-xl',
            isHovering && !isUploading ? 'opacity-100' : 'opacity-0'
          )}
        >
          <Button
            variant="secondary"
            size="sm"
            onClick={() => inputRef.current?.click()}
            className="bg-white/90 text-hearth shadow-sm hover:bg-white"
          >
            <Camera className="mr-1 h-3.5 w-3.5" />
            Change
          </Button>
          {onRemove && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              className="shadow-sm"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Upload progress overlay */}
        {isUploading && (
          <div
            className={cn(
              'absolute inset-0 flex flex-col items-center justify-center bg-hearth/60',
              isAvatar ? 'rounded-full' : 'rounded-xl'
            )}
          >
            <p className="mb-2 text-xs font-medium text-white">Uploading...</p>
            <div className="w-2/3">
              <Progress value={progress}>
                <span className="sr-only">{progress}%</span>
              </Progress>
            </div>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />
      </div>
    )
  }

  // No image -- show upload zone
  return (
    <div
      className={cn(
        containerClasses,
        'flex cursor-pointer flex-col items-center justify-center border-2 border-dashed border-clay/50 bg-linen/50',
        'hover:border-ember/60 hover:bg-linen-dark/40'
      )}
      onClick={() => !isUploading && inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {isUploading ? (
        <div className="flex flex-col items-center gap-2 px-4">
          <p className="text-xs font-medium text-hearth">Uploading...</p>
          <div className="w-full max-w-[120px]">
            <Progress value={progress}>
              <span className="sr-only">{progress}%</span>
            </Progress>
          </div>
        </div>
      ) : (
        <>
          <div
            className={cn(
              'flex items-center justify-center rounded-full bg-ember/10',
              isAvatar ? 'mb-1 h-8 w-8' : 'mb-2 h-10 w-10'
            )}
          >
            <Upload
              className={cn(
                'text-ember',
                isAvatar ? 'h-4 w-4' : 'h-5 w-5'
              )}
            />
          </div>
          <p
            className={cn(
              'font-medium text-hearth',
              isAvatar ? 'text-[10px]' : 'text-xs'
            )}
          >
            {isAvatar ? 'Upload' : 'Upload Image'}
          </p>
          {!isAvatar && (
            <p className="mt-0.5 text-[10px] text-stone">
              Drag &amp; drop or click
            </p>
          )}
        </>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  )
}
