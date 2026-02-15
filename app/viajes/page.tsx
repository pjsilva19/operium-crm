import { requireApprovedUser } from '@/lib/auth'
import { getViajes } from '@/lib/viajes'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'

export default async function ViajesPage() {
  const { profile } = await requireApprovedUser()
  const viajes = await getViajes(profile)

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Viajes</h1>
        <p className="text-gray-400">Gestión de viajes y entregas</p>
      </div>

      <div className="bg-[#1E293B] rounded-2xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Fecha Carga
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Origen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Destino
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Valor
                </th>
                {profile.rol === 'master' && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Costo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Margen
                    </th>
                  </>
                )}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {viajes && viajes.length > 0 ? (
                viajes.map((viaje: any) => {
                  const cliente = viaje.clientes
                  const transportista = viaje.transportistas
                  
                  return (
                    <tr key={viaje.id} className="hover:bg-gray-800/30">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">{formatDate(viaje.fecha_carga)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-white">
                          {cliente?.nombre_comercial || cliente?.razon_social || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-300">
                          {viaje.origen_ciudad}
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">
                          {viaje.origen_direccion}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-300">
                          {viaje.destino_ciudad}
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">
                          {viaje.destino_direccion}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`text-xs px-2 py-1 rounded border ${estadoColors[viaje.estado] || estadoColors.pendiente}`}
                        >
                          {estadoLabels[viaje.estado] || viaje.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {formatCurrency(viaje.valor_cliente)}
                        </div>
                      </td>
                      {profile.rol === 'master' && (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-300">
                              {formatCurrency(viaje.costo_transportista || 0)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-medium ${viaje.margen >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {formatCurrency(viaje.margen || 0)}
                            </div>
                          </td>
                        </>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/viajes/${viaje.id}`}
                          className="text-[#F97316] hover:text-[#EA6A0C] mr-4"
                        >
                          Ver
                        </Link>
                        <Link
                          href={`/viajes/${viaje.id}/editar`}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          Editar
                        </Link>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={profile.rol === 'master' ? 9 : 7} className="px-6 py-8 text-center text-gray-400">
                    No hay viajes registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
