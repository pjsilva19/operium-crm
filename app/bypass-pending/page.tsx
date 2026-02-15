'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function BypassPendingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [status, setStatus] = useState('Verificando...')

  useEffect(() => {
    const checkAndRedirect = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('rol, approved')
          .eq('id', user.id)
          .single()

        if (error) {
          setStatus(`Error: ${error.message}`)
          return
        }

        if (profile?.rol === 'master' || profile?.approved) {
          setStatus('Redirigiendo al dashboard...')
          // Force hard redirect
          window.location.href = '/dashboard'
        } else {
          setStatus('No estás aprobado. Contacta al administrador.')
        }
      } catch (err: any) {
        setStatus(`Error: ${err.message}`)
      }
    }

    checkAndRedirect()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] px-4">
      <div className="bg-[#1E293B] rounded-2xl p-8 text-center max-w-md">
        <h2 className="text-2xl font-semibold text-white mb-4">Verificando Acceso</h2>
        <p className="text-gray-400">{status}</p>
      </div>
    </div>
  )
}
