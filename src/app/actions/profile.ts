'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Profile, ProfileUpdate, Subscription } from '@/types/database'

export async function getProfile(): Promise<{ data: Profile | null; error: string | null }> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function updateProfile(formData: FormData): Promise<{
  data: Profile | null;
  error: string | null;
}> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: 'Not authenticated' }
  }

  const update: ProfileUpdate = {
    full_name: (formData.get('full_name') as string) || null,
    avatar_url: (formData.get('avatar_url') as string) || null,
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(update)
    .eq('id', user.id)
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  revalidatePath('/dashboard')

  return { data, error: null }
}

export async function getSubscriptionStatus(): Promise<{
  data: {
    profile: Profile;
    subscription: Subscription | null;
  } | null;
  error: string | null;
}> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: 'Not authenticated' }
  }

  const [profileResult, subscriptionResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single(),
  ])

  if (profileResult.error) {
    return { data: null, error: profileResult.error.message }
  }

  return {
    data: {
      profile: profileResult.data,
      subscription: subscriptionResult.data ?? null,
    },
    error: null,
  }
}
