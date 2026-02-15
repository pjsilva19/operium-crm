import { requireMaster } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import type { Cliente, Transportista } from '@/lib/supabase/types'
import AprobacionesContent from '@/components/AprobacionesContent'

export default async function AprobacionesPage() {
  await requireMaster()
  const supabase = await createClient()

  // Obtener clientes pendientes
  const { data: clientesPendientes } = await supabase
    .from('clientes')
    .select('*')
    .eq('aprobado', false)
    .order('created_at', { ascending: false })

  // Obtener transportistas pendientes
  const { data: transportistasPendientes } = await supabase
    .from('transportistas')
    .select('*')
    .eq('aprobado', false)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Aprobaciones Pendientes</h1>
        <p className="text-gray-400">Revisa y aprueba clientes y transportistas pendientes</p>
      </div>

      <AprobacionesContent
        initialClientes={clientesPendientes || []}
        initialTransportistas={transportistasPendientes || []}
      />
    </div>
  )
}
