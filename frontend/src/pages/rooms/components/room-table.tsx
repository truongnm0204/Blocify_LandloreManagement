import { Eye, Pencil, DoorOpen, User, UserPlus } from 'lucide-react'
import type { Room } from '@/types'

interface RoomTableProps {
  rooms: RoomWithMotel[]
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  /** Navigate to contract creation form pre-filled with this room */
  onAddTenant?: (room: RoomWithMotel) => void
}

export interface RoomWithMotel extends Room {
  motelName?: string
  deposit?: number
  occupantCount?: number
  /** Representative tenant name for occupied rooms */
  tenantName?: string | null
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + ' d'
}

const statusConfig: Record<string, { label: string; className: string }> = {
  VACANT:      { label: 'Trong',        className: 'bg-green-50 text-green-700' },
  OCCUPIED:    { label: 'Da thue',      className: 'bg-blue-50 text-blue-700' },
  RESERVED:    { label: 'Da dat coc',   className: 'bg-yellow-50 text-yellow-700' },
  MAINTENANCE: { label: 'Dang sua chua',className: 'bg-orange-50 text-orange-700' },
}

/** Rooms that can never accept new tenants regardless of occupancy */
const NO_ADD_TENANT: Room['status'][] = ['MAINTENANCE']

export function RoomTable({ rooms, onView, onEdit, onAddTenant }: RoomTableProps) {
  if (rooms.length === 0) {
    return (
      <div className="rounded-xl bg-white p-8 text-center shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
        <p className="text-sm text-[#7b7a7d]">Chua co phong nao.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase text-[#7b7a7d]">
            <th className="px-5 py-3">Ma phong</th>
            <th className="px-5 py-3">Ten nha/Day</th>
            <th className="px-5 py-3">Nguoi thue</th>
            <th className="px-5 py-3">Gia thue (VND)</th>
            <th className="px-5 py-3">So nguoi toi da</th>
            <th className="px-5 py-3">Trang thai</th>
            <th className="px-5 py-3 text-right">Thao tac</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => {
            const status = statusConfig[room.status] || statusConfig.VACANT
            const canAddTenant =
              !NO_ADD_TENANT.includes(room.status as Room['status']) &&
              (room.maxOccupants == null || (room.occupantCount ?? 0) < room.maxOccupants)
            return (
              <tr
                key={room.id}
                className="border-b border-gray-50 transition-colors last:border-0 hover:bg-gray-50"
              >
                {/* Room code */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#c8e6ff]">
                      <DoorOpen className="h-4 w-4 text-[#004c6e]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#323235]">{room.roomCode}</p>
                      <p className="text-xs text-[#7b7a7d]">
                        {room.area ? `${room.area}m2` : '--'}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Motel name */}
                <td className="px-5 py-4">
                  <p className="text-sm text-[#323235]">{room.motelName || room.name}</p>
                  <p className="text-xs text-[#7b7a7d]">{room.name}</p>
                </td>

                {/* Tenant */}
                <td className="px-5 py-4">
                  {room.tenantName ? (
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                        <User className="h-3 w-3 text-[#1d5fa8]" />
                      </div>
                      <p className="text-sm text-[#323235]">{room.tenantName}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-[#7b7a7d]">—</p>
                  )}
                </td>

                {/* Rent */}
                <td className="px-5 py-4">
                  <p className="text-sm font-medium text-[#323235]">
                    {formatCurrency(room.baseRent)}
                  </p>
                </td>

                {/* Max occupants */}
                <td className="px-5 py-4">
                  <p className="text-sm text-[#323235]">
                    {room.maxOccupants ? `${room.maxOccupants} nguoi` : '--'}
                  </p>
                </td>

                {/* Status */}
                <td className="px-5 py-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}>
                    {status.label}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    {/* Add tenant — hidden when room is under maintenance or already at max occupancy */}
                    {canAddTenant && onAddTenant && (
                      <button
                        onClick={() => onAddTenant(room)}
                        className="flex items-center gap-1.5 rounded-lg bg-[#1d5fa8] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#174d8a]"
                        title={`Them nguoi thue (${room.occupantCount ?? 0}/${room.maxOccupants ?? '?'} nguoi)`}
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        Them NTH
                      </button>
                    )}
                    <button
                      onClick={() => onView?.(room.id)}
                      className="rounded-lg p-2 text-[#7b7a7d] transition-colors hover:bg-gray-100 hover:text-[#323235]"
                      title="Xem chi tiet"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEdit?.(room.id)}
                      className="rounded-lg p-2 text-[#7b7a7d] transition-colors hover:bg-gray-100 hover:text-[#323235]"
                      title="Chinh sua"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
