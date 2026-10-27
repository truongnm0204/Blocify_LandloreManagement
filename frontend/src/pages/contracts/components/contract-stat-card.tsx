import type { ReactNode } from 'react'

interface ContractStatCardProps {
  icon: ReactNode
  iconBg: string
  label: string
  value: number
  badge?: string
  badgeBg?: string
  badgeColor?: string
  subtitle?: string
}

export function ContractStatCard({
  icon,
  iconBg,
  label,
  value,
  badge,
  badgeBg = '#d5e3ff',
  badgeColor = '#004c6e',
  subtitle,
}: ContractStatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: iconBg }}
      >
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm text-[#7b7a7d]">{label}</p>
        <p className="text-2xl font-semibold text-[#323235]">{value}</p>
        {subtitle && <p className="text-xs text-[#7b7a7d]">{subtitle}</p>}
      </div>
      {badge && (
        <span
          className="rounded-full px-2.5 py-0.5 text-xs font-medium"
          style={{ backgroundColor: badgeBg, color: badgeColor }}
        >
          {badge}
        </span>
      )}
    </div>
  )
}
