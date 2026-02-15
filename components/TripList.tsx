import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth'
import Link from 'next/link'
import type { Viaje } from '@/lib/supabase/types'
import { formatCurrency, formatDate } from '@/lib/utils'

export default async function TripList() {
  const supabase = await createClient()
  const profile = await getProfile()

  let query = supabase
    .from('viajes')
    .select('*, clientes(nombre_comercial, razon_social)')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(20)

  if (profile?.rol !== 'master' && profile?.sucursal_id) {
    query = query.eq('sucursal_id', profile.sucursal_id)
  }

  const { data: viajes } = await query

  const estadoColors: Record<string, string> = {
    pendiente: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
    asignado: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    en_ruta: 'bg-green-500/20 text-green-400 border-green-500/50',
    entregado: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    cancelado: 'bg-red-500/20 text-red-400 border-red-500/50',
  }

  const estadoLabels: Record<string, string> = {
    pendiente: 'Pendiente',
    asignado: 'Asignado',
    en_ruta: 'En Ruta',
    entregado: 'Entregado',
    cancelado: 'Cancelado',
  }

  return (
    <div className="bg-[#1E293B] rounded-2xl border border-gray-800 overflow-hidden">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-lg font-semibold text-white">Viajes Recientes</h2>
      </div>
      <div className="max-h-[600px] overflow-y-auto">
        {viajes && viajes.length > 0 ? (
          <div className="divide-y divide-gray-800">
            {viajes.map((viaje: any) => {
              const cliente = viaje.clientes
              const clienteNombre = cliente?.nombre_comercial || cliente?.razon_social || 'Sin cliente'
              const origen = `${viaje.origen_ciudad} - ${viaje.origen_direccion}`
              const destino = `${viaje.destino_ciudad} - ${viaje.destino_direccion}`
              
              return (
                <Link
                  key={viaje.id}
                  href={`/viajes/${viaje.id}`}
                  className="block p-4 hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-white">
                          {clienteNombre}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded border ${estadoColors[viaje.estado] || estadoColors.pendiente}`}
                        >
                          {estadoLabels[viaje.estado] || viaje.estado}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">
                        {origen} → {destino}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">
                        {formatCurrency(viaje.valor_cliente)}
                      </p>
                      <p className="text-xs text-gray-400">{formatDate(viaje.fecha_carga)}</p>
                    </div>
                  </div>
                </Link>
              )
            })}
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
