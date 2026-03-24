'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Document, DocumentInsert, DocumentUpdate } from '@/types/database'

export async function getDocuments(
  propertyId: string,
  category?: string
): Promise<{ data: Document[] | null; error: string | null }> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: 'Not authenticated' }
  }

  let query = supabase
    .from('documents')
    .select('*')
    .eq('property_id', propertyId)

  if (category) {
    query = query.eq('category', category as Document['category'])
  }

  const { data, error } = await query.order('uploaded_at', { ascending: false })

  if (error) {
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function createDocument(
  propertyId: string,
  formData: FormData
): Promise<{ data: Document | null; error: string | null }> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: 'Not authenticated' }
  }

  const insert: DocumentInsert = {
    property_id: propertyId,
    name: formData.get('name') as string,
    category: (formData.get('category') as DocumentInsert['category']) || 'other',
    file_url: (formData.get('file_url') as string) || null,
    file_size: formData.get('file_size') ? Number(formData.get('file_size')) : null,
    notes: (formData.get('notes') as string) || null,
  }

  const { data, error } = await supabase
    .from('documents')
    .insert(insert)
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  revalidatePath(`/property/${propertyId}`)

  return { data, error: null }
}

export async function updateDocument(
  id: string,
  formData: FormData
): Promise<{ data: Document | null; error: string | null }> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: 'Not authenticated' }
  }

  const update: DocumentUpdate = {
    name: formData.get('name') as string,
    category: (formData.get('category') as DocumentUpdate['category']) || 'other',
    notes: (formData.get('notes') as string) || null,
  }

  const { data, error } = await supabase
    .from('documents')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  revalidatePath(`/property/${data.property_id}`)

  return { data, error: null }
}

export async function deleteDocument(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  // Get the document to find file_url and property_id before deleting
  const { data: doc } = await supabase
    .from('documents')
    .select('property_id, file_url')
    .eq('id', id)
    .single()

  // Delete the file from storage if it exists
  if (doc?.file_url) {
    try {
      // Extract the storage path from the public URL
      // The file_url is typically the full public URL; we need the path portion
      const url = new URL(doc.file_url)
      const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/uploads\/(.+)/)
      if (pathMatch) {
        const storagePath = decodeURIComponent(pathMatch[1])
        await supabase.storage.from('uploads').remove([storagePath])
      }
    } catch {
      // Storage cleanup failed — continue with document record deletion
    }
  }

  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  if (doc) {
    revalidatePath(`/property/${doc.property_id}`)
  }

  return { error: null }
}
