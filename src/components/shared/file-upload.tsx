'use client'

import { useCallback, useRef, useState } from 'react'
import { Upload, X, File as FileIcon, ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { uploadFile, uploadImage } from '@/lib/storage'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

interface FileUploadProps {
  onUpload: (result: { url: string; path: string }) => void
  userId: string
  propertyId: string
  category: 'photos' | 'documents'
  accept?: string
  maxSize?: number
  className?: string
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024 // 10MB

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif']

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function FileUpload({
  onUpload,
  userId,
  propertyId,
  category,
  accept,
  maxSize = DEFAULT_MAX_SIZE,
  className,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const validateFile = useCallback(
    (file: File): string | null => {
      if (file.size > maxSize) {
        return `File is too large. Maximum size is ${formatBytes(maxSize)}.`
      }

      if (accept) {
        const acceptedTypes = accept.split(',').map((t) => t.trim())
        const fileExt = `.${file.name.split('.').pop()?.toLowerCase()}`
        const matches = acceptedTypes.some((type) => {
          if (type.startsWith('.')) return fileExt === type.toLowerCase()
          if (type.endsWith('/*')) return file.type.startsWith(type.replace('/*', '/'))
          return file.type === type
        })
        if (!matches) {
          return `File type not accepted. Accepted types: ${accept}`
        }
      }

      return null
    },
    [accept, maxSize]
  )

  const handleFile = useCallback(
    async (file: File) => {
      const error = validateFile(file)
      if (error) {
        toast.error(error)
        return
      }

      setSelectedFile(file)

      // Show image preview
      if (IMAGE_TYPES.includes(file.type)) {
        const reader = new FileReader()
        reader.onload = (e) => setPreview(e.target?.result as string)
        reader.readAsDataURL(file)
      }

      setIsUploading(true)
      setProgress(10)

      try {
        // Simulate progress updates while uploading
        const progressInterval = setInterval(() => {
          setProgress((prev) => Math.min(prev + 15, 85))
        }, 200)

        let result: { url: string; path: string }

        if (category === 'photos' && IMAGE_TYPES.includes(file.type)) {
          result = await uploadImage(file, userId, propertyId)
        } else {
          result = await uploadFile(file, userId, propertyId, category)
        }

        clearInterval(progressInterval)
        setProgress(100)

        toast.success('File uploaded successfully')
        onUpload(result)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed'
        toast.error(message)
      } finally {
        // Reset after a brief delay so the user sees 100%
        setTimeout(() => {
          setIsUploading(false)
          setProgress(0)
          setPreview(null)
          setSelectedFile(null)
        }, 500)
      }
    },
    [validateFile, category, userId, propertyId, onUpload]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)

      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
      // Reset input so same file can be selected again
      if (inputRef.current) inputRef.current.value = ''
    },
    [handleFile]
  )

  const clearSelection = useCallback(() => {
    setPreview(null)
    setSelectedFile(null)
    if (inputRef.current) inputRef.current.value = ''
  }, [])

  return (
    <div className={cn('w-full', className)}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && inputRef.current?.click()}
        className={cn(
          'relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-all duration-200',
          'cursor-pointer hover:border-ember/60 hover:bg-linen-dark/40',
          isDragOver
            ? 'border-ember bg-ember/5 shadow-sm'
            : 'border-clay/50 bg-linen/50',
          isUploading && 'pointer-events-none opacity-60'
        )}
      >
        {/* Preview */}
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="h-24 w-24 rounded-lg object-cover shadow-sm"
            />
            {!isUploading && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  clearSelection()
                }}
                className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-hearth text-white shadow-sm transition-colors hover:bg-alert"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ember/10">
            <Upload className="h-6 w-6 text-ember" />
          </div>
        )}

        {/* Text */}
        {!isUploading && !selectedFile && (
          <div className="text-center">
            <p className="text-sm font-medium text-hearth">
              Drag &amp; drop or click to browse
            </p>
            <p className="mt-1 text-xs text-stone">
              {accept
                ? `Accepted: ${accept}`
                : category === 'photos'
                ? 'PNG, JPG, GIF, WebP'
                : 'PDF, DOC, TXT, and more'}
              {' \u00B7 '}Max {formatBytes(maxSize)}
            </p>
          </div>
        )}

        {/* Selected file info */}
        {selectedFile && !isUploading && (
          <div className="flex items-center gap-2 text-sm text-hearth">
            {IMAGE_TYPES.includes(selectedFile.type) ? (
              <ImageIcon className="h-4 w-4 text-stone" />
            ) : (
              <FileIcon className="h-4 w-4 text-stone" />
            )}
            <span className="max-w-[200px] truncate">{selectedFile.name}</span>
            <span className="text-xs text-stone">
              ({formatBytes(selectedFile.size)})
            </span>
          </div>
        )}

        {/* Progress */}
        {isUploading && (
          <div className="w-full max-w-xs space-y-2">
            <p className="text-center text-sm font-medium text-hearth">
              Uploading...
            </p>
            <Progress value={progress}>
              <span className="sr-only">{progress}%</span>
            </Progress>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
        />
      </div>
    </div>
  )
}
