import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import { requireApprovedUser } from '@/lib/auth'
import { getPendientesCount } from '@/lib/aprobaciones'
import { ReactNode } from 'react'

export default async function AprobacionesLayout({
  children,
}: {
  children: ReactNode
}) {
  const { profile } = await requireApprovedUser()
  const pendientesCount = profile?.rol === 'master' ? await getPendientesCount() : 0

  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar profile={profile} pendientesCount={pendientesCount} />
      <Topbar />
      <main className="ml-64 mt-16 pl-8 pr-6 py-6" style={{ position: 'relative', zIndex: 10, marginLeft: '16rem' }}>
        {children}
      </main>
    </div>
  )
}
