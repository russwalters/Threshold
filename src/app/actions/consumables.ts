'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type {
  Consumable,
  ConsumableInsert,
  ConsumableUpdate,
} from '@/types/database'

export async function getConsumables(
  propertyId: string,
  filters?: { category?: string; applianceId?: string }
): Promise<{ data: Consumable[] | null; error: string | null }> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: 'Not authenticated' }
  }

  let query = supabase
    .from('consumables')
    .select('*')
    .eq('property_id', propertyId)

  if (filters?.category) {
    query = query.eq('category', filters.category)
  }

  if (filters?.applianceId) {
    query = query.eq('appliance_id', filters.applianceId)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function getConsumable(id: string): Promise<{
  data: Consumable | null;
  error: string | null;
}> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('consumables')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function createConsumable(
  propertyId: string,
  formData: FormData
): Promise<{ data: Consumable | null; error: string | null }> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: 'Not authenticated' }
  }

  const lastReplaced = (formData.get('last_replaced') as string) || null
  const intervalDays = formData.get('replacement_interval_days')
    ? Number(formData.get('replacement_interval_days'))
    : null

  let nextReplacement: string | null = null
  if (lastReplaced && intervalDays) {
    const next = new Date(lastReplaced)
    next.setDate(next.getDate() + intervalDays)
    nextReplacement = next.toISOString().split('T')[0]
  }

  const insert: ConsumableInsert = {
    property_id: propertyId,
    appliance_id: (formData.get('appliance_id') as string) || null,
    name: formData.get('name') as string,
    category: (formData.get('category') as string) || 'other',
    brand: (formData.get('brand') as string) || null,
    model: (formData.get('model') as string) || null,
    size: (formData.get('size') as string) || null,
    photo_url: (formData.get('photo_url') as string) || null,
    purchase_url: (formData.get('purchase_url') as string) || null,
    last_replaced: lastReplaced,
    replacement_interval_days: intervalDays,
    next_replacement: nextReplacement,
    notes: (formData.get('notes') as string) || null,
    quantity_on_hand: formData.get('quantity_on_hand')
      ? Number(formData.get('quantity_on_hand'))
      : 0,
  }

  const { data, error } = await supabase
    .from('consumables')
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
    type: 'consumable_added',
    title: 'Consumable added',
    description: `Added "${data.name}"`,
  })

  revalidatePath(`/property/${propertyId}`)

  return { data, error: null }
}

export async function updateConsumable(
  id: string,
  formData: FormData
): Promise<{ data: Consumable | null; error: string | null }> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: 'Not authenticated' }
  }

  const lastReplaced = (formData.get('last_replaced') as string) || null
  const intervalDays = formData.get('replacement_interval_days')
    ? Number(formData.get('replacement_interval_days'))
    : null

  let nextReplacement: string | null = null
  if (lastReplaced && intervalDays) {
    const next = new Date(lastReplaced)
    next.setDate(next.getDate() + intervalDays)
    nextReplacement = next.toISOString().split('T')[0]
  }

  const update: ConsumableUpdate = {
    appliance_id: (formData.get('appliance_id') as string) || null,
    name: formData.get('name') as string,
    category: (formData.get('category') as string) || 'other',
    brand: (formData.get('brand') as string) || null,
    model: (formData.get('model') as string) || null,
    size: (formData.get('size') as string) || null,
    photo_url: (formData.get('photo_url') as string) || null,
    purchase_url: (formData.get('purchase_url') as string) || null,
    last_replaced: lastReplaced,
    replacement_interval_days: intervalDays,
    next_replacement: nextReplacement,
    notes: (formData.get('notes') as string) || null,
    quantity_on_hand: formData.get('quantity_on_hand')
      ? Number(formData.get('quantity_on_hand'))
      : 0,
  }

  const { data, error } = await supabase
    .from('consumables')
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

export async function deleteConsumable(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  // Get property_id before deleting for revalidation
  const { data: consumable } = await supabase
    .from('consumables')
    .select('property_id')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('consumables')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  if (consumable) {
    revalidatePath(`/property/${consumable.property_id}`)
  }

  return { error: null }
}

export async function markReplaced(id: string): Promise<{
  data: Consumable | null;
  error: string | null;
}> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: 'Not authenticated' }
  }

  // Fetch current consumable to get interval
  const { data: current, error: fetchError } = await supabase
    .from('consumables')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !current) {
    return { data: null, error: fetchError?.message ?? 'Consumable not found' }
  }

  const today = new Date().toISOString().split('T')[0]
  let nextReplacement: string | null = null

  if (current.replacement_interval_days) {
    const next = new Date()
    next.setDate(next.getDate() + current.replacement_interval_days)
    nextReplacement = next.toISOString().split('T')[0]
  }

  const { data, error } = await supabase
    .from('consumables')
    .update({
      last_replaced: today,
      next_replacement: nextReplacement,
    })
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
    type: 'consumable_replaced',
    title: 'Consumable replaced',
    description: `Marked "${data.name}" as replaced`,
  })

  revalidatePath(`/property/${data.property_id}`)

  return { data, error: null }
}

export async function getUpcomingReplacements(userId: string): Promise<{
  data: Array<{
    id: string
    name: string
    property_name: string
    next_replacement: string
    purchase_url: string | null
  }> | null;
  error: string | null;
}> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: 'Not authenticated' }
  }

  // Get all properties for this user
  const { data: properties, error: propError } = await supabase
    .from('properties')
    .select('id, name')
    .eq('user_id', userId)

  if (propError || !properties) {
    return { data: null, error: propError?.message ?? 'Could not fetch properties' }
  }

  if (properties.length === 0) {
    return { data: [], error: null }
  }

  const propertyIds = properties.map((p) => p.id)
  const propertyMap = Object.fromEntries(properties.map((p) => [p.id, p.name]))

  const { data: consumables, error } = await supabase
    .from('consumables')
    .select('id, name, property_id, next_replacement, purchase_url')
    .in('property_id', propertyIds)
    .not('next_replacement', 'is', null)
    .order('next_replacement', { ascending: true })
    .limit(20)

  if (error) {
    return { data: null, error: error.message }
  }

  const result = (consumables ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    property_name: propertyMap[c.property_id] ?? 'Unknown',
    next_replacement: c.next_replacement!,
    purchase_url: c.purchase_url,
  }))

  return { data: result, error: null }
}

export async function getDueConsumablesCount(propertyId: string): Promise<{
  data: number | null;
  error: string | null;
}> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: 'Not authenticated' }
  }

  const today = new Date().toISOString().split('T')[0]

  const { count, error } = await supabase
    .from('consumables')
    .select('*', { count: 'exact', head: true })
    .eq('property_id', propertyId)
    .lte('next_replacement', today)

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: count ?? 0, error: null }
}
