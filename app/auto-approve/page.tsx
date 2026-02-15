import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic'

export default async function AutoApprovePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Check if user is master
  const { data: profile } = await supabase
    .from('profiles')
    .select('rol, approved')
    .eq('id', user.id)
    .single()

  if (profile?.rol === 'master') {
    // Auto-approve master user
    const { error } = await supabase
      .from('profiles')
      .update({ approved: true })
      .eq('id', user.id)

    if (!error) {
      redirect('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] px-4">
      <div className="bg-[#1E293B] rounded-2xl p-8 text-center max-w-md">
        <h2 className="text-2xl font-semibold text-white mb-4">Auto-Aprobación</h2>
        {profile?.rol === 'master' ? (
          <p className="text-gray-400">Tu cuenta ha sido aprobada. Redirigiendo...</p>
        ) : (
          <p className="text-gray-400">Solo usuarios master pueden usar esta función.</p>
        )}
      </div>
    </div>
  )
}
