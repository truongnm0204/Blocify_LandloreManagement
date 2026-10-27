import { DoorOpen, Home, TrendingUp } from 'lucide-react'

interface MotelDetailStatCardsProps {
  totalRooms: number
  occupiedRooms: number
  vacantRooms: number
  monthlyRevenue: number
}

function formatRevenue(amount: number): string {
  if (amount >= 1_000_000) {
    return (amount / 1_000_000).toFixed(1) + ' tr'
  }
  return new Intl.NumberFormat('vi-VN').format(amount) + ' d'
}

export function MotelDetailStatCards({
  totalRooms,
  occupiedRooms,
  vacantRooms,
  monthlyRevenue,
}: MotelDetailStatCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {/* Tong so phong */}
      <div className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#c8e6ff]">
          <Home className="h-5 w-5 text-[#004c6e]" />
        </div>
        <div>
          <p className="text-sm text-[#7b7a7d]">Tong so phong</p>
          <p className="text-2xl font-semibold text-[#323235]">{totalRooms}</p>
        </div>
      </div>

      {/* Phong dang thue */}
      <div className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
          <DoorOpen className="h-5 w-5 text-green-700" />
        </div>
        <div>
          <p className="text-sm text-[#7b7a7d]">Phong dang thue</p>
          <p className="text-2xl font-semibold text-[#323235]">{occupiedRooms}</p>
        </div>
      </div>

      {/* Phong trong */}
      <div className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
          <DoorOpen className="h-5 w-5 text-blue-700" />
        </div>
        <div>
          <p className="text-sm text-[#7b7a7d]">Phong trong</p>
          <p className="text-2xl font-semibold text-[#323235]">{vacantRooms}</p>
        </div>
      </div>

      {/* Doanh thu thang - dark blue */}
      <div className="flex items-center gap-4 rounded-xl bg-[#1d5fa8] p-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
          <TrendingUp className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm text-blue-200">Doanh thu thang</p>
          <p className="text-2xl font-semibold text-white">{formatRevenue(monthlyRevenue)}</p>
        </div>
      </div>
    </div>
  )
}
