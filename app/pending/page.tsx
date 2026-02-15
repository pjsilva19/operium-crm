import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Logo from '@/components/Logo'

export default async function PendingPage() {
  const session = await requireAuth()
  const supabase = await createClient()

  let { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('approved, rol, nombre, email')
    .eq('id', session.user.id)
    .single()

  // If profile doesn't exist, create it
  if (!profile && !profileError) {
    const { error: createError } = await supabase
      .from('profiles')
      .insert({
        id: session.user.id,
        email: session.user.email!,
        nombre: session.user.user_metadata?.nombre || null,
        rol: 'pending',
        approved: false,
      })
    
    if (!createError) {
      // Re-fetch the profile
      const { data: newProfile } = await supabase
        .from('profiles')
        .select('approved, rol, nombre, email')
        .eq('id', session.user.id)
        .single()
      profile = newProfile
    }
  }

  // Master users should go to dashboard (and auto-approve if needed)
  if (profile?.rol === 'master') {
    // Auto-approve master if not already approved
    if (!profile.approved) {
      await supabase
        .from('profiles')
        .update({ approved: true })
        .eq('id', session.user.id)
    }
    // Force redirect using headers
    redirect('/dashboard')
  }

  // Approved users should go to dashboard
  if (profile?.approved) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo size="lg" className="justify-center" />
        </div>

        <div className="bg-[#1E293B] rounded-2xl p-8 shadow-xl text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-white mb-4">
            Pendiente de Aprobación
          </h2>

          <p className="text-gray-400 mb-6">
            Hola {profile?.nombre || profile?.email || 'Usuario'},
          </p>

          {/* Debug info - remover después */}
          {profileError && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-xs text-red-300 text-left">
              <p className="font-semibold">Error: {profileError.message}</p>
              <p className="mt-2">Si ves "infinite recursion", ejecuta el SQL de corrección en Supabase.</p>
            </div>
          )}

          {/* Force approve button for master */}
          {profile?.rol === 'master' && !profile.approved && (
            <form action="/auth/force-approve-now" method="post" className="mb-4">
              <button
                type="submit"
                className="w-full px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                ⚠️ Aprobar Ahora (Master sin aprobación)
              </button>
            </form>
          )}

          {profile?.rol === 'master' || profile?.approved ? (
            <>
              <p className="text-green-400 mb-6 font-semibold">
                ¡Tu cuenta está aprobada! Redirigiendo...
              </p>
              <div className="space-y-3 mb-4">
                <a
                  href="/bypass-pending"
                  className="block px-6 py-2 bg-[#F97316] hover:bg-[#EA6A0C] text-white font-medium rounded-lg transition-colors"
                >
                  Ir al Dashboard Ahora
                </a>
                <a
                  href="/dashboard"
                  className="block px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                >
                  Dashboard Directo
                </a>
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-400 mb-8">
                Tu solicitud de acceso ha sido enviada y está pendiente de aprobación por un administrador.
                Te notificaremos cuando tu cuenta sea aprobada.
              </p>
            </>
          )}

          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
            >
              Cerrar Sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
