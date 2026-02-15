'use client'

import Link from 'next/link'
import type { Viaje } from '@/lib/supabase/types'
import { formatCurrency, formatDate } from '@/lib/utils'

interface TripListItemProps {
  viaje: Viaje
}

export default function TripListItem({ viaje }: TripListItemProps) {
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

  return (
    <Link
      href={`/viajes/${viaje.id}`}
      className="block p-4 hover:bg-gray-800/50 transition-colors"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-white">
              {viaje.cliente}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded border ${estadoColors[viaje.estado]}`}
            >
              {estadoLabels[viaje.estado]}
            </span>
          </div>
          <p className="text-xs text-gray-400">
            {viaje.origen} → {viaje.destino}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-white">
            {formatCurrency(viaje.tarifa_cliente)}
          </p>
          <p className="text-xs text-gray-400">{formatDate(viaje.fecha)}</p>
        </div>
      </div>
    </Link>
  )
}
