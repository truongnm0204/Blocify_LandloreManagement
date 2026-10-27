interface MeterReadingProgressCardProps {
  totalRooms: number
  recorded: number
  locked: number
  unlocked: number
}

export function MeterReadingProgressCard({
  totalRooms,
  recorded,
  locked,
  unlocked,
}: MeterReadingProgressCardProps) {
  const progressPercent = totalRooms > 0 ? Math.round((recorded / totalRooms) * 100) : 0

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-[#323235]">Tien do ghi so</h3>

      {/* Large counter */}
      <div className="mb-1">
        <span className="text-3xl font-bold text-[#323235]">{recorded}</span>
        <span className="text-xl font-semibold text-[#7b7a7d]">/{totalRooms}</span>
      </div>
      <p className="mb-4 text-sm text-[#7b7a7d]">phong da ghi</p>

      {/* Progress bar */}
      <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
        <div
          className="h-full rounded-full bg-[#2563EB] transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        <span className="flex items-center gap-1.5 rounded-full bg-[#DCFCE7] px-3 py-1 text-xs font-medium text-[#15803D]">
          <span className="h-2 w-2 rounded-full bg-[#15803D]" />
          Da chot: {locked}
        </span>
        <span className="flex items-center gap-1.5 rounded-full bg-[#FEF3C7] px-3 py-1 text-xs font-medium text-[#92400E]">
          <span className="h-2 w-2 rounded-full bg-[#92400E]" />
          Chua chot: {unlocked}
        </span>
      </div>
    </div>
  )
}
