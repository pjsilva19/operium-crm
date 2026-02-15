import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth'
import TripListItem from './TripListItem'
import type { Viaje, Sucursal } from '@/lib/supabase/types'

export default async function TripList() {
  const supabase = await createClient()
  const profile = await getProfile()

  let query = supabase
    .from('viajes')
    .select('*, sucursales(codigo, nombre)')
    .order('created_at', { ascending: false })
    .limit(20)

  if (profile?.rol !== 'master' && profile?.sucursal_id) {
    query = query.eq('sucursal_id', profile.sucursal_id)
  }

  const { data: viajes } = await query

  const estadoColors: Record<string, string> = {
    cotizado: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    asignado: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    en_ruta: 'bg-green-500/20 text-green-400 border-green-500/50',
    entregado: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
  }

  return (
    <div className="bg-[#1E293B] rounded-2xl border border-gray-800 overflow-hidden">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-lg font-semibold text-white">Viajes Recientes</h2>
      </div>
      <div className="max-h-[600px] overflow-y-auto">
        {viajes && viajes.length > 0 ? (
          <div className="divide-y divide-gray-800">
            {viajes.map((viaje: Viaje) => (
              <TripListItem key={viaje.id} viaje={viaje} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-400">
            <p>No hay viajes registrados</p>
          </div>
        )}
      </div>
    </div>
  )
}
