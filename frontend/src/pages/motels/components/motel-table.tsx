import { Eye, Settings, Building2 } from 'lucide-react'
import type { MotelWithStats } from '@/types'

interface MotelTableProps {
  motels: MotelWithStats[]
  onView?: (id: string) => void
  onEdit?: (id: string) => void
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + ' d'
}

function RoomProgressBar({ occupied, total }: { occupied: number; total: number }) {
  const pct = total > 0 ? (occupied / total) * 100 : 0
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-[#323235]">
        {occupied}/{total} phong
      </span>
      <div className="h-1.5 w-20 rounded-full bg-gray-200">
        <div
          className="h-1.5 rounded-full bg-green-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export function MotelTable({ motels, onView, onEdit }: MotelTableProps) {
  if (motels.length === 0) {
    return (
      <div className="rounded-xl bg-white p-8 text-center shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
        <p className="text-sm text-[#7b7a7d]">Chua co toa nha nao.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase text-[#7b7a7d]">
            <th className="px-5 py-3">Thong tin toa nha</th>
            <th className="px-5 py-3">Trang thai</th>
            <th className="px-5 py-3">Trang thai phong</th>
            <th className="px-5 py-3">Doanh thu thang</th>
            <th className="px-5 py-3 text-right">Hanh dong</th>
          </tr>
        </thead>
        <tbody>
          {motels.map((motel) => (
            <tr
              key={motel.id}
              className="border-b border-gray-50 transition-colors last:border-0 hover:bg-gray-50"
            >
              {/* Building info */}
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#c8e6ff]">
                    <Building2 className="h-4 w-4 text-[#004c6e]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#323235]">{motel.name}</p>
                    <p className="text-xs text-[#7b7a7d]">{motel.address || 'Chua co dia chi'}</p>
                  </div>
                </div>
              </td>

              {/* Status */}
              <td className="px-5 py-4">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                    motel.status === 'ACTIVE'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      motel.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                  />
                  {motel.status === 'ACTIVE' ? 'Hoat dong' : 'Ngung'}
                </span>
              </td>

              {/* Room status */}
              <td className="px-5 py-4">
                <RoomProgressBar occupied={motel.occupiedRooms} total={motel.totalRooms} />
              </td>

              {/* Revenue */}
              <td className="px-5 py-4">
                {motel.monthlyRevenue != null ? (
                  <>
                    <p className="text-sm font-medium text-[#323235]">
                      {formatCurrency(motel.monthlyRevenue)}
                    </p>
                    {motel.revenueChange != null && (
                      <span
                        className={`text-xs font-medium ${
                          motel.revenueChange >= 0 ? 'text-green-600' : 'text-red-500'
                        }`}
                      >
                        {motel.revenueChange >= 0 ? '+' : ''}
                        {motel.revenueChange}%
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-sm text-[#7b7a7d]">--</span>
                )}
              </td>

              {/* Actions */}
              <td className="px-5 py-4">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onView?.(motel.id)}
                    className="rounded-lg p-2 text-[#7b7a7d] transition-colors hover:bg-gray-100 hover:text-[#323235]"
                    title="Xem chi tiet"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onEdit?.(motel.id)}
                    className="rounded-lg p-2 text-[#7b7a7d] transition-colors hover:bg-gray-100 hover:text-[#323235]"
                    title="Cai dat"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
