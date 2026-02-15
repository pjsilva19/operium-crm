import { requireApprovedUser } from '@/lib/auth'
import { getTransportistas } from '@/lib/transportistas'
import type { Transportista } from '@/lib/supabase/types'
import Link from 'next/link'
import DeleteTransportistaButton from '@/components/DeleteTransportistaButton'

export const dynamic = 'force-dynamic'

export default async function TransportistasPage() {
  const { profile } = await requireApprovedUser()
  
  let transportistas: Transportista[] = []
  try {
    transportistas = await getTransportistas(profile)
  } catch (error: any) {
    console.error('Error loading transportistas:', error)
    // Continuar con array vacío para no romper la UI
    transportistas = []
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Transportistas</h1>
          <p className="text-gray-400">Gestión de transportistas</p>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-slate-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Cédula
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Ciudad Base
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Tipo Camión
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Placa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {transportistas.length > 0 ? (
                transportistas.map((transportista) => (
                  <tr key={transportista.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{transportista.nombre}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{transportista.cedula || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{transportista.telefono || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{transportista.ciudad_base || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{transportista.tipo_camion || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{transportista.placa || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`text-xs px-2 py-1 rounded border ${
                          transportista.estado
                            ? 'bg-green-500/20 text-green-400 border-green-500/50'
                            : 'bg-gray-500/20 text-gray-400 border-gray-500/50'
                        }`}
                      >
                        {transportista.estado ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/transportistas/${transportista.id}/editar`}
                        className="text-blue-400 hover:text-blue-300 mr-4 transition-colors"
                      >
                        Editar
                      </Link>
                      <DeleteTransportistaButton
                        transportistaId={transportista.id}
                        transportistaNombre={transportista.nombre}
                        isMaster={profile.rol === 'master'}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <p className="text-gray-400">No hay transportistas registrados</p>
                      <Link
                        href="/transportistas/nuevo"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#F97316] hover:bg-[#EA6A0C] text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl"
                      >
                        <span className="text-xl">+</span>
                        <span>Agregar Primer Transportista</span>
                      </Link>
                    </div>
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
