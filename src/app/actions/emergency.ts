'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { EmergencyInfo, EmergencyInfoInsert } from '@/types/database'

export async function getEmergencyInfo(propertyId: string): Promise<{
  data: EmergencyInfo | null;
  error: string | null;
}> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('emergency_info')
    .select('*')
    .eq('property_id', propertyId)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows found — not a real error for this case
    return { data: null, error: error.message }
  }

  return { data: data ?? null, error: null }
}

export async function upsertEmergencyInfo(
  propertyId: string,
  formData: FormData
): Promise<{ data: EmergencyInfo | null; error: string | null }> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: 'Not authenticated' }
  }

  const waterShutoffRaw = formData.get('water_shutoff') as string | null
  const electricShutoffRaw = formData.get('electric_shutoff') as string | null
  const gasShutoffRaw = formData.get('gas_shutoff') as string | null
  const fireExtinguishersRaw = formData.get('fire_extinguishers') as string | null
  const emergencyContactsRaw = formData.get('emergency_contacts') as string | null
  const emergencyProceduresRaw = formData.get('emergency_procedures') as string | null

  const record: EmergencyInfoInsert = {
    property_id: propertyId,
    water_shutoff: waterShutoffRaw ? JSON.parse(waterShutoffRaw) : null,
    electric_shutoff: electricShutoffRaw ? JSON.parse(electricShutoffRaw) : null,
    gas_shutoff: gasShutoffRaw ? JSON.parse(gasShutoffRaw) : null,
    fire_extinguishers: fireExtinguishersRaw ? JSON.parse(fireExtinguishersRaw) : null,
    emergency_contacts: emergencyContactsRaw ? JSON.parse(emergencyContactsRaw) : [],
    emergency_procedures: emergencyProceduresRaw ? JSON.parse(emergencyProceduresRaw) : [],
  }

  // Check if emergency info already exists for this property
  const { data: existing } = await supabase
    .from('emergency_info')
    .select('id')
    .eq('property_id', propertyId)
    .single()

  let data: EmergencyInfo | null = null
  let error = null

  if (existing) {
    // Update existing record
    const { id: _id, ...updateFields } = record
    const result = await supabase
      .from('emergency_info')
      .update(updateFields)
      .eq('property_id', propertyId)
      .select()
      .single()

    data = result.data
    error = result.error
  } else {
    // Insert new record
    const result = await supabase
      .from('emergency_info')
      .insert(record)
      .select()
      .single()

    data = result.data
    error = result.error
  }

  if (error) {
    return { data: null, error: error.message }
  }

  revalidatePath(`/property/${propertyId}`)

  return { data, error: null }
}
