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

  // Check if user is master
  const { data: profile } = await supabase
    .from('profiles')
    .select('rol')
    .eq('id', user.id)
    .single()

  if (profile?.rol === 'master') {
    // Auto-approve master user
    await supabase
      .from('profiles')
      .update({ approved: true })
      .eq('id', user.id)
  }

  redirect('/dashboard')
}
