'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ForceApprovePage() {
  const router = useRouter()
  const supabase = createClient()
  const [status, setStatus] = useState('Verificando...')

  useEffect(() => {
    const forceApprove = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setStatus('No autenticado')
          setTimeout(() => router.push('/login'), 2000)
          return
        }

        // Get profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('rol, approved')
          .eq('id', user.id)
          .single()

        if (!profile) {
          setStatus('No se encontró perfil')
          return
        }

        if (profile.rol === 'master') {
          // Force approve
          const { error } = await supabase
            .from('profiles')
            .update({ approved: true })
            .eq('id', user.id)

          if (error) {
            setStatus(`Error: ${error.message}`)
          } else {
            setStatus('¡Aprobado! Redirigiendo...')
            setTimeout(() => {
              window.location.href = '/dashboard'
            }, 1000)
          }
        } else {
          setStatus('No eres usuario master')
        }
      } catch (err: any) {
        setStatus(`Error: ${err.message}`)
      }
    }

    forceApprove()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] px-4">
      <div className="bg-[#1E293B] rounded-2xl p-8 text-center max-w-md">
        <h2 className="text-2xl font-semibold text-white mb-4">Forzar Aprobación</h2>
        <p className="text-gray-400">{status}</p>
      </div>
    </div>
  )
}
