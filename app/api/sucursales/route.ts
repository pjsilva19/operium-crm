import { createClient } from '@/lib/supabase/server'
import { requireApprovedUser } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { profile } = await requireApprovedUser()
    const supabase = await createClient()

    // Get all sucursales (no RLS on sucursales table)
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 })
    }
    const { data: sucursales, error } = await supabase
      .from('sucursales')
      .select('*')
      .order('codigo')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ sucursales: sucursales || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
}
