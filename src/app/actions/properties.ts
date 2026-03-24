'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Property, PropertyInsert, PropertyUpdate } from '@/types/database'

export async function getProperties(): Promise<{ data: Property[] | null; error: string | null }> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function getProperty(id: string): Promise<{
  data: (Property & { rooms_count: number; appliances_count: number; completion_percent: number }) | null;
  error: string | null;
}> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data: property, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  // Fetch counts for rooms and appliances
  const [roomsResult, appliancesResult] = await Promise.all([
    supabase.from('rooms').select('id', { count: 'exact', head: true }).eq('property_id', id),
    supabase.from('appliances').select('id', { count: 'exact', head: true }).eq('property_id', id),
  ])

  const roomsCount = roomsResult.count ?? 0
  const appliancesCount = appliancesResult.count ?? 0

  // Calculate completion percentage based on filled optional fields
  const fields = [
    property.address_line1,
    property.city,
    property.state,
    property.zip,
    property.property_type,
    property.occupancy_status,
    property.beds,
    property.baths,
    property.sqft,
    property.year_built,
    property.photo_url,
  ]
  const filledCount = fields.filter((f) => f !== null && f !== undefined && f !== '').length
  const completionPercent = Math.round((filledCount / fields.length) * 100)

  return {
    data: {
      ...property,
      rooms_count: roomsCount,
      appliances_count: appliancesCount,
      completion_percent: completionPercent,
    },
    error: null,
  }
}

export async function createProperty(formData: FormData): Promise<{ data: Property | null; error: string | null }> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: 'Not authenticated' }
  }

  const insert: PropertyInsert = {
    user_id: user.id,
    name: formData.get('name') as string,
    address_line1: formData.get('address_line1') as string,
    address_line2: (formData.get('address_line2') as string) || null,
    city: formData.get('city') as string,
    state: formData.get('state') as string,
    zip: formData.get('zip') as string,
    property_type: formData.get('property_type') as PropertyInsert['property_type'],
    occupancy_status: formData.get('occupancy_status') as PropertyInsert['occupancy_status'],
    beds: formData.get('beds') ? Number(formData.get('beds')) : null,
    baths: formData.get('baths') ? Number(formData.get('baths')) : null,
    sqft: formData.get('sqft') ? Number(formData.get('sqft')) : null,
    year_built: formData.get('year_built') ? Number(formData.get('year_built')) : null,
    photo_url: (formData.get('photo_url') as string) || null,
    rent_amount: formData.get('rent_amount') ? Number(formData.get('rent_amount')) : null,
  }

  const { data, error } = await supabase
    .from('properties')
    .insert(insert)
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  // Log activity
  await supabase.from('activity_log').insert({
    user_id: user.id,
    property_id: data.id,
    type: 'property_created',
    title: 'Property added',
    description: `Added "${data.name}"`,
  })

  revalidatePath('/dashboard')
  revalidatePath(`/property/${data.id}`)

  return { data, error: null }
}

export async function updateProperty(id: string, formData: FormData): Promise<{ data: Property | null; error: string | null }> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: 'Not authenticated' }
  }

  const update: PropertyUpdate = {
    name: formData.get('name') as string,
    address_line1: formData.get('address_line1') as string,
    address_line2: (formData.get('address_line2') as string) || null,
    city: formData.get('city') as string,
    state: formData.get('state') as string,
    zip: formData.get('zip') as string,
    property_type: formData.get('property_type') as PropertyUpdate['property_type'],
    occupancy_status: formData.get('occupancy_status') as PropertyUpdate['occupancy_status'],
    beds: formData.get('beds') ? Number(formData.get('beds')) : null,
    baths: formData.get('baths') ? Number(formData.get('baths')) : null,
    sqft: formData.get('sqft') ? Number(formData.get('sqft')) : null,
    year_built: formData.get('year_built') ? Number(formData.get('year_built')) : null,
    photo_url: (formData.get('photo_url') as string) || null,
    rent_amount: formData.get('rent_amount') ? Number(formData.get('rent_amount')) : null,
  }

  const { data, error } = await supabase
    .from('properties')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath(`/property/${id}`)

  return { data, error: null }
}

export async function deleteProperty(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')

  return { error: null }
}

export async function getPropertyStats(userId: string): Promise<{
  data: {
    total_properties: number;
    total_appliances: number;
    total_rooms: number;
    upcoming_maintenance: number;
  } | null;
  error: string | null;
}> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: 'Not authenticated' }
  }

  // Fetch all property IDs for the user
  const { data: properties, error: propError } = await supabase
    .from('properties')
    .select('id')
    .eq('user_id', userId)

  if (propError) {
    return { data: null, error: propError.message }
  }

  const propertyIds = properties.map((p) => p.id)

  if (propertyIds.length === 0) {
    return {
      data: {
        total_properties: 0,
        total_appliances: 0,
        total_rooms: 0,
        upcoming_maintenance: 0,
      },
      error: null,
    }
  }

  const [roomsResult, appliancesResult, maintenanceResult] = await Promise.all([
    supabase
      .from('rooms')
      .select('id', { count: 'exact', head: true })
      .in('property_id', propertyIds),
    supabase
      .from('appliances')
      .select('id', { count: 'exact', head: true })
      .in('property_id', propertyIds),
    supabase
      .from('maintenance_events')
      .select('id', { count: 'exact', head: true })
      .in('property_id', propertyIds)
      .eq('type', 'upcoming'),
  ])

  return {
    data: {
      total_properties: propertyIds.length,
      total_rooms: roomsResult.count ?? 0,
      total_appliances: appliancesResult.count ?? 0,
      upcoming_maintenance: maintenanceResult.count ?? 0,
    },
    error: null,
  }
}

export async function getRecentActivity(userId?: string, limit: number = 10): Promise<{
  data: import('@/types/database').ActivityLog[] | null;
  error: string | null;
}> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: 'Not authenticated' }
  }

  const targetUserId = userId ?? user.id

  const { data, error } = await supabase
    .from('activity_log')
    .select('*')
    .eq('user_id', targetUserId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    return { data: null, error: error.message }
  }

  return { data, error: null }
}
