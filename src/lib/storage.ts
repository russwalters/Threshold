import { createClient } from '@/lib/supabase/client'

const BUCKET = 'uploads'

/**
 * Build the storage path for a file.
 */
function buildPath(
  userId: string,
  propertyId: string,
  category: 'photos' | 'documents',
  filename: string
): string {
  // Add a timestamp prefix to avoid name collisions
  const timestamp = Date.now()
  const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
  return `${userId}/${propertyId}/${category}/${timestamp}-${sanitized}`
}

/**
 * Upload a file to Supabase Storage.
 *
 * Bucket: 'uploads'
 * Path structure: {userId}/{propertyId}/{category}/{timestamp}-{filename}
 */
export async function uploadFile(
  file: File,
  userId: string,
  propertyId: string,
  category: 'photos' | 'documents'
): Promise<{ url: string; path: string }> {
  const supabase = createClient()
  const path = buildPath(userId, propertyId, category, file.name)

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    throw new Error(`Upload failed: ${error.message}`)
  }

  const url = getPublicUrl(path)
  return { url, path }
}

/**
 * Delete a file from Supabase Storage.
 */
export async function deleteFile(path: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([path])

  if (error) {
    throw new Error(`Delete failed: ${error.message}`)
  }
}

/**
 * Get the public URL for a file in Supabase Storage.
 */
export function getPublicUrl(path: string): string {
  const supabase = createClient()

  const { data } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(path)

  return data.publicUrl
}

/**
 * Resize an image on the client side using an offscreen canvas.
 * Returns a Blob in webp format (or jpeg as fallback).
 */
async function resizeImage(
  file: File,
  maxWidth: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      let { width, height } = img

      // Only resize if the image is wider than maxWidth
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width)
        width = maxWidth
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }

      ctx.drawImage(img, 0, 0, width, height)

      // Try webp first, fall back to jpeg
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            // Fallback to jpeg
            canvas.toBlob(
              (jpegBlob) => {
                if (jpegBlob) {
                  resolve(jpegBlob)
                } else {
                  reject(new Error('Failed to convert image'))
                }
              },
              'image/jpeg',
              0.8
            )
          }
        },
        'image/webp',
        0.8
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image for resizing'))
    }

    img.src = url
  })
}

/**
 * Upload an image with client-side optimization.
 * Resizes large images and converts to webp/jpeg before uploading.
 */
export async function uploadImage(
  file: File,
  userId: string,
  propertyId: string,
  maxWidth: number = 1200
): Promise<{ url: string; path: string }> {
  const blob = await resizeImage(file, maxWidth)

  // Determine the output extension based on the blob type
  const ext = blob.type === 'image/webp' ? '.webp' : '.jpg'
  const baseName = file.name.replace(/\.[^.]+$/, '')
  const optimizedFile = new File([blob], `${baseName}${ext}`, {
    type: blob.type,
  })

  return uploadFile(optimizedFile, userId, propertyId, 'photos')
}
