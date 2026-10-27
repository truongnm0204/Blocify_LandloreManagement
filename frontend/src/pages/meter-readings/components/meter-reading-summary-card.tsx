interface SummaryRow {
  label: string
  value: string
  dividerBefore?: boolean
  large?: boolean
}

interface MeterReadingSummaryCardProps {
  title: string
  rows: SummaryRow[]
}

export function MeterReadingSummaryCard({ title, rows }: MeterReadingSummaryCardProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
      <h4 className="mb-4 text-sm font-semibold text-[#323235]">{title}</h4>
      <div>
        {rows.map((row, idx) => (
          <div key={idx}>
            {row.dividerBefore && <div className="my-1 border-t border-gray-200" />}
            <div className="flex items-center justify-between py-2.5">
              <span className="text-sm text-[#7b7a7d]">{row.label}</span>
              <span
                className={[
                  row.large ? 'text-xl font-bold text-[#1d5fa8]' : 'text-sm font-medium text-[#323235]',
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
