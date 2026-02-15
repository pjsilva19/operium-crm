import { requireApprovedUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDate, formatDateTime } from '@/lib/utils'
import type { Cliente } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

export default async function ClienteDetailPage({ params }: { params: { id: string } }) {
  const { profile } = await requireApprovedUser()
  const supabase = await createClient()

  const { data: cliente } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!cliente) {
    notFound()
  }

  // Check access
  if (profile.rol !== 'master' && cliente.sucursal_id !== profile.sucursal_id) {
    notFound()
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/clientes"
            className="text-gray-400 hover:text-white mb-4 inline-block"
          >
            ← Volver a Clientes
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Detalle de Cliente</h1>
        </div>
        <Link
          href={`/clientes/${cliente.id}/editar`}
          className="px-6 py-3 bg-[#F97316] hover:bg-[#EA6A0C] text-white font-semibold rounded-lg transition-colors"
        >
          Editar Cliente
        </Link>
      </div>

      <div className="bg-[#1E293B] rounded-2xl border border-gray-800 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Nombre</label>
            <p className="text-lg font-semibold text-white">{cliente.nombre}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Estado</label>
            <span
              className={`text-sm px-3 py-1 rounded border ${
                cliente.activo
                  ? 'bg-green-500/20 text-green-400 border-green-500/50'
                  : 'bg-gray-500/20 text-gray-400 border-gray-500/50'
              }`}
            >
              {cliente.activo ? 'Activo' : 'Inactivo'}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">RUC/CI</label>
            <p className="text-white">{cliente.ruc_ci || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Teléfono</label>
            <p className="text-white">{cliente.telefono || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
            <p className="text-white">{cliente.email || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Ciudad</label>
            <p className="text-white">{cliente.ciudad || '-'}</p>
          </div>

          {cliente.direccion && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-1">Dirección</label>
              <p className="text-white">{cliente.direccion}</p>
            </div>
          )}

          {cliente.notas && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-1">Notas</label>
              <p className="text-white bg-[#0F172A] p-3 rounded border border-gray-700">
                {cliente.notas}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Creado</label>
            <p className="text-white">{formatDateTime(cliente.created_at)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Actualizado</label>
            <p className="text-white">{formatDateTime(cliente.updated_at)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
