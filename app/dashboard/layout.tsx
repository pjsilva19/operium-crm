import Sidebar from "@/components/Sidebar";
import { requireApprovedUser } from "@/lib/auth";
import { getPendientesCount } from "@/lib/aprobaciones";
import { ReactNode } from "react";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { profile } = await requireApprovedUser();
  const pendientesCount = profile?.rol === 'master' ? await getPendientesCount() : 0;

  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar profile={profile} pendientesCount={pendientesCount} />
      <main className="ml-64 p-8 overflow-auto" style={{ position: 'relative', zIndex: 10, marginLeft: '16rem' }}>
        {children}
      </main>
    </div>
  )
}
