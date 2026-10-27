interface MeterReadingRevenueDonutProps {
  electricityRevenue: number
  waterRevenue: number
}

const RADIUS = 60
const STROKE = 16
const CX = 80
const CY = 80
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function calcDashArray(fraction: number): string {
  const dash = CIRCUMFERENCE * fraction
  const gap = CIRCUMFERENCE - dash
  return `${dash} ${gap}`
}

export function MeterReadingRevenueDonut({
  electricityRevenue,
  waterRevenue,
}: MeterReadingRevenueDonutProps) {
  const total = electricityRevenue + waterRevenue
  const elecFraction = total > 0 ? electricityRevenue / total : 0.5
  const waterFraction = total > 0 ? waterRevenue / total : 0.5

  const elecDash = calcDashArray(elecFraction)
  // Water arc starts after electricity arc
  const waterOffset = CIRCUMFERENCE * (1 - waterFraction)
  const waterDash = calcDashArray(waterFraction)

  const formattedTotal = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(total)

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-[#323235]">Doanh thu tam tinh</h3>

      <div className="flex items-center gap-6">
        {/* SVG donut */}
        <div className="relative flex-shrink-0">
          <svg width={160} height={160} viewBox="0 0 160 160">
            {/* Track */}
            <circle
              cx={CX}
              cy={CY}
              r={RADIUS}
              fill="none"
              stroke="#E5E7EB"
              strokeWidth={STROKE}
            />
            {/* Electricity arc (yellow) */}
            <circle
              cx={CX}
              cy={CY}
              r={RADIUS}
              fill="none"
              stroke="#FACC15"
              strokeWidth={STROKE}
              strokeDasharray={elecDash}
              strokeDashoffset={CIRCUMFERENCE * 0.25}
              strokeLinecap="butt"
              transform={`rotate(-90 ${CX} ${CY})`}
            />
            {/* Water arc (blue) - starts after electricity */}
            <circle
              cx={CX}
              cy={CY}
              r={RADIUS}
              fill="none"
              stroke="#3B82F6"
              strokeWidth={STROKE}
              strokeDasharray={waterDash}
              strokeDashoffset={-CIRCUMFERENCE * elecFraction}
              strokeLinecap="butt"
              transform={`rotate(-90 ${CX} ${CY})`}
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[11px] text-[#7b7a7d]">Tong</span>
            <span className="text-xs font-bold text-[#323235] leading-tight">
              {new Intl.NumberFormat('vi-VN').format(total)}
            </span>
            <span className="text-[10px] text-[#7b7a7d]">VND</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 h-3 w-3 flex-shrink-0 rounded-full bg-[#FACC15]" />
            <div>
              <p className="text-xs text-[#7b7a7d]">Dien</p>
              <p className="text-sm font-semibold text-[#323235]">
                {new Intl.NumberFormat('vi-VN').format(electricityRevenue)} VND
              </p>
              <p className="text-xs text-[#7b7a7d]">{Math.round(elecFraction * 100)}%</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="mt-0.5 h-3 w-3 flex-shrink-0 rounded-full bg-[#3B82F6]" />
            <div>
              <p className="text-xs text-[#7b7a7d]">Nuoc</p>
              <p className="text-sm font-semibold text-[#323235]">
                {new Intl.NumberFormat('vi-VN').format(waterRevenue)} VND
              </p>
              <p className="text-xs text-[#7b7a7d]">{Math.round(waterFraction * 100)}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
