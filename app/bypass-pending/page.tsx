'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function BypassPendingPage() {
  const router = useRouter()
  const [status, setStatus] = useState('Verificando...')

  useEffect(() => {
    const checkAndRedirect = async () => {
      // Dynamically import to avoid build-time evaluation
      const { createClient } = await import('@/lib/supabase/client')
      
      // Check if environment variables are available
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        setStatus('Error: Variables de entorno no configuradas')
        return
      }

      try {
        const supabase = createClient()
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
