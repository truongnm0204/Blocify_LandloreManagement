interface OccupancyCardProps {
  percentage: number
  occupiedCount: number
  totalCount: number
}

export function OccupancyCard({ percentage, occupiedCount, totalCount }: OccupancyCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-xl bg-[#1d5fa8] p-5 text-white shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between">
        <p className="text-sm text-blue-200">Ty le lap day</p>
        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-blue-300">
          <span className="text-xs font-bold">{percentage}%</span>
        </div>
      </div>
      <div className="mt-3">
        <p className="text-3xl font-bold">{percentage}%</p>
        <p className="mt-1 text-sm text-blue-200">
          {occupiedCount}/{totalCount} phong dang su dung
        </p>
      </div>
      <div className="mt-3">
        <div className="h-2 w-full rounded-full bg-blue-800">
          <div
            className="h-2 rounded-full bg-white transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  )
}
