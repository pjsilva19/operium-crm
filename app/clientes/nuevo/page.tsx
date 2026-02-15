'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function NuevoClientePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Load user profile and sucursales on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: profile } = await supabase
          .from('profiles')
          .select('sucursal_id, rol')
          .eq('id', user.id)
          .single()

        if (profile?.rol === 'master') {
          setIsMaster(true)
          // Load sucursales for master to select
          const response = await fetch('/api/sucursales')
          if (response.ok) {
            const result = await response.json()
            setSucursales(result.sucursales || [])
            // Set default to first sucursal if available
            if (result.sucursales && result.sucursales.length > 0 && !profile.sucursal_id) {
              setFormData(prev => ({ ...prev, sucursal_id: result.sucursales[0].id }))
            }
          }
        } else if (profile?.sucursal_id) {
          // Non-master users use their assigned sucursal
          setFormData(prev => ({ ...prev, sucursal_id: profile.sucursal_id }))
        }
      } catch (err) {
        console.error('Error loading data:', err)
      }
    }
    
    loadData()
  }, [supabase])

  const [formData, setFormData] = useState({
    nombre: '',
    ruc_ci: '',
    telefono: '',
    email: '',
    direccion: '',
    ciudad: '',
    notas: '',
    sucursal_id: '', // For master users to select
  })
  
  const [sucursales, setSucursales] = useState<any[]>([])
  const [isMaster, setIsMaster] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw new Error(`Error de autenticación: ${userError.message}`)
      if (!user) throw new Error('No autenticado')

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('sucursal_id, rol')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Error al obtener perfil:', profileError)
        throw new Error(`Error al obtener perfil: ${profileError.message}`)
      }

      if (!profile) {
        throw new Error('Perfil no encontrado')
      }

      console.log('Perfil obtenido:', { rol: profile.rol, sucursal_id: profile.sucursal_id })

      // Master users can create clients without sucursal_id, but regular users need it
      if (profile.rol !== 'master' && !profile.sucursal_id) {
        throw new Error('No tienes una sucursal asignada. Contacta al administrador.')
      }

      // Determine sucursal_id
      let sucursalId = profile.sucursal_id || formData.sucursal_id

      if (!sucursalId) {
        throw new Error('Debes seleccionar una sucursal para el cliente')
      }

      console.log('Intentando insertar cliente con sucursal_id:', sucursalId)

      const { data: insertedData, error: insertError } = await supabase
        .from('clientes')
        .insert({
          sucursal_id: sucursalId,
          nombre: formData.nombre.trim(),
          ruc_ci: formData.ruc_ci?.trim() || null,
          telefono: formData.telefono?.trim() || null,
          email: formData.email?.trim() || null,
          direccion: formData.direccion?.trim() || null,
          ciudad: formData.ciudad?.trim() || null,
          notas: formData.notas?.trim() || null,
          activo: true,
        })
        .select()

      if (insertError) {
        console.error('Error al insertar cliente:', insertError)
        throw new Error(`Error al crear cliente: ${insertError.message} (Código: ${insertError.code})`)
      }

      console.log('Cliente creado exitosamente:', insertedData)

      router.push('/clientes')
      router.refresh()
    } catch (err: any) {
      console.error('Error completo:', err)
      setError(err.message || 'Error al crear cliente')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto space-y-6 relative">
      <div>
        <Link
          href="/clientes"
          className="text-gray-400 hover:text-white mb-4 inline-block"
        >
          ← Volver a Clientes
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">Nuevo Cliente</h1>
        <p className="text-gray-400">Registrar un nuevo cliente</p>
      </div>

      <div className="bg-[#1E293B] rounded-2xl border border-gray-800 p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
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
                placeholder="Nombre del cliente"
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
                placeholder="RUC o CI"
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
                placeholder="0999999999"
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
                placeholder="cliente@email.com"
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
                placeholder="Guayaquil"
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
                placeholder="Dirección completa"
              />
            </div>

            {isMaster && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Sucursal *
                </label>
                <select
                  required
                  value={formData.sucursal_id}
                  onChange={(e) => setFormData({ ...formData, sucursal_id: e.target.value })}
                  className="w-full px-4 py-2 bg-[#0F172A] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                >
                  <option value="">Selecciona una sucursal</option>
                  {sucursales.map((suc) => (
                    <option key={suc.id} value={suc.id}>
                      {suc.codigo} — {suc.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}
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
              placeholder="Notas adicionales sobre el cliente"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-[#F97316] hover:bg-[#EA6A0C] text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear Cliente'}
            </button>
            <Link
              href="/clientes"
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
