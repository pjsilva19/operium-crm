import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function POST() {
  const supabase = await createClient()
  if (!supabase) {
    redirect('/login')
  }
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Force approve this specific user
  const { error } = await supabase
    .from('profiles')
    .update({ approved: true })
    .eq('id', user.id)

  if (error) {
    console.error('Error approving user:', error)
  }

  redirect('/dashboard')
}
