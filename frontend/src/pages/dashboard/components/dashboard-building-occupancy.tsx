import { useMotelOccupancy } from '@/hooks/use-dashboard'
import { Building2 } from 'lucide-react'

export function DashboardBuildingOccupancy() {
  const { data: motels, isLoading } = useMotelOccupancy()

  return (
    <div className="rounded-xl bg-white p-5 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-[#323235]">Ty le lap day toa nha</h3>
        <span className="rounded-full bg-[#e8f0fe] px-3 py-1 text-xs font-medium text-[#1d5fa8]">
          Trang thai toa
        </span>
      </div>

      {isLoading ? (
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 w-36 flex-shrink-0 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : !motels || motels.length === 0 ? (
        <p className="py-4 text-center text-sm text-[#7b7a7d]">Chua co toa nha nao</p>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {motels.map((motel) => {
            const rate = motel.occupancyRate
            const colorClass =
              rate >= 90
                ? 'text-[#16a34a] bg-[#f0fdf4]'
                : rate >= 70
                  ? 'text-[#1d5fa8] bg-[#e8f0fe]'
                  : rate >= 50
                    ? 'text-[#f59e0b] bg-[#fffbeb]'
                    : 'text-[#ef4444] bg-[#fef2f2]'

            return (
              <div
                key={motel.motelId}
                className="flex w-36 flex-shrink-0 flex-col items-center rounded-xl border border-gray-100 p-4 transition-colors hover:bg-[#f5f6fa]"
              >
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[#e8f0fe]">
                  <Building2 className="h-4 w-4 text-[#1d5fa8]" />
                </div>
                <p className="mb-1 truncate text-xs font-medium text-[#323235]" title={motel.name}>
                  {motel.name}
                </p>
                <p className={`rounded-full px-2 py-0.5 text-lg font-bold ${colorClass}`}>
                  {rate}%
                </p>
                <p className="mt-1 text-[10px] text-[#7b7a7d]">
                  {motel.occupied}/{motel.total} phong
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
