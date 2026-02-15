'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Cliente, Transportista } from '@/lib/supabase/types'
import { formatDate } from '@/lib/utils'

interface AprobacionesContentProps {
  initialClientes: Cliente[]
  initialTransportistas: Transportista[]
}

export default function AprobacionesContent({
  initialClientes,
  initialTransportistas,
}: AprobacionesContentProps) {
  const router = useRouter()
  const [clientes, setClientes] = useState(initialClientes)
  const [transportistas, setTransportistas] = useState(initialTransportistas)
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleApproveCliente = async (clienteId: string) => {
    setLoading(`cliente-${clienteId}`)
    setError(null)

    try {
      const response = await fetch(`/api/clientes/${clienteId}/approve`, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al aprobar cliente')
      }

      setClientes((prev) => prev.filter((c) => c.id !== clienteId))
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Error al aprobar cliente')
    } finally {
      setLoading(null)
    }
  }

  const handleApproveTransportista = async (transportistaId: string) => {
    setLoading(`transportista-${transportistaId}`)
    setError(null)

    try {
      const response = await fetch(`/api/transportistas/${transportistaId}/approve`, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al aprobar transportista')
      }

      setTransportistas((prev) => prev.filter((t) => t.id !== transportistaId))
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Error al aprobar transportista')
    } finally {
      setLoading(null)
    }
  }

  const totalPendientes = clientes.length + transportistas.length

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
          {error}
        </div>
      )}

      {totalPendientes === 0 ? (
        <div className="bg-slate-900 rounded-2xl border border-gray-800 p-12 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-semibold text-white mb-2">¡Todo al día!</h2>
          <p className="text-gray-400">No hay aprobaciones pendientes</p>
        </div>
      ) : (
        <>
          {/* Clientes Pendientes */}
          {clientes.length > 0 && (
            <div className="bg-slate-900 rounded-2xl border border-gray-800 overflow-hidden">
              <div className="p-4 border-b border-gray-800 bg-yellow-500/10">
                <h2 className="text-lg font-semibold text-white">
                  Clientes Pendientes ({clientes.length})
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                        Nombre Comercial
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                        Razón Social
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                        RUC/CI
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                        Teléfono
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                        Creado
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">
                        Acción
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {clientes.map((cliente) => (
                      <tr key={cliente.id} className="hover:bg-gray-800/30">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-white">
                            {cliente.nombre_comercial}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-300">{cliente.razon_social}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-300">{cliente.ruc_ci}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-300">{cliente.telefono}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-400">
                            {formatDate(cliente.created_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleApproveCliente(cliente.id)}
                            disabled={loading === `cliente-${cliente.id}`}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loading === `cliente-${cliente.id}` ? 'Aprobando...' : 'Aprobar'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Transportistas Pendientes */}
          {transportistas.length > 0 && (
            <div className="bg-slate-900 rounded-2xl border border-gray-800 overflow-hidden">
              <div className="p-4 border-b border-gray-800 bg-yellow-500/10">
                <h2 className="text-lg font-semibold text-white">
                  Transportistas Pendientes ({transportistas.length})
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                        Nombre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                        Cédula
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                        Teléfono
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                        Ciudad Base
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                        Placa
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                        Creado
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">
                        Acción
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {transportistas.map((transportista) => (
                      <tr key={transportista.id} className="hover:bg-gray-800/30">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-white">
                            {transportista.nombre}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-300">
                            {transportista.cedula || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-300">
                            {transportista.telefono || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-300">
                            {transportista.ciudad_base || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-300">
                            {transportista.placa || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-400">
                            {formatDate(transportista.created_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleApproveTransportista(transportista.id)}
                            disabled={loading === `transportista-${transportista.id}`}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loading === `transportista-${transportista.id}`
                              ? 'Aprobando...'
                              : 'Aprobar'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
