'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import type { Profile, Sucursal } from '@/lib/supabase/types'
import CreateUserModal from './CreateUserModal'

interface UserManagementProps {
  initialProfiles: (Profile & { sucursales?: { codigo: string; nombre: string } })[]
  sucursales: Sucursal[]
}

export default function UserManagement({ initialProfiles, sucursales }: UserManagementProps) {
  const [profiles, setProfiles] = useState(initialProfiles)
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Escuchar evento del sidebar para abrir modal
  useEffect(() => {
    const handleOpenModal = () => {
      setIsCreateModalOpen(true)
    }

    window.addEventListener('openUsuarioModal', handleOpenModal)
    return () => {
      window.removeEventListener('openUsuarioModal', handleOpenModal)
    }
  }, [])

  const handleApprove = async (profileId: string, approved: boolean) => {
    setLoading(profileId)
    setError(null)

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ approved })
        .eq('id', profileId)

      if (updateError) throw updateError

      setProfiles((prev) =>
        prev.map((p) => (p.id === profileId ? { ...p, approved } : p))
      )
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Error al actualizar usuario')
    } finally {
      setLoading(null)
    }
  }

  const handleUpdateRole = async (profileId: string, rol: string) => {
    setLoading(profileId)
    setError(null)

    try {
      // Verificar que solo masters puedan asignar rol master
      if (rol === 'master') {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: currentProfile } = await supabase
            .from('profiles')
            .select('rol')
            .eq('id', user.id)
            .single()

          if (!currentProfile || currentProfile.rol !== 'master') {
            setError('Solo usuarios master pueden asignar el rol master.')
            setLoading(null)
            return
          }
        }
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ rol })
        .eq('id', profileId)

      if (updateError) throw updateError

      setProfiles((prev) =>
        prev.map((p) => (p.id === profileId ? { ...p, rol: rol as any } : p))
      )
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Error al actualizar rol')
    } finally {
      setLoading(null)
    }
  }

  const handleUpdateSucursal = async (profileId: string, sucursalId: string | null) => {
    setLoading(profileId)
    setError(null)

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ sucursal_id: sucursalId })
        .eq('id', profileId)

      if (updateError) throw updateError

      setProfiles((prev) =>
        prev.map((p) => (p.id === profileId ? { ...p, sucursal_id: sucursalId } : p))
      )
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Error al actualizar sucursal')
    } finally {
      setLoading(null)
    }
  }

  const pendingProfiles = profiles.filter((p) => !p.approved)
  const approvedProfiles = profiles.filter((p) => p.approved)

  const rolLabels: Record<string, string> = {
    master: '👑 Master',
    admin: '🔧 Admin',
    ops: '📊 Operaciones',
    sales: '💼 Ventas',
    founder: '🚀 Founder',
    pending: '⏳ Pendiente',
  }

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Pending Users */}
      {pendingProfiles.length > 0 && (
        <div className="bg-[#1E293B] rounded-2xl border border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-800 bg-yellow-500/10">
            <h2 className="text-lg font-semibold text-white">
              Usuarios Pendientes ({pendingProfiles.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Sucursal
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {pendingProfiles.map((profile) => (
                  <tr key={profile.id} className="hover:bg-gray-800/30">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-white">
                        {profile.nombre || 'Sin nombre'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300">{profile.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={profile.rol}
                        onChange={(e) => handleUpdateRole(profile.id, e.target.value)}
                        disabled={loading === profile.id}
                        className="px-3 py-1 bg-[#0F172A] border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                      >
                        <option value="admin">Admin</option>
                        <option value="ops">Operaciones</option>
                        <option value="sales">Ventas</option>
                        <option value="founder">Founder</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={profile.sucursal_id || ''}
                        onChange={(e) =>
                          handleUpdateSucursal(profile.id, e.target.value || null)
                        }
                        disabled={loading === profile.id}
                        className="px-3 py-1 bg-[#0F172A] border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                      >
                        <option value="">Sin sucursal</option>
                        {sucursales.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.codigo} - {s.nombre}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleApprove(profile.id, true)}
                        disabled={loading === profile.id}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                      >
                        Aprobar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Approved Users */}
      <div className="bg-[#1E293B] rounded-2xl border border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">
            Usuarios Aprobados ({approvedProfiles.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Sucursal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Registrado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {approvedProfiles.map((profile) => (
                <tr key={profile.id} className="hover:bg-gray-800/30">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-white">
                      {profile.nombre || 'Sin nombre'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-300">{profile.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded border border-blue-500/50">
                      {rolLabels[profile.rol] || profile.rol}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-300">
                      {profile.sucursales
                        ? `${profile.sucursales.codigo} - ${profile.sucursales.nombre}`
                        : 'Sin sucursal'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-400">{formatDate(profile.created_at)}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <select
                        value={profile.rol}
                        onChange={(e) => handleUpdateRole(profile.id, e.target.value)}
                        disabled={loading === profile.id}
                        className="px-3 py-1 bg-[#0F172A] border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                      >
                        <option value="master">Master</option>
                        <option value="admin">Admin</option>
                        <option value="ops">Operaciones</option>
                        <option value="sales">Ventas</option>
                        <option value="founder">Founder</option>
                        <option value="pending">Pendiente</option>
                      </select>
                      <select
                        value={profile.sucursal_id || ''}
                        onChange={(e) =>
                          handleUpdateSucursal(profile.id, e.target.value || null)
                        }
                        disabled={loading === profile.id}
                        className="px-3 py-1 bg-[#0F172A] border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                      >
                        <option value="">Sin sucursal</option>
                        {sucursales.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.codigo} - {s.nombre}
                          </option>
                        ))}
                      </select>
                      {profile.rol !== 'master' && (
                        <button
                          onClick={() => handleApprove(profile.id, false)}
                          disabled={loading === profile.id}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors disabled:opacity-50"
                        >
                          Desaprobar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de crear usuario */}
      {isCreateModalOpen && (
        <CreateUserModal
          sucursales={sucursales}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  )
}
