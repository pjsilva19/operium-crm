'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Cliente } from '@/lib/supabase/types'
import ClienteModal from '@/components/ClienteModal'

export default function ClientesPage() {
  const supabase = createClient()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null)
  const [deletingCliente, setDeletingCliente] = useState<Cliente | null>(null)
  const [userSucursalId, setUserSucursalId] = useState<string | null>(null)

  useEffect(() => {
    loadClientes()
    loadUserSucursal()
  }, [])

  useEffect(() => {
    // Escuchar evento del sidebar para abrir modal
    const handleOpenModal = () => {
      setEditingCliente(null)
      setIsModalOpen(true)
    }
    window.addEventListener('openClienteModal', handleOpenModal)

    return () => {
      window.removeEventListener('openClienteModal', handleOpenModal)
    }
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredClientes(clientes)
    } else {
      const term = searchTerm.toLowerCase()
      const filtered = clientes.filter(
        (cliente) =>
          cliente.nombre_comercial?.toLowerCase().includes(term) ||
          cliente.razon_social?.toLowerCase().includes(term) ||
          cliente.ruc_ci?.toLowerCase().includes(term) ||
          cliente.telefono?.toLowerCase().includes(term) ||
          cliente.email?.toLowerCase().includes(term)
      )
      setFilteredClientes(filtered)
    }
  }, [searchTerm, clientes])

  const loadUserSucursal = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('sucursal_id, rol')
      .eq('id', user.id)
      .single()

    if (profile?.sucursal_id) {
      setUserSucursalId(profile.sucursal_id)
    }
  }

  const loadClientes = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('sucursal_id, rol')
        .eq('id', user.id)
        .single()

      let query = supabase
        .from('clientes')
        .select('*')
        .eq('aprobado', true) // Solo mostrar clientes aprobados para todos
        .order('created_at', { ascending: false })

      // Filtrar por sucursal si no es master
      if (profile?.rol !== 'master' && profile?.sucursal_id) {
        query = query.eq('sucursal_id', profile.sucursal_id)
      }

      const { data, error } = await query

      if (error) throw error
      setClientes(data || [])
      setFilteredClientes(data || [])
    } catch (error) {
      console.error('Error loading clientes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingCliente(null)
    setIsModalOpen(true)
  }

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente)
    setIsModalOpen(true)
  }

  const handleDelete = async (cliente: Cliente) => {
    if (!confirm(`¿Estás seguro de eliminar el cliente "${cliente.nombre_comercial}"?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', cliente.id)

      if (error) throw error
      await loadClientes()
    } catch (error) {
      console.error('Error deleting cliente:', error)
      alert('Error al eliminar el cliente')
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingCliente(null)
  }

  const handleModalSuccess = async () => {
    await loadClientes()
    setIsModalOpen(false)
    setEditingCliente(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white">Cargando clientes...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Clientes</h1>
          <p className="text-gray-400">Gestión de clientes</p>
        </div>
      </div>

      {/* Buscador */}
      <div className="bg-[#1E293B] rounded-lg border border-gray-800 p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por nombre comercial, razón social, RUC/CI, teléfono o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-10 bg-[#0F172A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
          />
          <span className="absolute left-3 top-3.5 text-gray-500">🔍</span>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-[#1E293B] rounded-2xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Nombre Comercial
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Razón Social
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  RUC/CI
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Ciudad
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
              {filteredClientes.length > 0 ? (
                filteredClientes.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-gray-800/30">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{cliente.nombre_comercial}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300">{cliente.razon_social}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{cliente.ruc_ci || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{cliente.telefono || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{cliente.email || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{cliente.ciudad || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`text-xs px-2 py-1 rounded border ${
                          cliente.activo
                            ? 'bg-green-500/20 text-green-400 border-green-500/50'
                            : 'bg-gray-500/20 text-gray-400 border-gray-500/50'
                        }`}
                      >
                        {cliente.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(cliente)}
                        className="text-blue-400 hover:text-blue-300 mr-4"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(cliente)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <p className="text-gray-400">
                        {searchTerm ? 'No se encontraron clientes' : 'No hay clientes registrados'}
                      </p>
                      {!searchTerm && (
                        <button
                          onClick={handleCreate}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-[#F97316] hover:bg-[#EA6A0C] text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl"
                        >
                          <span className="text-xl">+</span>
                          <span>Agregar Primer Cliente</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <ClienteModal
          cliente={editingCliente}
          sucursalId={userSucursalId}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  )
}
