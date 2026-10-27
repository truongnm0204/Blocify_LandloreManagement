import { Plus } from 'lucide-react'
import type { RoomWithTenant, RoomStatus } from '@/types'

interface MotelDetailRoomTableProps {
  rooms: RoomWithTenant[]
  onCreateRoom?: () => void
}

const STATUS_CONFIG: Record<RoomStatus, { label: string; bg: string; text: string }> = {
  OCCUPIED: { label: 'Dang thue', bg: 'bg-green-100', text: 'text-green-800' },
  VACANT: { label: 'Trong', bg: 'bg-blue-100', text: 'text-blue-800' },
  MAINTENANCE: { label: 'Bao tri', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  RESERVED: { label: 'Da dat', bg: 'bg-purple-100', text: 'text-purple-800' },
}

function formatVnd(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + ' d'
}

function getTenantName(room: RoomWithTenant): string {
  return room.currentTenant?.fullName ?? '—'
}

export function MotelDetailRoomTable({ rooms, onCreateRoom }: MotelDetailRoomTableProps) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
      {/* Table header bar */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-5 py-3">
        <h3 className="text-sm font-semibold text-[#323235]">Danh sach phong</h3>
        <button
          onClick={onCreateRoom}
          className="flex items-center gap-1.5 rounded-lg bg-[#1d5fa8] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#174d8a]"
        >
          <Plus className="h-3.5 w-3.5" />
          Tao phong
        </button>
      </div>

      {rooms.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-[#7b7a7d]">Chua co phong nao. Tao phong dau tien.</p>
        </div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase text-[#7b7a7d]">
              <th className="px-5 py-3">Phong</th>
              <th className="px-5 py-3">Tang</th>
              <th className="px-5 py-3">Dien tich</th>
              <th className="px-5 py-3">Gia thue</th>
              <th className="px-5 py-3">Trang thai</th>
              <th className="px-5 py-3">Nguoi thue</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => {
              const statusCfg = STATUS_CONFIG[room.status] ?? STATUS_CONFIG.VACANT
              return (
                <tr
                  key={room.id}
                  className="border-b border-gray-50 transition-colors last:border-0 hover:bg-gray-50"
                >
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-medium text-[#323235]">{room.roomCode}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm text-[#323235]">
                      {room.floor != null ? `Tang ${room.floor}` : '—'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm text-[#323235]">
                      {room.area != null ? `${room.area} m²` : '—'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm text-[#323235]">{formatVnd(room.baseRent)}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusCfg.bg} ${statusCfg.text}`}
                    >
                      {statusCfg.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm text-[#323235]">{getTenantName(room)}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
