'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Cliente, Sucursal } from '@/lib/supabase/types'

interface ClienteModalProps {
  cliente: Cliente | null
  sucursalId: string | null
  onClose: () => void
  onSuccess: () => void
}

export default function ClienteModal({ cliente, sucursalId, onClose, onSuccess }: ClienteModalProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sucursales, setSucursales] = useState<Sucursal[]>([])

  const [formData, setFormData] = useState({
    nombre_comercial: '',
    razon_social: '',
    ruc_ci: '',
    telefono: '',
    email: '',
    ciudad: '',
    direccion: '',
    notas: '',
    sucursal_id: sucursalId || '',
  })

  useEffect(() => {
    loadSucursales()
    if (cliente) {
      setFormData({
        nombre_comercial: cliente.nombre_comercial || '',
        razon_social: cliente.razon_social || '',
        ruc_ci: cliente.ruc_ci || '',
        telefono: cliente.telefono || '',
        email: cliente.email || '',
        ciudad: cliente.ciudad || '',
        direccion: cliente.direccion || '',
        notas: cliente.notas || '',
        sucursal_id: cliente.sucursal_id || sucursalId || '',
      })
    } else {
      // Si no hay cliente, usar la sucursal del usuario por defecto
      setFormData((prev) => ({
        ...prev,
        sucursal_id: sucursalId || '',
      }))
    }
  }, [cliente, sucursalId])

  const loadSucursales = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('rol')
      .eq('id', user.id)
      .single()

    // Si es master, puede ver todas las sucursales, sino solo la suya
    let query = supabase.from('sucursales').select('*').order('nombre')

    if (profile?.rol !== 'master' && sucursalId) {
      query = query.eq('id', sucursalId)
    }

    const { data } = await query
    if (data) setSucursales(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validaciones
      if (!formData.nombre_comercial.trim()) {
        throw new Error('El nombre comercial es requerido')
      }
      if (!formData.razon_social.trim()) {
        throw new Error('La razón social es requerida')
      }
      if (!formData.ruc_ci.trim()) {
        throw new Error('El RUC/CI es requerido')
      }
      if (!formData.telefono.trim()) {
        throw new Error('El teléfono es requerido')
      }
      if (!formData.sucursal_id) {
        throw new Error('La sucursal es requerida')
      }

      if (cliente) {
        // Actualizar
        const { error: updateError } = await supabase
          .from('clientes')
          .update({
            nombre_comercial: formData.nombre_comercial.trim(),
            razon_social: formData.razon_social.trim(),
            ruc_ci: formData.ruc_ci.trim(),
            telefono: formData.telefono.trim(),
            email: formData.email.trim() || null,
            ciudad: formData.ciudad.trim() || null,
            direccion: formData.direccion.trim() || null,
            notas: formData.notas.trim() || null,
            sucursal_id: formData.sucursal_id,
          })
          .eq('id', cliente.id)

        if (updateError) throw updateError
      } else {
        // Crear (requiere aprobación del master)
        const { error: insertError } = await supabase.from('clientes').insert({
          nombre_comercial: formData.nombre_comercial.trim(),
          razon_social: formData.razon_social.trim(),
          ruc_ci: formData.ruc_ci.trim(),
          telefono: formData.telefono.trim(),
          email: formData.email.trim() || null,
          ciudad: formData.ciudad.trim() || null,
          direccion: formData.direccion.trim() || null,
          notas: formData.notas.trim() || null,
          sucursal_id: formData.sucursal_id,
          activo: true,
          aprobado: false, // Requiere aprobación del master
          aprobado_por: null,
          aprobado_at: null,
        })

        if (insertError) throw insertError
      }

      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Error al guardar el cliente')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div 
        className="bg-[#1E293B] rounded-2xl border border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              {cliente ? 'Editar Cliente' : 'Nuevo Cliente'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre Comercial */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nombre Comercial <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.nombre_comercial}
                onChange={(e) =>
                  setFormData({ ...formData, nombre_comercial: e.target.value })
                }
                className="w-full px-4 py-2 bg-[#0F172A] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                placeholder="Ej: Mi Empresa"
              />
            </div>

            {/* Razón Social */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Razón Social <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.razon_social}
                onChange={(e) =>
                  setFormData({ ...formData, razon_social: e.target.value })
                }
                className="w-full px-4 py-2 bg-[#0F172A] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                placeholder="Ej: Mi Empresa S.A."
              />
            </div>

            {/* RUC/CI */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                RUC/CI <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.ruc_ci}
                onChange={(e) =>
                  setFormData({ ...formData, ruc_ci: e.target.value })
                }
                className="w-full px-4 py-2 bg-[#0F172A] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                placeholder="Ej: 1234567890001"
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Teléfono <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.telefono}
                onChange={(e) =>
                  setFormData({ ...formData, telefono: e.target.value })
                }
                className="w-full px-4 py-2 bg-[#0F172A] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                placeholder="Ej: 0991234567"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2 bg-[#0F172A] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                placeholder="Ej: contacto@empresa.com"
              />
            </div>

            {/* Ciudad */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Ciudad
              </label>
              <input
                type="text"
                value={formData.ciudad}
                onChange={(e) =>
                  setFormData({ ...formData, ciudad: e.target.value })
                }
                className="w-full px-4 py-2 bg-[#0F172A] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                placeholder="Ej: Guayaquil"
              />
            </div>

            {/* Sucursal */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sucursal <span className="text-red-400">*</span>
              </label>
              <select
                required
                value={formData.sucursal_id}
                onChange={(e) =>
                  setFormData({ ...formData, sucursal_id: e.target.value })
                }
                className="w-full px-4 py-2 bg-[#0F172A] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                disabled={sucursales.length === 1}
              >
                <option value="">Seleccionar sucursal</option>
                {sucursales.map((sucursal) => (
                  <option key={sucursal.id} value={sucursal.id}>
                    {sucursal.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Dirección */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Dirección
              </label>
              <input
                type="text"
                value={formData.direccion}
                onChange={(e) =>
                  setFormData({ ...formData, direccion: e.target.value })
                }
                className="w-full px-4 py-2 bg-[#0F172A] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                placeholder="Ej: Av. Principal 123"
              />
            </div>

            {/* Notas */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Notas
              </label>
              <textarea
                value={formData.notas}
                onChange={(e) =>
                  setFormData({ ...formData, notas: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-2 bg-[#0F172A] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent resize-none"
                placeholder="Notas adicionales sobre el cliente..."
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#F97316] hover:bg-[#EA6A0C] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : cliente ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
