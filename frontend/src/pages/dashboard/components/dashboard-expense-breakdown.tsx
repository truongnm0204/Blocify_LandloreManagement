import { useExpenseBreakdown } from '@/hooks/use-dashboard'
import { Zap, Droplets, Settings, AlertCircle, Wrench, Shield, Package, Sparkles } from 'lucide-react'

const categoryConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  ELECTRICITY: { label: 'Dien', color: '#f59e0b', icon: Zap },
  WATER: { label: 'Nuoc', color: '#3b82f6', icon: Droplets },
  SERVICE_FEE: { label: 'Phi dich vu', color: '#8b5cf6', icon: Settings },
  SURCHARGE: { label: 'Phu thu', color: '#ef4444', icon: AlertCircle },
  MAINTENANCE: { label: 'Bao tri / sua chua', color: '#f97316', icon: Wrench },
  UTILITIES: { label: 'Tien ich khac', color: '#06b6d4', icon: Zap },
  SUPPLIES: { label: 'Van phong pham', color: '#84cc16', icon: Package },
  CLEANING: { label: 'Ve sinh', color: '#10b981', icon: Sparkles },
  SECURITY: { label: 'An ninh / bao ve', color: '#6366f1', icon: Shield },
  OTHER: { label: 'Chi phi khac', color: '#6b7280', icon: AlertCircle },
}

interface Props {
  motelId?: string
}

export function DashboardExpenseBreakdown({ motelId }: Props) {
  const { data: expenses, isLoading } = useExpenseBreakdown(motelId)

  return (
    <div className="rounded-xl bg-white p-5 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-[#323235]">Co cau chi phi</h3>
        <p className="mt-0.5 text-xs text-[#7b7a7d]">Thang nay</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : !expenses || expenses.length === 0 ? (
        <p className="py-4 text-center text-sm text-[#7b7a7d]">Chua co du lieu chi phi</p>
      ) : (
        <div className="space-y-3">
          {expenses.map((item) => {
            const config = categoryConfig[item.category] ?? {
              label: item.category,
              color: '#6b7280',
              icon: AlertCircle,
            }
            const Icon = config.icon

            return (
              <div key={item.category} className="flex items-center gap-3">
                <div
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${config.color}15` }}
                >
                  <Icon className="h-4 w-4" style={{ color: config.color }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#323235]">{config.label}</span>
                    <span className="font-medium text-[#323235]">
                      {new Intl.NumberFormat('vi-VN').format(item.amount)} d
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: config.color,
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium text-[#7b7a7d]">{item.percentage}%</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
