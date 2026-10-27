import type { ReactNode } from 'react'

interface MeterReadingStatCardProps {
  label: string
  value: string
  subtitle?: string
  subtitlePositive?: boolean
  icon?: ReactNode
  dark?: boolean
}

export function MeterReadingStatCard({
  label,
  value,
  subtitle,
  subtitlePositive,
  icon,
  dark = false,
}: MeterReadingStatCardProps) {
  if (dark) {
    return (
      <div className="flex flex-col justify-between rounded-xl bg-[#1d5fa8] p-5 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
        <p className="text-sm text-blue-200">{label}</p>
        <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
        {subtitle && <p className="mt-1 text-xs text-blue-200">{subtitle}</p>}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
      {icon && (
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#c8e6ff]">
          {icon}
        </div>
      )}
      <div className="flex-1">
        <p className="text-sm text-[#7b7a7d]">{label}</p>
        <p className="text-2xl font-semibold text-[#323235]">{value}</p>
        {subtitle && (
          <p
            className={`mt-0.5 text-xs font-medium ${
              subtitlePositive ? 'text-green-600' : 'text-red-500'
            }`}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}
