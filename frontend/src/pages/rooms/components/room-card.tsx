import { DoorOpen } from 'lucide-react'
import type { RoomWithMotel } from './room-table'

interface RoomCardProps {
  room: RoomWithMotel
  onClick?: (id: string) => void
}

const ROOM_STATUS_COLORS: Record<string, {
  border: string
  bg: string
  dot: string
  label: string
}> = {
  VACANT: { border: 'border-l-green-500', bg: 'bg-green-50/50', dot: 'bg-green-500', label: 'Trong' },
  OCCUPIED: { border: 'border-l-blue-500', bg: 'bg-blue-50/50', dot: 'bg-blue-500', label: 'Da thue' },
  RESERVED: { border: 'border-l-yellow-500', bg: 'bg-yellow-50/50', dot: 'bg-yellow-500', label: 'Dat coc' },
  MAINTENANCE: { border: 'border-l-orange-500', bg: 'bg-orange-50/50', dot: 'bg-orange-500', label: 'Dang sua' },
}

function formatCurrency(amount: number): string {
  const millions = amount / 1_000_000
  if (millions >= 1) {
    const formatted = millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)
    return `${formatted}tr`
  }
  return new Intl.NumberFormat('vi-VN').format(amount) + ' d'
}

function getTenantName(room: RoomWithMotel): string | null {
  if (room.status !== 'OCCUPIED') return null
  const activeContract = room.contracts?.find((c) => c.status === 'ACTIVE')
  if (!activeContract?.tenants?.length) return null
  const rep = activeContract.tenants.find((t) => t.isRepresentative)
  return rep?.tenant?.fullName || activeContract.tenants[0]?.tenant?.fullName || null
}

export function RoomCard({ room, onClick }: RoomCardProps) {
  const colors = ROOM_STATUS_COLORS[room.status] || ROOM_STATUS_COLORS.VACANT
  // Use pre-computed tenantName if available, fallback to extracting from contracts
  const tenantName = room.tenantName !== undefined
    ? room.tenantName
    : getTenantName(room)

  return (
    <button
      onClick={() => onClick?.(room.id)}
      className={`flex w-full flex-col rounded-lg border border-gray-100 border-l-4 ${colors.border} ${colors.bg} p-3 text-left transition-all hover:shadow-md`}
    >
      {/* Room code + icon */}
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white/80">
          <DoorOpen className="h-3.5 w-3.5 text-[#004c6e]" />
        </div>
        <span className="text-sm font-semibold text-[#323235]">{room.roomCode}</span>
      </div>

      {/* Status badge */}
      <div className="mt-2 flex items-center gap-1.5">
        <span className={`h-2 w-2 rounded-full ${colors.dot}`} />
        <span className="text-xs font-medium text-[#7b7a7d]">{colors.label}</span>
      </div>

      {/* Tenant name */}
      {tenantName && (
        <p className="mt-1 truncate text-xs text-[#323235]">{tenantName}</p>
      )}

      {/* Rent */}
      <p className="mt-1 text-xs font-medium text-[#1d5fa8]">
        {formatCurrency(room.baseRent)}
      </p>
    </button>
  )
}
