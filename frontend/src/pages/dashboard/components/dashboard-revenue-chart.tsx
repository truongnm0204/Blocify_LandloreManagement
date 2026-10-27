import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useRevenueTrend } from '@/hooks/use-dashboard'

interface TooltipProps {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-3 shadow-lg">
      <p className="mb-1 text-xs font-semibold text-[#323235]">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-xs" style={{ color: entry.color }}>
          {entry.name}: {new Intl.NumberFormat('vi-VN').format(entry.value)} d
        </p>
      ))}
    </div>
  )
}

interface Props {
  months: number
  motelId?: string
}

export function DashboardRevenueChart({ months, motelId }: Props) {
  const { data: trendData, isLoading } = useRevenueTrend(months, motelId)

  return (
    <div className="flex-1 rounded-xl bg-white p-5 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-[#323235]">Doanh thu theo thang</h3>
        <p className="mt-0.5 text-xs text-[#7b7a7d]">
          Phan tich doanh thu va chi phi {months} thang
        </p>
      </div>

      {/* Legend */}
      <div className="mb-4 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-[#1d5fa8]" />
          <span className="text-xs text-[#7b7a7d]">Thu</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-[#93c5fd]" />
          <span className="text-xs text-[#7b7a7d]">Chi</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-[240px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1d5fa8] border-t-transparent" />
        </div>
      ) : !trendData || trendData.length === 0 ? (
        <div className="flex h-[240px] items-center justify-center">
          <p className="text-sm text-[#7b7a7d]">Chua co du lieu doanh thu</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={trendData} barGap={4} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#7b7a7d' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#7b7a7d' }}
              tickFormatter={(v: number) =>
                v >= 1_000_000 ? `${(v / 1_000_000).toFixed(0)}tr` : `${v}`
              }
              width={52}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f5f6fa' }} />
            <Bar dataKey="revenue" name="Thu" fill="#1d5fa8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" name="Chi" fill="#93c5fd" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
