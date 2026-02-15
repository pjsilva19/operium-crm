import { getKpis } from '@/lib/kpis'
import { getProfile } from '@/lib/auth'
import KpiCard from '@/components/KpiCard'
import OperationsMap from '@/components/OperationsMap'
import TripList from '@/components/TripList'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const profile = await getProfile()
  const kpis = await getKpis()

  return (
    <div className="space-y-6">
      <div style={{ marginLeft: '0.5cm' }}>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Vista general de operaciones</p>
      </div>

      {/* KPIs */}
      <div className="flex justify-center" style={{ marginTop: '0.5cm' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-4 w-full max-w-4xl">
          <div className="lg:col-span-2">
            <KpiCard
              title="Viajes Activos"
              value={kpis.viajesActivos}
              icon="🚛"
            />
          </div>
          <div className="lg:col-span-2">
            <KpiCard
              title="Viajes para Hoy"
              value={kpis.viajesHoy}
              icon="📅"
            />
          </div>
          <div className="lg:col-span-2">
            <KpiCard
              title="En Ruta"
              value={kpis.enRuta}
              icon="🛣️"
            />
          </div>
          <div className="lg:col-span-2">
            <KpiCard
              title="Entregados Hoy"
              value={kpis.entregadosHoy}
              icon="✅"
            />
          </div>
        </div>
      </div>

      {/* Main Content: Map and Trip List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1" style={{ marginTop: '0.5cm', marginLeft: '0.5cm' }}>
          <TripList />
        </div>
        <div className="lg:col-span-2" style={{ marginTop: '0.5cm' }}>
          <OperationsMap />
        </div>
      </div>
    </div>
  )
}
