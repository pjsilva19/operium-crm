import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'

export default async function CheckProfilePage() {
  const session = await requireAuth()
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] px-4">
      <div className="bg-[#1E293B] rounded-2xl p-8 max-w-2xl w-full">
        <h1 className="text-2xl font-bold text-white mb-6">Estado de tu Perfil</h1>
        
        {profile ? (
          <div className="space-y-4">
            <div>
              <span className="text-gray-400">Email:</span>
              <p className="text-white font-medium">{profile.email}</p>
            </div>
            <div>
              <span className="text-gray-400">Nombre:</span>
              <p className="text-white font-medium">{profile.nombre || 'Sin nombre'}</p>
            </div>
            <div>
              <span className="text-gray-400">Rol:</span>
              <p className="text-white font-medium">{profile.rol}</p>
            </div>
            <div>
              <span className="text-gray-400">Aprobado:</span>
              <p className={`font-medium ${profile.approved ? 'text-green-400' : 'text-red-400'}`}>
                {profile.approved ? 'Sí' : 'No'}
              </p>
            </div>
            
            {profile.rol === 'master' && !profile.approved && (
              <div className="mt-6 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
                <p className="text-yellow-400 mb-4">
                  Eres master pero no estás aprobado. Ejecuta este SQL en Supabase:
                </p>
                <code className="block bg-[#0F172A] p-3 rounded text-sm text-gray-300">
                  UPDATE profiles SET approved = true WHERE id = '{profile.id}';
                </code>
              </div>
            )}
          </div>
        ) : (
          <p className="text-red-400">No se encontró perfil</p>
        )}
      </div>
    </div>
  )
}
