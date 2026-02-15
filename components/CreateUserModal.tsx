'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Sucursal } from '@/lib/supabase/types'

interface CreateUserModalProps {
  sucursales: Sucursal[]
  onClose: () => void
  onSuccess: () => void
}

export default function CreateUserModal({ sucursales, onClose, onSuccess }: CreateUserModalProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    rol: 'pending' as 'admin' | 'ops' | 'sales' | 'founder' | 'pending', // 'master' NO está permitido
    sucursal_id: '',
    approved: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validaciones
      if (!formData.nombre.trim()) {
        throw new Error('El nombre es requerido')
      }
      if (!formData.email.trim()) {
        throw new Error('El email es requerido')
      }
      if (!formData.password) {
        throw new Error('La contraseña es requerida')
      }
      if (formData.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres')
      }
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Las contraseñas no coinciden')
      }

      // Llamar a la API route para crear usuario
      const response = await fetch('/api/usuarios/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: formData.nombre.trim(),
          email: formData.email.trim(),
          password: formData.password,
          rol: formData.rol,
          sucursal_id: formData.sucursal_id || null,
          approved: formData.approved,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear usuario')
      }

      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Error al crear usuario')
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
        className="bg-slate-900 rounded-2xl border border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Nuevo Usuario</h2>
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

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 bg-slate-950 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                placeholder="Ej: juan@empresa.com"
              />
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Contraseña <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 bg-slate-950 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                placeholder="Mínimo 6 caracteres"
                minLength={6}
              />
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirmar Contraseña <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-2 bg-slate-950 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                placeholder="Repite la contraseña"
                minLength={6}
              />
            </div>

            {/* Rol */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Rol <span className="text-red-400">*</span>
              </label>
              <select
                required
                value={formData.rol}
                onChange={(e) => setFormData({ ...formData, rol: e.target.value as any })}
                className="w-full px-4 py-2 bg-slate-950 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
              >
                <option value="pending">Pendiente</option>
                <option value="admin">Admin</option>
                <option value="ops">Operaciones</option>
                <option value="sales">Ventas</option>
                <option value="founder">Founder</option>
                <option value="master">Master</option>
              </select>
              <p className="mt-1 text-xs text-gray-400">
                Nota: Solo usuarios master pueden crear otros usuarios master.
              </p>
            </div>

            {/* Sucursal */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Sucursal</label>
              <select
                value={formData.sucursal_id}
                onChange={(e) => setFormData({ ...formData, sucursal_id: e.target.value })}
                className="w-full px-4 py-2 bg-slate-950 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
              >
                <option value="">Sin sucursal</option>
                {sucursales.map((sucursal) => (
                  <option key={sucursal.id} value={sucursal.id}>
                    {sucursal.codigo} - {sucursal.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Aprobado */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.approved}
                  onChange={(e) => setFormData({ ...formData, approved: e.target.checked })}
                  className="w-4 h-4 text-[#F97316] bg-slate-950 border-gray-700 rounded focus:ring-[#F97316]"
                />
                <span className="text-sm text-gray-300">Aprobar usuario automáticamente</span>
              </label>
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
              {loading ? 'Creando...' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
