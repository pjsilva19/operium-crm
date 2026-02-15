'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/Logo'

export default function RegisterPage() {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Verificar si el email es el usuario master designado
      const isMasterEmail = email.toLowerCase() === 'presleysb@operium-logistica.com'
      
      // Verificar si ya existe un master
      const { data: existingMasters } = await supabase
        .from('profiles')
        .select('id')
        .eq('rol', 'master')
        .limit(1)

      const hasMaster = existingMasters && existingMasters.length > 0

      // Solo permitir crear master si es el email designado Y no existe ningún master
      const canBeMaster = isMasterEmail && !hasMaster

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre,
          },
        },
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Error al crear usuario')

      // El trigger automáticamente crea el profile, pero lo actualizamos con los datos correctos
      // Esperar un momento para que el trigger se ejecute
      await new Promise(resolve => setTimeout(resolve, 500))

      // Actualizar el profile (el trigger ya lo creó)
      // Los usuarios registrados desde /register siempre serán 'pending' a menos que sean el master designado
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          nombre,
          email,
          rol: canBeMaster ? 'master' : 'pending',
          approved: canBeMaster, // Solo el master designado se aprueba automáticamente
          sucursal_id: null,
        })
        .eq('id', authData.user.id)

      // Si falla actualizar (porque el trigger aún no creó el profile), intentar insertar
      if (profileError) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            nombre,
            email,
            rol: canBeMaster ? 'master' : 'pending',
            approved: canBeMaster,
            sucursal_id: null,
          })

        if (insertError) {
          console.error('Error creating/updating profile:', insertError)
          // No lanzar error aquí, el trigger debería haberlo creado
        }
      }

      setSuccess(true)
      
      setTimeout(() => {
        if (isFirstUser) {
          router.push('/dashboard')
        } else {
          router.push('/pending')
        }
        router.refresh()
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A] px-4">
        <div className="w-full max-w-md">
          <div className="bg-[#1E293B] rounded-2xl p-8 shadow-xl text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-white mb-4">¡Registro Exitoso!</h2>
            <p className="text-gray-400">
              Tu solicitud fue enviada. Pendiente de aprobación.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo size="lg" className="justify-center" />
        </div>

        <div className="bg-[#1E293B] rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-semibold text-white mb-6">Crear Cuenta</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-300 mb-2">
                Nombre Completo
              </label>
              <input
                id="nombre"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="w-full px-4 py-2 bg-[#0F172A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                placeholder="Juan Pérez"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 bg-[#0F172A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 bg-[#0F172A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#F97316] hover:bg-[#EA6A0C] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creando cuenta...' : 'Registrarse'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-[#F97316] hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
