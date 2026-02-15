'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Sucursal } from '@/lib/supabase/types'
import Link from 'next/link'

const TIPOS_CAMION = [
  'Camión pequeño',
  'Camión mediano',
  'Camión grande',
  'Tractocamión',
  'Furgón',
  'Otro',
]

export default function NuevoTransportistaPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [sucursales, setSucursales] = useState<Array<{ id: string; codigo: string; nombre: string }>>([])
  const [userProfile, setUserProfile] = useState<{ rol: string; sucursal_id: string | null } | null>(null)

  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    telefono: '',
    ciudad_base: '',
    tipo_camion: '',
    capacidad: '',
    placa: '',
    estado: true,
    sucursal_codigo: '',
  })

  useEffect(() => {
    loadSucursales()
  }, [])

  const loadSucursales = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('sucursal_id, rol')
        .eq('id', user.id)
        .single()

      setUserProfile(profile)

      // Cargar todas las sucursales
      const { data: sucursalesData } = await supabase
        .from('sucursales')
        .select('id, codigo, nombre')
        .order('nombre')

      if (sucursalesData) {
        setSucursales(sucursalesData)
        
        // Si no es master y tiene sucursal, establecerla por defecto
        if (profile?.rol !== 'master' && profile?.sucursal_id) {
          const sucursalUsuario = sucursalesData.find((s: Sucursal) => s.id === profile.sucursal_id)
          if (sucursalUsuario) {
            setFormData(prev => ({ ...prev, sucursal_codigo: sucursalUsuario.codigo }))
          }
        } else if (profile?.rol === 'master' && sucursalesData.length > 0) {
          // Master: usar la primera sucursal por defecto
          setFormData(prev => ({ ...prev, sucursal_codigo: sucursalesData[0].codigo }))
        }
      }
    } catch (error) {
      console.error('Error loading sucursales:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validar nombre obligatorio
      if (!formData.nombre.trim()) {
        throw new Error('El nombre es requerido')
      }

      // Validar que se haya seleccionado una sucursal
      if (!formData.sucursal_codigo) {
        throw new Error('Debes seleccionar una sucursal')
      }

      // Insertar transportista
      const { error: insertError } = await supabase.from('transportistas').insert({
        nombre: formData.nombre.trim(),
        cedula: formData.cedula.trim() || null,
        telefono: formData.telefono.trim() || null,
        ciudad_base: formData.ciudad_base.trim() || null,
        tipo_camion: formData.tipo_camion || null,
        capacidad: formData.capacidad ? parseFloat(formData.capacidad) : null,
        placa: formData.placa.trim() || null,
        estado: formData.estado,
        sucursal_codigo: formData.sucursal_codigo,
      })

      if (insertError) throw insertError

      // Mostrar toast y redirigir
      setShowToast(true)
      setTimeout(() => {
        router.push('/transportistas')
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Error al crear transportista')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Nuevo Transportista</h1>
          <p className="text-gray-400">Registrar nuevo transportista</p>
        </div>
        <Link
          href="/transportistas"
          className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
        >
          ← Volver
        </Link>
      </div>

      {/* Toast de éxito */}
      {showToast && (
        <div className="fixed top-20 right-8 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-in slide-in-from-top">
          ✓ Transportista creado exitosamente
        </div>
      )}

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

            {/* Sucursal - Solo visible para master o si hay múltiples opciones */}
            {userProfile?.rol === 'master' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Sucursal <span className="text-red-400">*</span>
                </label>
                <select
                  required
                  value={formData.sucursal_codigo}
                  onChange={(e) => setFormData({ ...formData, sucursal_codigo: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-950 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                >
                  <option value="">Seleccionar sucursal</option>
                  {sucursales.map((sucursal) => (
                    <option key={sucursal.id} value={sucursal.codigo}>
                      {sucursal.nombre} ({sucursal.codigo})
                    </option>
                  ))}
                </select>
              </div>
            )}
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
              disabled={loading}
              className="px-6 py-2 bg-[#F97316] hover:bg-[#EA6A0C] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : 'Crear Transportista'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
