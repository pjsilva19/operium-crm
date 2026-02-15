'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import type { Transportista } from '@/lib/supabase/types'

const TIPOS_CAMION = [
  'Camión pequeño',
  'Camión mediano',
  'Camión grande',
  'Tractocamión',
  'Furgón',
  'Otro',
]

export default function EditarTransportistaPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transportista, setTransportista] = useState<Transportista | null>(null)

  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    telefono: '',
    ciudad_base: '',
    tipo_camion: '',
    capacidad: '',
    placa: '',
    estado: true,
  })

  useEffect(() => {
    loadTransportista()
  }, [id])

  const loadTransportista = async () => {
    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('transportistas')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      // Verificar acceso (solo su sucursal o master)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('sucursal_id, rol')
        .eq('id', user.id)
        .single()

      if (profile?.rol !== 'master' && profile?.sucursal_id) {
        const { data: sucursal } = await supabase
          .from('sucursales')
          .select('codigo')
          .eq('id', profile.sucursal_id)
          .single()

        if (sucursal?.codigo && data.sucursal_codigo !== sucursal.codigo) {
          router.push('/transportistas')
          return
        }
      }

      const t = data as Transportista
      setTransportista(t)
      setFormData({
        nombre: t.nombre || '',
        cedula: t.cedula || '',
        telefono: t.telefono || '',
        ciudad_base: t.ciudad_base || '',
        tipo_camion: t.tipo_camion || '',
        capacidad: t.capacidad?.toString() || '',
        placa: t.placa || '',
        estado: t.estado ?? true,
      })
    } catch (err: any) {
      console.error('Error loading transportista:', err)
      setError('Error al cargar transportista')
      router.push('/transportistas')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      if (!formData.nombre.trim()) {
        throw new Error('El nombre es requerido')
      }

      const { error: updateError } = await supabase
        .from('transportistas')
        .update({
          nombre: formData.nombre.trim(),
          cedula: formData.cedula.trim() || null,
          telefono: formData.telefono.trim() || null,
          ciudad_base: formData.ciudad_base.trim() || null,
          tipo_camion: formData.tipo_camion || null,
          capacidad: formData.capacidad ? parseFloat(formData.capacidad) : null,
          placa: formData.placa.trim() || null,
          estado: formData.estado,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (updateError) throw updateError

      router.push('/transportistas')
    } catch (err: any) {
      setError(err.message || 'Error al actualizar transportista')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white">Cargando transportista...</div>
      </div>
    )
  }

  if (!transportista) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white">Transportista no encontrado</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Editar Transportista</h1>
          <p className="text-gray-400">Modificar datos del transportista</p>
        </div>
        <Link
          href="/transportistas"
          className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
        >
          ← Volver
        </Link>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-gray-800 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-300">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nombre <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-4 py-2 bg-slate-950 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                placeholder="Ej: Juan Pérez"
              />
            </div>

            {/* Cédula */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Cédula</label>
              <input
                type="text"
                value={formData.cedula}
                onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                className="w-full px-4 py-2 bg-slate-950 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                placeholder="Ej: 1234567890"
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Teléfono</label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="w-full px-4 py-2 bg-slate-950 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                placeholder="Ej: 0991234567"
              />
            </div>

            {/* Ciudad Base */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Ciudad Base</label>
              <input
                type="text"
                value={formData.ciudad_base}
                onChange={(e) => setFormData({ ...formData, ciudad_base: e.target.value })}
                className="w-full px-4 py-2 bg-slate-950 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                placeholder="Ej: Guayaquil"
              />
            </div>

            {/* Tipo Camión */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tipo Camión</label>
              <select
                value={formData.tipo_camion}
                onChange={(e) => setFormData({ ...formData, tipo_camion: e.target.value })}
                className="w-full px-4 py-2 bg-slate-950 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
              >
                <option value="">Seleccionar tipo</option>
                {TIPOS_CAMION.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>

            {/* Capacidad */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Capacidad (toneladas)</label>
              <input
                type="number"
                step="0.01"
                value={formData.capacidad}
                onChange={(e) => setFormData({ ...formData, capacidad: e.target.value })}
                className="w-full px-4 py-2 bg-slate-950 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                placeholder="Ej: 10.5"
              />
            </div>

            {/* Placa */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Placa</label>
              <input
                type="text"
                value={formData.placa}
                onChange={(e) => setFormData({ ...formData, placa: e.target.value })}
                className="w-full px-4 py-2 bg-slate-950 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                placeholder="Ej: ABC-1234"
              />
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Estado</label>
              <select
                value={formData.estado ? 'activo' : 'inactivo'}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value === 'activo' })}
                className="w-full px-4 py-2 bg-slate-950 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-800">
            <Link
              href="/transportistas"
              className="px-6 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-[#F97316] hover:bg-[#EA6A0C] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Guardando...' : 'Actualizar Transportista'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
