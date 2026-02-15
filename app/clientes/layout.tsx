import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import { requireApprovedUser } from '@/lib/auth'
import { getPendientesCount } from '@/lib/aprobaciones'

export default async function ClientesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { profile } = await requireApprovedUser()
  const pendientesCount = profile?.rol === 'master' ? await getPendientesCount() : 0

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <Sidebar profile={profile} pendientesCount={pendientesCount} />
      <Topbar />
      <main className="ml-64 mt-16 pl-8 pr-6 py-6" style={{ position: 'relative', zIndex: 10, marginLeft: '16rem' }}>{children}</main>
    </div>
  )
}
