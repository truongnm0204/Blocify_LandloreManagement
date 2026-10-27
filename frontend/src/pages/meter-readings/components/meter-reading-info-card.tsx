interface InfoRow {
  label: string
  value: string
  bold?: boolean
  blue?: boolean
  large?: boolean
  dividerBefore?: boolean
}

interface MeterReadingInfoCardProps {
  title: string
  icon?: React.ReactNode
  rows: InfoRow[]
}

export function MeterReadingInfoCard({ title, icon, rows }: MeterReadingInfoCardProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
      <div className="mb-4 flex items-center gap-3">
        {icon && (
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full">
            {icon}
          </div>
        )}
        <h4 className="text-sm font-semibold text-[#323235]">{title}</h4>
      </div>
      <div className="divide-y divide-gray-100">
        {rows.map((row, idx) => (
          <div key={idx}>
            {row.dividerBefore && <div className="my-1 border-t border-dashed border-gray-200" />}
            <div className="flex items-center justify-between py-2.5">
              <span className="text-sm text-[#7b7a7d]">{row.label}</span>
              <span
                className={[
                  row.large ? 'text-lg' : 'text-sm',
                  row.bold ? 'font-semibold' : 'font-medium',
                  row.blue ? 'text-[#1d5fa8]' : 'text-[#323235]',
                ].join(' ')}
              >
                {row.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
