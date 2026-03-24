import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const BUCKET = 'uploads'
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/avif',
]

const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/csv',
]

const ALLOWED_TYPES_BY_CATEGORY: Record<string, string[]> = {
  photos: ALLOWED_IMAGE_TYPES,
  documents: [...ALLOWED_DOCUMENT_TYPES, ...ALLOWED_IMAGE_TYPES],
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const propertyId = formData.get('propertyId') as string | null
    const category = formData.get('category') as string | null

    if (!file || !propertyId || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: file, propertyId, category' },
        { status: 400 }
      )
    }

    // Validate category
    if (category !== 'photos' && category !== 'documents') {
      return NextResponse.json(
        { error: 'Category must be "photos" or "documents"' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File exceeds maximum size of ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ALLOWED_TYPES_BY_CATEGORY[category]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `File type "${file.type}" is not allowed for category "${category}"` },
        { status: 400 }
      )
    }

    // Build storage path
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `${user.id}/${propertyId}/${category}/${timestamp}-${sanitizedName}`

    // Convert File to ArrayBuffer for upload
    const buffer = await file.arrayBuffer()

    // Upload using the server client (respects RLS)
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(path)

    return NextResponse.json({
      url: urlData.publicUrl,
      path,
    })
  } catch (err) {
    console.error('Upload route error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
