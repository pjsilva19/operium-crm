interface KpiCardProps {
  title: string
  value: string | number
  icon: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

export default function KpiCard({ title, value, icon, trend }: KpiCardProps) {
  return (
    <div className="bg-[#1E293B] rounded-lg p-2 border border-gray-800 hover:border-[#F97316]/50 transition-all shadow-lg">
      <div className="flex items-center justify-center mb-1">
        <div className="text-2xl leading-none filter drop-shadow-lg relative">
          <span className="block" style={{ fontFeatureSettings: 'normal' }}>{icon}</span>
        </div>
        {trend && (
          <div
            className={`text-xs font-medium ml-2 ${
              trend.isPositive ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <h3 className="text-xs font-medium text-gray-300 mb-1 leading-tight text-center">{title}</h3>
      <p className="text-lg font-bold text-white leading-none text-center">{value}</p>
    </div>
  )
}
