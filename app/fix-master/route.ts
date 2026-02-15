import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  // Check if user is master
  const { data: profile } = await supabase
    .from('profiles')
    .select('rol, approved')
    .eq('id', user.id)
    .single()

  if (profile?.rol === 'master') {
    // Auto-approve master user
    const { error } = await supabase
      .from('profiles')
      .update({ approved: true })
      .eq('id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Cuenta master aprobada',
      redirect: '/dashboard'
    })
  }

  return NextResponse.json({ error: 'No eres usuario master' }, { status: 403 })
}
