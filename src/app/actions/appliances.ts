'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type {
  Appliance,
  ApplianceInsert,
  ApplianceUpdate,
  ServiceHistory,
  ServiceHistoryInsert,
} from '@/types/database'

export async function getAppliances(
  propertyId: string,
  filters?: { search?: string; status?: string; roomId?: string }
): Promise<{ data: Appliance[] | null; error: string | null }> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: 'Not authenticated' }
  }

  let query = supabase
    .from('appliances')
    .select('*')
    .eq('property_id', propertyId)

  if (filters?.status) {
    query = query.eq('status', filters.status as Appliance['status'])
  }

  if (filters?.roomId) {
    query = query.eq('room_id', filters.roomId)
  }

  if (filters?.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,brand.ilike.%${filters.search}%,model.ilike.%${filters.search}%`
    )
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function getAppliance(id: string): Promise<{
  data: (Appliance & { service_history: ServiceHistory[] }) | null;
  error: string | null;
}> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data: appliance, error } = await supabase
    .from('appliances')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  const { data: serviceHistory, error: shError } = await supabase
    .from('service_history')
    .select('*')
    .eq('appliance_id', id)
    .order('date', { ascending: false })

  if (shError) {
    return { data: null, error: shError.message }
  }

  return {
    data: { ...(appliance as Appliance), service_history: serviceHistory ?? [] },
    error: null,
  }
}

export async function createAppliance(
  propertyId: string,
  formData: FormData
): Promise<{ data: Appliance | null; error: string | null }> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: 'Not authenticated' }
  }

  const operatingTipsRaw = formData.get('operating_tips') as string | null

  const insert: ApplianceInsert = {
    property_id: propertyId,
    room_id: (formData.get('room_id') as string) || null,
    name: formData.get('name') as string,
    brand: (formData.get('brand') as string) || null,
    model: (formData.get('model') as string) || null,
    serial_number: (formData.get('serial_number') as string) || null,
    photo_url: (formData.get('photo_url') as string) || null,
    purchase_date: (formData.get('purchase_date') as string) || null,
    warranty_expiration: (formData.get('warranty_expiration') as string) || null,
    manual_url: (formData.get('manual_url') as string) || null,
    status: (formData.get('status') as ApplianceInsert['status']) || 'good',
    location: (formData.get('location') as string) || null,
    operating_tips: operatingTipsRaw ? JSON.parse(operatingTipsRaw) : [],
  }

  const { data, error } = await supabase
    .from('appliances')
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
    type: 'appliance_added',
    title: 'Appliance added',
    description: `Added "${data.name}"`,
  })

  revalidatePath(`/property/${propertyId}`)

  return { data, error: null }
}

export async function updateAppliance(
  id: string,
  formData: FormData
): Promise<{ data: Appliance | null; error: string | null }> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: 'Not authenticated' }
  }

  const operatingTipsRaw = formData.get('operating_tips') as string | null

  const update: ApplianceUpdate = {
    room_id: (formData.get('room_id') as string) || null,
    name: formData.get('name') as string,
    brand: (formData.get('brand') as string) || null,
    model: (formData.get('model') as string) || null,
    serial_number: (formData.get('serial_number') as string) || null,
    photo_url: (formData.get('photo_url') as string) || null,
    purchase_date: (formData.get('purchase_date') as string) || null,
    warranty_expiration: (formData.get('warranty_expiration') as string) || null,
    manual_url: (formData.get('manual_url') as string) || null,
    status: (formData.get('status') as ApplianceUpdate['status']) || 'good',
    location: (formData.get('location') as string) || null,
  }

  if (operatingTipsRaw) {
    update.operating_tips = JSON.parse(operatingTipsRaw)
  }

  const { data, error } = await supabase
    .from('appliances')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  revalidatePath(`/property/${data.property_id}`)
  revalidatePath(`/property/${data.property_id}/appliance/${id}`)

  return { data, error: null }
}

export async function deleteAppliance(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  // Get property_id before deleting for revalidation
  const { data: appliance } = await supabase
    .from('appliances')
    .select('property_id')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('appliances')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  if (appliance) {
    revalidatePath(`/property/${appliance.property_id}`)
  }

  return { error: null }
}

export async function getServiceHistory(applianceId: string): Promise<{
  data: ServiceHistory[] | null;
  error: string | null;
}> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('service_history')
    .select('*')
    .eq('appliance_id', applianceId)
    .order('date', { ascending: false })

  if (error) {
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function addServiceEntry(
  applianceId: string,
  formData: FormData
): Promise<{ data: ServiceHistory | null; error: string | null }> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: 'Not authenticated' }
  }

  const insert: ServiceHistoryInsert = {
    appliance_id: applianceId,
    type: formData.get('type') as ServiceHistoryInsert['type'],
    date: formData.get('date') as string,
    provider: (formData.get('provider') as string) || null,
    description: (formData.get('description') as string) || null,
    cost: formData.get('cost') ? Number(formData.get('cost')) : null,
    notes: (formData.get('notes') as string) || null,
  }

  const { data, error } = await supabase
    .from('service_history')
    .insert(insert)
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  // Get the appliance to find the property_id for revalidation
  const { data: appliance } = await supabase
    .from('appliances')
    .select('property_id')
    .eq('id', applianceId)
    .single()

  if (appliance) {
    revalidatePath(`/property/${appliance.property_id}/appliance/${applianceId}`)
  }

  return { data, error: null }
}
