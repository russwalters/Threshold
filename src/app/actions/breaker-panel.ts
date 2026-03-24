'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Json } from '@/types/database'

export type Breaker = {
  position: number
  label: string
  amperage: number
  type: 'single' | 'double'
  rooms: string[]
  isMain: boolean
  notes?: string
}

export async function getBreakerPanel(propertyId: string): Promise<{
  data: Breaker[] | null
  error: string | null
}> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('emergency_info')
    .select('breaker_panel')
    .eq('property_id', propertyId)
    .single()

  if (error && error.code !== 'PGRST116') {
    return { data: null, error: error.message }
  }

  const breakers = data?.breaker_panel
  if (Array.isArray(breakers)) {
    return { data: breakers as Breaker[], error: null }
  }

  return { data: [], error: null }
}

export async function updateBreakerPanel(
  propertyId: string,
  breakers: Breaker[]
): Promise<{ data: Breaker[] | null; error: string | null }> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: 'Not authenticated' }
  }

  // Check if emergency_info row exists for this property
  const { data: existing } = await supabase
    .from('emergency_info')
    .select('id')
    .eq('property_id', propertyId)
    .single()

  let error = null

  if (existing) {
    // Update existing row
    const result = await supabase
      .from('emergency_info')
      .update({ breaker_panel: breakers as unknown as Json })
      .eq('property_id', propertyId)

    error = result.error
  } else {
    // Insert new emergency_info row with just breaker_panel
    const result = await supabase
      .from('emergency_info')
      .insert({
        property_id: propertyId,
        breaker_panel: breakers as unknown as Json,
        emergency_contacts: [],
        emergency_procedures: [],
      })

    error = result.error
  }

  if (error) {
    return { data: null, error: error.message }
  }

  revalidatePath(`/property/${propertyId}`)

  return { data: breakers, error: null }
}
