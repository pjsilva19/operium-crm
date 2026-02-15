import { createClient } from '@/lib/supabase/server'
import type { Profile, Sucursal } from '@/lib/supabase/types'
import { getProfile } from '@/lib/auth'

export default async function Topbar() {
  const profile = await getProfile()
  const supabase = await createClient()

  let sucursal: Sucursal | null = null
  if (profile?.sucursal_id && supabase) {
    const { data } = await supabase
      .from('sucursales')
      .select('*')
      .eq('id', profile.sucursal_id)
      .single()
    sucursal = data
  }

  // Master can see all sucursales, but we'll show their assigned one by default
  // (optional: add selector later)

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-[#1E293B] border-b border-gray-800 flex items-center justify-between px-6 z-40">
      <div className="flex items-center gap-4">
        {sucursal ? (
          <div className="flex items-center gap-2 text-gray-300">
            <span className="text-xl">🏢</span>
            <span className="font-medium">
              {sucursal.codigo} — {sucursal.nombre}
            </span>
          </div>
        ) : profile?.rol === 'master' ? (
          <div className="flex items-center gap-2 text-gray-300">
            <span className="text-xl">👑</span>
            <span className="font-medium">Master Admin</span>
          </div>
        ) : (
          <div className="text-gray-400 text-sm">Sin sucursal asignada</div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500/50 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-green-400 font-medium">En línea</span>
        </div>
      </div>
    </header>
  )
}
