import { createClient } from './supabase/server'
import { redirect } from 'next/navigation'
import type { Profile } from './supabase/types'

export async function getSession() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  const user = await getUser()
  
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }
  return session
}

export async function requireApprovedUser() {
  const session = await requireAuth()
  const profile = await getProfile()
  
  if (!profile) {
    // Create profile if it doesn't exist
    const supabase = await createClient()
    const user = await getUser()
    if (user) {
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email!,
          nombre: user.user_metadata?.nombre || null,
          rol: 'pending',
          approved: false
        })
      
      if (!error) {
        redirect('/pending')
      }
    }
    redirect('/pending')
  }
  
  // Master users can always access, even if not approved
  if (!profile.approved && profile.rol !== 'master') {
    redirect('/pending')
  }
  
  return { session, profile }
}

export async function requireMaster() {
  const { profile } = await requireApprovedUser()
  if (profile.rol !== 'master') {
    redirect('/dashboard')
  }
  return profile
}
