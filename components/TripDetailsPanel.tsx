'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils'
import type { Viaje, Profile } from '@/lib/supabase/types'

interface TripDetailsPanelProps {
  viaje: Viaje
  profile: Profile
}

export default function TripDetailsPanel({ viaje, profile }: TripDetailsPanelProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const estadoColors: Record<string, string> = {
    cotizado: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    asignado: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    en_ruta: 'bg-green-500/20 text-green-400 border-green-500/50',
    entregado: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
  }

  const estadoLabels: Record<string, string> = {
    cotizado: 'Cotizado',
    asignado: 'Asignado',
    en_ruta: 'En Ruta',
    entregado: 'Entregado',
  }

  const handleEstadoChange = async (newEstado: string) => {
    setLoading(true)
    setError(null)

    try {
      const updateData: any = { estado: newEstado }
      if (newEstado === 'entregado' && viaje.estado !== 'entregado') {
        updateData.delivered_at = new Date().toISOString()
      }

      const { error: updateError } = await supabase
        .from('viajes')
        .update(updateData)
        .eq('id', viaje.id)

      if (updateError) throw updateError

      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Error al actualizar estado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#1E293B] rounded-2xl border border-gray-800 p-6 space-y-6">
      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Cliente</label>
          <p className="text-lg font-semibold text-white">{viaje.cliente}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Estado</label>
          <div className="flex items-center gap-3">
            <span
              className={`text-sm px-3 py-1 rounded border ${estadoColors[viaje.estado]}`}
            >
              {estadoLabels[viaje.estado]}
            </span>
            <select
              value={viaje.estado}
              onChange={(e) => handleEstadoChange(e.target.value)}
              disabled={loading}
              className="px-3 py-1 bg-[#0F172A] border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            >
              <option value="cotizado">Cotizado</option>
              <option value="asignado">Asignado</option>
              <option value="en_ruta">En Ruta</option>
              <option value="entregado">Entregado</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Origen</label>
          <p className="text-white">{viaje.origen}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Destino</label>
          <p className="text-white">{viaje.destino}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Fecha</label>
          <p className="text-white">{formatDate(viaje.fecha)}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Tarifa Cliente</label>
          <p className="text-lg font-semibold text-white">{formatCurrency(viaje.tarifa_cliente)}</p>
        </div>

        {profile.rol === 'master' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Costo Proveedor
              </label>
              <p className="text-white">{formatCurrency(viaje.costo_proveedor)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Margen</label>
              <p className="text-white">{formatCurrency(viaje.margen)}</p>
            </div>

            {viaje.notas_internas && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Notas Internas
                </label>
                <p className="text-white bg-[#0F172A] p-3 rounded border border-gray-700">
                  {viaje.notas_internas}
                </p>
              </div>
            )}
          </>
        )}

        {viaje.notas && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-400 mb-1">Notas</label>
            <p className="text-white bg-[#0F172A] p-3 rounded border border-gray-700">
              {viaje.notas}
            </p>
          </div>
        )}

        {viaje.delivered_at && (
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Entregado el</label>
            <p className="text-white">{formatDateTime(viaje.delivered_at)}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Creado</label>
          <p className="text-white">{formatDateTime(viaje.created_at)}</p>
        </div>
      </div>
    </div>
  )
}
