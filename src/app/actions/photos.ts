'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ── Room Photos ──────────────────────────────────────────────────────────────

export async function updateRoomPhotos(
  roomId: string,
  photoUrls: string[]
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('rooms')
    .update({ photo_urls: photoUrls })
    .eq('id', roomId)
    .select('property_id')
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/property/${data.property_id}`)
  revalidatePath(`/property/${data.property_id}/room/${roomId}`)

  return { error: null }
}

export async function addRoomPhoto(
  roomId: string,
  url: string
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  // Fetch current photo_urls
  const { data: room, error: fetchError } = await supabase
    .from('rooms')
    .select('photo_urls, property_id')
    .eq('id', roomId)
    .single()

  if (fetchError || !room) {
    return { error: fetchError?.message ?? 'Room not found' }
  }

  const current = room.photo_urls ?? []
  const updated = [...current, url]

  const { error } = await supabase
    .from('rooms')
    .update({ photo_urls: updated })
    .eq('id', roomId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/property/${room.property_id}`)
  revalidatePath(`/property/${room.property_id}/room/${roomId}`)

  return { error: null }
}

export async function removeRoomPhoto(
  roomId: string,
  url: string
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  // Fetch current photo_urls
  const { data: room, error: fetchError } = await supabase
    .from('rooms')
    .select('photo_urls, property_id')
    .eq('id', roomId)
    .single()

  if (fetchError || !room) {
    return { error: fetchError?.message ?? 'Room not found' }
  }

  const current = room.photo_urls ?? []
  const updated = current.filter((p) => p !== url)

  const { error } = await supabase
    .from('rooms')
    .update({ photo_urls: updated })
    .eq('id', roomId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/property/${room.property_id}`)
  revalidatePath(`/property/${room.property_id}/room/${roomId}`)

  return { error: null }
}

// ── Appliance Photos ─────────────────────────────────────────────────────────

export async function updateAppliancePhotos(
  applianceId: string,
  photoUrls: string[]
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('appliances')
    .update({ photo_urls: photoUrls })
    .eq('id', applianceId)
    .select('property_id')
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/property/${data.property_id}`)
  revalidatePath(`/property/${data.property_id}/appliance/${applianceId}`)

  return { error: null }
}

export async function addAppliancePhoto(
  applianceId: string,
  url: string
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  // Fetch current photo_urls
  const { data: appliance, error: fetchError } = await supabase
    .from('appliances')
    .select('photo_urls, property_id')
    .eq('id', applianceId)
    .single()

  if (fetchError || !appliance) {
    return { error: fetchError?.message ?? 'Appliance not found' }
  }

  const current = appliance.photo_urls ?? []
  const updated = [...current, url]

  const { error } = await supabase
    .from('appliances')
    .update({ photo_urls: updated })
    .eq('id', applianceId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/property/${appliance.property_id}`)
  revalidatePath(`/property/${appliance.property_id}/appliance/${applianceId}`)

  return { error: null }
}

export async function removeAppliancePhoto(
  applianceId: string,
  url: string
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  // Fetch current photo_urls
  const { data: appliance, error: fetchError } = await supabase
    .from('appliances')
    .select('photo_urls, property_id')
    .eq('id', applianceId)
    .single()

  if (fetchError || !appliance) {
    return { error: fetchError?.message ?? 'Appliance not found' }
  }

  const current = appliance.photo_urls ?? []
  const updated = current.filter((p) => p !== url)

  const { error } = await supabase
    .from('appliances')
    .update({ photo_urls: updated })
    .eq('id', applianceId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/property/${appliance.property_id}`)
  revalidatePath(`/property/${appliance.property_id}/appliance/${applianceId}`)

  return { error: null }
}
