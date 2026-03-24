'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import type {
  HandbookConfig,
  HandbookConfigInsert,
  HandbookConfigUpdate,
  Property,
  Room,
  Appliance,
  EmergencyInfo,
} from '@/types/database'

export async function getHandbookConfig(propertyId: string): Promise<{
  data: HandbookConfig | null;
  error: string | null;
}> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('handbook_configs')
    .select('*')
    .eq('property_id', propertyId)
    .single()

  if (error && error.code !== 'PGRST116') {
    return { data: null, error: error.message }
  }

  return { data: data ?? null, error: null }
}

export async function getPublicHandbook(shareId: string): Promise<{
  data: {
    handbook: HandbookConfig;
    property: Property;
    rooms: Room[];
    appliances: Appliance[];
    emergency_info: EmergencyInfo | null;
  } | null;
  error: string | null;
}> {
  // Public endpoint — no auth required
  const supabase = await createClient()

  const { data: handbook, error } = await supabase
    .from('handbook_configs')
    .select('*')
    .eq('share_id', shareId)
    .eq('published', true)
    .single()

  if (error) {
    return { data: null, error: 'Handbook not found or not published' }
  }

  // Fetch related property data
  const { data: property, error: propError } = await supabase
    .from('properties')
    .select('*')
    .eq('id', handbook.property_id)
    .single()

  if (propError || !property) {
    return { data: null, error: 'Property not found' }
  }

  const [roomsResult, appliancesResult, emergencyResult] = await Promise.all([
    supabase
      .from('rooms')
      .select('*')
      .eq('property_id', handbook.property_id)
      .order('sort_order', { ascending: true }),
    supabase
      .from('appliances')
      .select('*')
      .eq('property_id', handbook.property_id)
      .order('name', { ascending: true }),
    supabase
      .from('emergency_info')
      .select('*')
      .eq('property_id', handbook.property_id)
      .single(),
  ])

  return {
    data: {
      handbook,
      property,
      rooms: roomsResult.data ?? [],
      appliances: appliancesResult.data ?? [],
      emergency_info: emergencyResult.data ?? null,
    },
    error: null,
  }
}

export async function upsertHandbookConfig(
  propertyId: string,
  formData: FormData
): Promise<{ data: HandbookConfig | null; error: string | null }> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: 'Not authenticated' }
  }

  const wifiRaw = formData.get('wifi') as string | null
  const houseRulesRaw = formData.get('house_rules') as string | null
  const localRecommendationsRaw = formData.get('local_recommendations') as string | null
  const utilityInfoRaw = formData.get('utility_info') as string | null

  const record: HandbookConfigInsert = {
    property_id: propertyId,
    welcome_message: (formData.get('welcome_message') as string) || null,
    wifi: wifiRaw ? JSON.parse(wifiRaw) : null,
    parking: (formData.get('parking') as string) || null,
    trash: (formData.get('trash') as string) || null,
    house_rules: houseRulesRaw ? JSON.parse(houseRulesRaw) : [],
    local_recommendations: localRecommendationsRaw ? JSON.parse(localRecommendationsRaw) : [],
    utility_info: utilityInfoRaw ? JSON.parse(utilityInfoRaw) : [],
  }

  // Check if config already exists
  const { data: existing } = await supabase
    .from('handbook_configs')
    .select('id')
    .eq('property_id', propertyId)
    .single()

  let data: HandbookConfig | null = null
  let error = null

  if (existing) {
    const { property_id: _pid, ...updateFields } = record
    const result = await supabase
      .from('handbook_configs')
      .update(updateFields)
      .eq('property_id', propertyId)
      .select()
      .single()

    data = result.data
    error = result.error
  } else {
    const result = await supabase
      .from('handbook_configs')
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

export async function publishHandbook(propertyId: string): Promise<{
  data: HandbookConfig | null;
  error: string | null;
}> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: 'Not authenticated' }
  }

  // Check if config exists
  const { data: existing } = await supabase
    .from('handbook_configs')
    .select('id, share_id')
    .eq('property_id', propertyId)
    .single()

  const shareId = existing?.share_id || crypto.randomUUID().slice(0, 8)

  const update: HandbookConfigUpdate = {
    published: true,
    share_id: shareId,
  }

  let data: HandbookConfig | null = null
  let error = null

  if (existing) {
    const result = await supabase
      .from('handbook_configs')
      .update(update)
      .eq('property_id', propertyId)
      .select()
      .single()

    data = result.data
    error = result.error
  } else {
    const result = await supabase
      .from('handbook_configs')
      .insert({
        property_id: propertyId,
        published: true,
        share_id: shareId,
      })
      .select()
      .single()

    data = result.data
    error = result.error
  }

  if (error) {
    return { data: null, error: error.message }
  }

  // Log activity
  await supabase.from('activity_log').insert({
    user_id: user.id,
    property_id: propertyId,
    type: 'handbook_published',
    title: 'Handbook published',
    description: `Handbook published with share ID "${shareId}"`,
  })

  revalidatePath(`/property/${propertyId}`)

  return { data, error: null }
}

export async function unpublishHandbook(propertyId: string): Promise<{
  data: HandbookConfig | null;
  error: string | null;
}> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('handbook_configs')
    .update({ published: false })
    .eq('property_id', propertyId)
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  revalidatePath(`/property/${propertyId}`)

  return { data, error: null }
}

export async function setHandbookPassword(
  propertyId: string,
  password: string
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const { error } = await supabase
    .from('handbook_configs')
    .update({ password_hash: passwordHash })
    .eq('property_id', propertyId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/property/${propertyId}`)

  return { error: null }
}

export async function verifyHandbookPassword(
  shareId: string,
  password: string
): Promise<{ data: boolean; error: string | null }> {
  // Public endpoint — no auth required
  const supabase = await createClient()

  const { data: handbook, error } = await supabase
    .from('handbook_configs')
    .select('password_hash')
    .eq('share_id', shareId)
    .eq('published', true)
    .single()

  if (error || !handbook) {
    return { data: false, error: 'Handbook not found' }
  }

  if (!handbook.password_hash) {
    // No password set — access granted
    return { data: true, error: null }
  }

  const isValid = await bcrypt.compare(password, handbook.password_hash)

  return { data: isValid, error: null }
}
