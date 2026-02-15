'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface DeleteTransportistaButtonProps {
  transportistaId: string
  transportistaNombre: string
  isMaster: boolean
}

export default function DeleteTransportistaButton({
  transportistaId,
  transportistaNombre,
  isMaster,
}: DeleteTransportistaButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  if (!isMaster) {
    return null
  }

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de eliminar el transportista "${transportistaNombre}"?`)) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/transportistas/${transportistaId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al eliminar transportista')
      }

      router.refresh()
    } catch (error: any) {
      console.error('Error deleting transportista:', error)
      alert(error.message || 'Error al eliminar el transportista')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isDeleting ? 'Eliminando...' : 'Eliminar'}
    </button>
  )
}
