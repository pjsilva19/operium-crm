'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import type { Cliente } from '@/lib/supabase/types'

export default function EditarClientePage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    nombre: '',
    ruc_ci: '',
    telefono: '',
    email: '',
    direccion: '',
    ciudad: '',
    notas: '',
    activo: true,
  })

  useEffect(() => {
    loadCliente()
  }, [])

  const loadCliente = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', params.id)
        .single()

      if (fetchError) throw fetchError

      if (data) {
        setFormData({
          nombre: data.nombre || '',
          ruc_ci: data.ruc_ci || '',
          telefono: data.telefono || '',
          email: data.email || '',
          direccion: data.direccion || '',
          ciudad: data.ciudad || '',
          notas: data.notas || '',
          activo: data.activo ?? true,
        })
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar cliente')
    } finally {
      setLoadingData(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error: updateError } = await supabase
        .from('clientes')
        .update({
          nombre: formData.nombre,
          ruc_ci: formData.ruc_ci || null,
          telefono: formData.telefono || null,
          email: formData.email || null,
          direccion: formData.direccion || null,
          ciudad: formData.ciudad || null,
          notas: formData.notas || null,
          activo: formData.activo,
        })
        .eq('id', params.id)

      if (updateError) throw updateError

      router.push(`/clientes/${params.id}`)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Error al actualizar cliente')
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="max-w-4xl space-y-6">
        <div className="text-white">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <Link
          href={`/clientes/${params.id}`}
          className="text-gray-400 hover:text-white mb-4 inline-block"
        >
          ← Volver a Cliente
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">Editar Cliente</h1>
        <p className="text-gray-400">Modificar información del cliente</p>
      </div>

      <div className="bg-[#1E293B] rounded-2xl border border-gray-800 p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nombre *
              </label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-4 py-2 bg-[#0F172A] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                RUC/CI
              </label>
              <input
                type="text"
                value={formData.ruc_ci}
                onChange={(e) => setFormData({ ...formData, ruc_ci: e.target.value })}
                className="w-full px-4 py-2 bg-[#0F172A] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="w-full px-4 py-2 bg-[#0F172A] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 bg-[#0F172A] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Ciudad
              </label>
              <input
                type="text"
                value={formData.ciudad}
                onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                className="w-full px-4 py-2 bg-[#0F172A] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Dirección
              </label>
              <input
                type="text"
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                className="w-full px-4 py-2 bg-[#0F172A] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-700 bg-[#0F172A] text-[#F97316] focus:ring-2 focus:ring-[#F97316]"
                />
                <span className="text-sm font-medium text-gray-300">Cliente Activo</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notas
            </label>
            <textarea
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 bg-[#0F172A] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-[#F97316] hover:bg-[#EA6A0C] text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <Link
              href={`/clientes/${params.id}`}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
