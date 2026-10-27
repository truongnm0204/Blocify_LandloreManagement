interface GrowthDataPoint {
  month: string
  electricity: number
  water: number
}

interface MeterReadingGrowthChartProps {
  data: GrowthDataPoint[]
}

// Blue gradient: lightest for oldest, darkest for most recent
const BLUE_SHADES = ['#BFDBFE', '#93C5FD', '#60A5FA', '#3B82F6', '#2563EB', '#1D4ED8']

function getBarColor(index: number, total: number): string {
  if (total <= 1) return '#2563EB'
  const shadeIndex = Math.round((index / (total - 1)) * (BLUE_SHADES.length - 1))
  return BLUE_SHADES[shadeIndex]
}

export function MeterReadingGrowthChart({ data }: MeterReadingGrowthChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-sm text-[#7b7a7d]">Chua co du lieu tang truong.</p>
      </div>
    )
  }

  const allValues = data.flatMap((d) => [d.electricity, d.water])
  const maxValue = Math.max(...allValues, 1)

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#323235]">Tang truong tieu thu</h3>
        <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
          6 thang
        </span>
      </div>

      {/* Legend */}
      <div className="mb-4 flex items-center gap-4 text-xs text-[#7b7a7d]">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-[#2563EB]" />
          Dien (kWh)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-[#BFDBFE]" />
          Nuoc (m3)
        </span>
      </div>

      {/* Chart bars */}
      <div className="flex items-end gap-1.5" style={{ height: '120px' }}>
        {data.map((point, idx) => {
          const elecHeight = Math.max((point.electricity / maxValue) * 100, 2)
          const waterHeight = Math.max((point.water / maxValue) * 100, 2)
          const color = getBarColor(idx, data.length)

          return (
            <div key={point.month} className="flex flex-1 flex-col items-center gap-0.5">
              {/* Grouped bars */}
              <div className="flex w-full items-end justify-center gap-0.5" style={{ height: '100px' }}>
                {/* Electricity bar */}
                <div
                  className="flex-1 rounded-t-sm transition-all duration-300"
                  style={{
                    height: `${elecHeight}%`,
                    backgroundColor: color,
                    minWidth: '6px',
                  }}
                  title={`${point.month}: ${point.electricity} kWh`}
                />
                {/* Water bar */}
                <div
                  className="flex-1 rounded-t-sm transition-all duration-300"
                  style={{
                    height: `${waterHeight}%`,
                    backgroundColor: '#BFDBFE',
                    minWidth: '6px',
                  }}
                  title={`${point.month}: ${point.water} m3`}
                />
              </div>
              {/* X-axis label */}
              <span className="text-[10px] text-[#7b7a7d]">{point.month}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
