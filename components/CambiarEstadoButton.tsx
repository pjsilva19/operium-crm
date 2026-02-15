'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface CambiarEstadoButtonProps {
  viajeId: string
  estadoActual: string
}

export default function CambiarEstadoButton({ viajeId, estadoActual }: CambiarEstadoButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const estados = [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'asignado', label: 'Asignado' },
    { value: 'en_ruta', label: 'En Ruta' },
    { value: 'entregado', label: 'Entregado' },
    { value: 'cancelado', label: 'Cancelado' },
  ]

  const handleChangeEstado = async (nuevoEstado: string) => {
    if (nuevoEstado === estadoActual) {
      setShowMenu(false)
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/viajes/${viajeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al cambiar estado')
      }

      router.refresh()
      setShowMenu(false)
    } catch (error: any) {
      alert(error.message || 'Error al cambiar estado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={loading}
        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
      >
        Cambiar Estado
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-gray-800 rounded-lg shadow-xl z-20">
            {estados.map((estado) => (
              <button
                key={estado.value}
                onClick={() => handleChangeEstado(estado.value)}
                disabled={loading || estado.value === estadoActual}
                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                  estado.value === estadoActual
                    ? 'bg-[#F97316] text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {estado.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
