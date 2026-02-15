'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface DeleteViajeButtonProps {
  viajeId: string
}

export default function DeleteViajeButton({ viajeId }: DeleteViajeButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/viajes/${viajeId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al eliminar viaje')
      }

      router.push('/viajes')
      router.refresh()
    } catch (error: any) {
      alert(error.message || 'Error al eliminar viaje')
    } finally {
      setLoading(false)
      setShowConfirm(false)
    }
  }

  if (showConfirm) {
    return (
      <div className="flex gap-2">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Eliminando...' : 'Confirmar'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
        >
          Cancelar
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
    >
      Eliminar
    </button>
  )
}
