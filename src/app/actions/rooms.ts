'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Room, RoomInsert, RoomUpdate, Appliance } from '@/types/database'

export async function getRooms(propertyId: string): Promise<{ data: Room[] | null; error: string | null }> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('property_id', propertyId)
    .order('sort_order', { ascending: true })

  if (error) {
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function getRoom(id: string): Promise<{
  data: (Room & { appliances: Appliance[] }) | null;
  error: string | null;
}> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data: room, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  const { data: appliances, error: appError } = await supabase
    .from('appliances')
    .select('*')
    .eq('room_id', id)

  if (appError) {
    return { data: null, error: appError.message }
  }

  return {
    data: { ...room, appliances: appliances ?? [] },
    error: null,
  }
}

export async function createRoom(propertyId: string, formData: FormData): Promise<{ data: Room | null; error: string | null }> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: 'Not authenticated' }
  }

  // Get the next sort_order
  const { data: existing } = await supabase
    .from('rooms')
    .select('sort_order')
    .eq('property_id', propertyId)
    .order('sort_order', { ascending: false })
    .limit(1)

  const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0

  const paintColorsRaw = formData.get('paint_colors') as string | null
  const fixturesRaw = formData.get('fixtures') as string | null
  const lightBulbsRaw = formData.get('light_bulbs') as string | null
  const featuresRaw = formData.get('features') as string | null

  const insert: RoomInsert = {
    property_id: propertyId,
    name: formData.get('name') as string,
    type: (formData.get('type') as string) || null,
    photo_url: (formData.get('photo_url') as string) || null,
    paint_colors: paintColorsRaw ? JSON.parse(paintColorsRaw) : [],
    fixtures: fixturesRaw ? JSON.parse(fixturesRaw) : [],
    light_bulbs: lightBulbsRaw ? JSON.parse(lightBulbsRaw) : [],
    features: featuresRaw ? JSON.parse(featuresRaw) : [],
    notes: (formData.get('notes') as string) || null,
    sort_order: nextOrder,
  }

  const { data, error } = await supabase
    .from('rooms')
    .insert(insert)
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  // Log activity
  await supabase.from('activity_log').insert({
    user_id: user.id,
    property_id: propertyId,
    type: 'room_added',
    title: 'Room added',
    description: `Added room "${data.name}"`,
  })

  revalidatePath(`/property/${propertyId}`)

  return { data, error: null }
}

export async function updateRoom(id: string, formData: FormData): Promise<{ data: Room | null; error: string | null }> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: 'Not authenticated' }
  }

  const paintColorsRaw = formData.get('paint_colors') as string | null
  const fixturesRaw = formData.get('fixtures') as string | null
  const lightBulbsRaw = formData.get('light_bulbs') as string | null
  const featuresRaw = formData.get('features') as string | null

  const update: RoomUpdate = {
    name: formData.get('name') as string,
    type: (formData.get('type') as string) || null,
    photo_url: (formData.get('photo_url') as string) || null,
    notes: (formData.get('notes') as string) || null,
  }

  if (paintColorsRaw) {
    update.paint_colors = JSON.parse(paintColorsRaw)
  }
  if (fixturesRaw) {
    update.fixtures = JSON.parse(fixturesRaw)
  }
  if (lightBulbsRaw) {
    update.light_bulbs = JSON.parse(lightBulbsRaw)
  }
  if (featuresRaw) {
    update.features = JSON.parse(featuresRaw)
  }

  const { data, error } = await supabase
    .from('rooms')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  revalidatePath(`/property/${data.property_id}`)
  revalidatePath(`/property/${data.property_id}/room/${id}`)

  return { data, error: null }
}

export async function deleteRoom(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  // Get property_id before deleting for revalidation
  const { data: room } = await supabase
    .from('rooms')
    .select('property_id')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('rooms')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  if (room) {
    revalidatePath(`/property/${room.property_id}`)
  }

  return { error: null }
}

export async function reorderRooms(propertyId: string, roomIds: string[]): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  // Update sort_order for each room
  const updates = roomIds.map((roomId, index) =>
    supabase
      .from('rooms')
      .update({ sort_order: index })
      .eq('id', roomId)
      .eq('property_id', propertyId)
  )

  const results = await Promise.all(updates)
  const failed = results.find((r) => r.error)

  if (failed?.error) {
    return { error: failed.error.message }
  }

  revalidatePath(`/property/${propertyId}`)

  return { error: null }
}
