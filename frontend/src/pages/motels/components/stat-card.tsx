import { Building2, DoorOpen, TrendingUp } from 'lucide-react'
import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string | number
  icon: 'building' | 'room' | 'trending'
  badgeText?: string
  badgeColor?: string
}

const iconMap: Record<StatCardProps['icon'], ReactNode> = {
  building: <Building2 className="h-5 w-5 text-[#004c6e]" />,
  room: <DoorOpen className="h-5 w-5 text-[#004c6e]" />,
  trending: <TrendingUp className="h-5 w-5 text-[#004c6e]" />,
}

export function StatCard({ label, value, icon, badgeText, badgeColor = '#d5e3ff' }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#c8e6ff]">
        {iconMap[icon]}
      </div>
      <div className="flex-1">
        <p className="text-sm text-[#7b7a7d]">{label}</p>
        <p className="text-2xl font-semibold text-[#323235]">{value}</p>
      </div>
      {badgeText && (
        <span
          className="rounded-full px-2.5 py-0.5 text-xs font-medium"
          style={{ backgroundColor: badgeColor, color: '#004c6e' }}
        >
          {badgeText}
        </span>
      )}
    </div>
  )
}
