'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type {
  MaintenanceEvent,
  MaintenanceEventInsert,
  MaintenanceEventUpdate,
} from '@/types/database'

export async function getMaintenanceEvents(
  propertyId: string,
  type?: string
): Promise<{ data: MaintenanceEvent[] | null; error: string | null }> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: 'Not authenticated' }
  }

  let query = supabase
    .from('maintenance_events')
    .select('*')
    .eq('property_id', propertyId)

  if (type) {
    query = query.eq('type', type as MaintenanceEvent['type'])
  }

  const { data, error } = await query.order('date', { ascending: false })

  if (error) {
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function getUpcomingMaintenance(userId: string): Promise<{
  data: MaintenanceEvent[] | null;
  error: string | null;
}> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: 'Not authenticated' }
  }

  // Get all property IDs for the user
  const { data: properties, error: propError } = await supabase
    .from('properties')
    .select('id')
    .eq('user_id', userId)

  if (propError) {
    return { data: null, error: propError.message }
  }

  const propertyIds = properties.map((p) => p.id)

  if (propertyIds.length === 0) {
    return { data: [], error: null }
  }

  const { data, error } = await supabase
    .from('maintenance_events')
    .select('*')
    .in('property_id', propertyIds)
    .eq('type', 'upcoming')
    .order('date', { ascending: true })

  if (error) {
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function createMaintenanceEvent(
  propertyId: string,
  formData: FormData
): Promise<{ data: MaintenanceEvent | null; error: string | null }> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: 'Not authenticated' }
  }

  const insert: MaintenanceEventInsert = {
    property_id: propertyId,
    type: formData.get('type') as MaintenanceEventInsert['type'],
    category: (formData.get('category') as string) || null,
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || null,
    date: (formData.get('date') as string) || null,
    cost: formData.get('cost') ? Number(formData.get('cost')) : null,
    provider: (formData.get('provider') as string) || null,
    notes: (formData.get('notes') as string) || null,
  }

  const { data, error } = await supabase
    .from('maintenance_events')
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
    type: 'maintenance_created',
    title: 'Maintenance event created',
    description: `Created "${data.title}"`,
  })

  revalidatePath(`/property/${propertyId}`)
  revalidatePath('/dashboard')

  return { data, error: null }
}

export async function updateMaintenanceEvent(
  id: string,
  formData: FormData
): Promise<{ data: MaintenanceEvent | null; error: string | null }> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: 'Not authenticated' }
  }

  const update: MaintenanceEventUpdate = {
    type: formData.get('type') as MaintenanceEventUpdate['type'],
    category: (formData.get('category') as string) || null,
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || null,
    date: (formData.get('date') as string) || null,
    cost: formData.get('cost') ? Number(formData.get('cost')) : null,
    provider: (formData.get('provider') as string) || null,
    notes: (formData.get('notes') as string) || null,
  }

  const { data, error } = await supabase
    .from('maintenance_events')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  revalidatePath(`/property/${data.property_id}`)
  revalidatePath('/dashboard')

  return { data, error: null }
}

export async function deleteMaintenanceEvent(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  // Get property_id before deleting for revalidation
  const { data: event } = await supabase
    .from('maintenance_events')
    .select('property_id')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('maintenance_events')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  if (event) {
    revalidatePath(`/property/${event.property_id}`)
  }
  revalidatePath('/dashboard')

  return { error: null }
}

export async function completeMaintenanceEvent(
  id: string,
  cost?: number,
  notes?: string
): Promise<{ data: MaintenanceEvent | null; error: string | null }> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: 'Not authenticated' }
  }

  const update: MaintenanceEventUpdate = {
    type: 'completed',
  }

  if (cost !== undefined) {
    update.cost = cost
  }

  if (notes !== undefined) {
    update.notes = notes
  }

  const { data, error } = await supabase
    .from('maintenance_events')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  // Log activity
  await supabase.from('activity_log').insert({
    user_id: user.id,
    property_id: data.property_id,
    type: 'maintenance_completed',
    title: 'Maintenance completed',
    description: `Completed "${data.title}"`,
  })

  revalidatePath(`/property/${data.property_id}`)
  revalidatePath('/dashboard')

  return { data, error: null }
}
