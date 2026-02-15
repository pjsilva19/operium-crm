import { requireApprovedUser } from '@/lib/auth'
import { getViajeById } from '@/lib/viajes'
import { getClientesForSelect, getTransportistasForSelect } from '@/lib/viajes'
import { formatCurrency, formatDate } from '@/lib/utils'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DeleteViajeButton from '@/components/DeleteViajeButton'
import CambiarEstadoButton from '@/components/CambiarEstadoButton'

export const dynamic = 'force-dynamic'

export default async function ViajeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { profile } = await requireApprovedUser()
  const resolvedParams = await params
  const viaje = await getViajeById(resolvedParams.id, profile)

  if (!viaje) {
    redirect('/viajes')
  }

  // Cargar datos relacionados
  const clientes = await getClientesForSelect(profile)
  const transportistas = await getTransportistasForSelect(profile)
  
  const cliente = clientes.find(c => c.id === viaje.cliente_id)
  const transportista = transportistas.find(t => t.id === viaje.transportista_id)

  const estadoColors: Record<string, string> = {
    pendiente: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
    asignado: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    en_ruta: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    entregado: 'bg-green-500/20 text-green-400 border-green-500/50',
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
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Detalle del Viaje</h1>
          <p className="text-gray-400">Información completa del viaje</p>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/viajes/${resolvedParams.id}/editar`}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Editar
          </Link>
          <CambiarEstadoButton viajeId={resolvedParams.id} estadoActual={viaje.estado} />
          <DeleteViajeButton viajeId={resolvedParams.id} />
        </div>
      </div>

      <div className="bg-[#1E293B] rounded-2xl border border-gray-800 p-6 space-y-6">
        {/* Estado */}
        <div className="flex items-center gap-3 pb-4 border-b border-gray-800">
          <span className={`text-sm px-3 py-1 rounded border ${estadoColors[viaje.estado]}`}>
            {estadoLabels[viaje.estado]}
          </span>
          <span className="text-sm text-gray-400">
            Creado: {formatDate(viaje.created_at)}
          </span>
          {viaje.updated_at !== viaje.created_at && (
            <span className="text-sm text-gray-400">
              Actualizado: {formatDate(viaje.updated_at)}
            </span>
          )}
        </div>

        {/* Información Principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">Cliente</h3>
            <p className="text-white font-medium">
              {cliente?.nombre_comercial || cliente?.razon_social || 'N/A'}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">Transportista</h3>
            <p className="text-white">
              {transportista ? `${transportista.nombre} ${transportista.placa ? `(${transportista.placa})` : ''}` : 'Sin asignar'}
            </p>
          </div>
        </div>

        {/* Ruta */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">Origen</h3>
            <p className="text-white font-medium">{viaje.origen_ciudad}</p>
            <p className="text-gray-300 text-sm">{viaje.origen_direccion}</p>
            {viaje.origen_lat && viaje.origen_lng && (
              <p className="text-gray-500 text-xs mt-1">
                📍 {viaje.origen_lat.toFixed(6)}, {viaje.origen_lng.toFixed(6)}
              </p>
            )}
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">Destino</h3>
            <p className="text-white font-medium">{viaje.destino_ciudad}</p>
            <p className="text-gray-300 text-sm">{viaje.destino_direccion}</p>
            {viaje.destino_lat && viaje.destino_lng && (
              <p className="text-gray-500 text-xs mt-1">
                📍 {viaje.destino_lat.toFixed(6)}, {viaje.destino_lng.toFixed(6)}
              </p>
            )}
          </div>
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">Fecha de Carga</h3>
            <p className="text-white">{formatDate(viaje.fecha_carga)}</p>
          </div>
          {viaje.fecha_entrega_estimada && (
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Entrega Estimada</h3>
              <p className="text-white">{formatDate(viaje.fecha_entrega_estimada)}</p>
            </div>
          )}
          {viaje.fecha_entrega_real && (
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Entrega Real</h3>
              <p className="text-green-400 font-medium">{formatDate(viaje.fecha_entrega_real)}</p>
            </div>
          )}
        </div>

        {/* Información de Carga */}
        {(viaje.tipo_carga || viaje.peso_kg || viaje.volumen_m3 || viaje.pallets) && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4 border-t border-gray-800">
            {viaje.tipo_carga && (
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Tipo de Carga</h3>
                <p className="text-white capitalize">{viaje.tipo_carga}</p>
              </div>
            )}
            {viaje.peso_kg && (
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Peso</h3>
                <p className="text-white">{viaje.peso_kg.toLocaleString()} kg</p>
              </div>
            )}
            {viaje.volumen_m3 && (
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Volumen</h3>
                <p className="text-white">{viaje.volumen_m3.toLocaleString()} m³</p>
              </div>
            )}
            {viaje.pallets && (
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Pallets</h3>
                <p className="text-white">{viaje.pallets}</p>
              </div>
            )}
          </div>
        )}

        {/* Valores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-800">
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">Valor Cliente</h3>
            <p className="text-white text-xl font-semibold">{formatCurrency(viaje.valor_cliente)}</p>
          </div>
          {profile.rol === 'master' && (
            <>
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Costo Transportista</h3>
                <p className="text-white text-xl font-semibold">{formatCurrency(viaje.costo_transportista)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Margen</h3>
                <p className={`text-xl font-semibold ${viaje.margen >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(viaje.margen)}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Referencias */}
        {(viaje.guia_numero || viaje.factura_numero || viaje.orden_cliente) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-800">
            {viaje.guia_numero && (
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Guía Número</h3>
                <p className="text-white">{viaje.guia_numero}</p>
              </div>
            )}
            {viaje.factura_numero && (
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Factura Número</h3>
                <p className="text-white">{viaje.factura_numero}</p>
              </div>
            )}
            {viaje.orden_cliente && (
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Orden Cliente</h3>
                <p className="text-white">{viaje.orden_cliente}</p>
              </div>
            )}
          </div>
        )}

        {/* Observaciones */}
        {viaje.observaciones && (
          <div className="pt-4 border-t border-gray-800">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Observaciones</h3>
            <p className="text-white whitespace-pre-wrap">{viaje.observaciones}</p>
          </div>
        )}
      </div>
    </div>
  )
}
