import { requireMaster } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import type { Profile, Sucursal } from '@/lib/supabase/types'
import UserManagement from '@/components/UserManagement'

export const dynamic = 'force-dynamic'

export default async function UsuariosPage() {
  await requireMaster()
  const supabase = await createClient()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*, sucursales(codigo, nombre)')
    .order('created_at', { ascending: false })

  const { data: sucursales } = await supabase
    .from('sucursales')
    .select('*')
    .order('codigo')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Gestión de Usuarios</h1>
        <p className="text-gray-400">Aprobar usuarios y asignar roles</p>
      </div>

      <UserManagement
        initialProfiles={profiles || []}
        sucursales={sucursales || []}
      />
    </div>
  )
}
