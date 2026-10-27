import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Vehicle, VehicleType, VehicleStatus } from '@/types'

interface VehicleTableProps {
  vehicles: Vehicle[]
  meta: { total: number; page: number; limit: number; totalPages: number }
  currentPage: number
  onPageChange: (page: number) => void
  onRowClick: (vehicle: Vehicle) => void
  onDeactivate: (id: string) => void
}

const TYPE_CONFIG: Record<VehicleType, { label: string; bg: string; text: string }> = {
  MOTORCYCLE: { label: 'Xe may', bg: 'bg-blue-50', text: 'text-blue-700' },
  CAR: { label: 'O to', bg: 'bg-purple-50', text: 'text-purple-700' },
  BICYCLE: { label: 'Xe dap', bg: 'bg-green-50', text: 'text-green-700' },
  ELECTRIC_BIKE: { label: 'Xe dap dien', bg: 'bg-orange-50', text: 'text-orange-700' },
  OTHER: { label: 'Khac', bg: 'bg-gray-100', text: 'text-gray-600' },
}

const STATUS_CONFIG: Record<VehicleStatus, { label: string; bg: string; text: string }> = {
  ACTIVE: { label: 'Hoat dong', bg: 'bg-green-50', text: 'text-green-700' },
  INACTIVE: { label: 'Ngung', bg: 'bg-gray-100', text: 'text-gray-600' },
}

function formatCurrency(value?: number): string {
  if (value == null) return '—'
  return value.toLocaleString('vi-VN') + ' d'
}

export function VehicleTable({ vehicles, meta, currentPage, onPageChange, onRowClick, onDeactivate }: VehicleTableProps) {
  if (vehicles.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-[#7b7a7d]">Chua co phuong tien nao.</p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[750px]">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase text-[#7b7a7d]">
              <th className="px-5 py-3">Bien so xe</th>
              <th className="px-5 py-3">Loai xe</th>
              <th className="px-5 py-3">Nhan hieu</th>
              <th className="px-5 py-3">Mau sac</th>
              <th className="px-5 py-3">Chi phi/thang</th>
              <th className="px-5 py-3">Nguoi thue</th>
              <th className="px-5 py-3">Trang thai</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => {
              const typeCfg = TYPE_CONFIG[v.vehicleType] ?? TYPE_CONFIG.OTHER
              const statusCfg = STATUS_CONFIG[v.status] ?? STATUS_CONFIG.ACTIVE
              return (
                <tr
                  key={v.id}
                  onClick={() => onRowClick(v)}
                  className="cursor-pointer border-b border-gray-50 transition-colors last:border-0 hover:bg-gray-50"
                >
                  <td className="px-5 py-4 text-sm font-medium text-[#323235]">{v.licensePlate}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${typeCfg.bg} ${typeCfg.text}`}>
                      {typeCfg.label}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-[#7b7a7d]">{v.brand || '—'}</td>
                  <td className="px-5 py-4 text-sm text-[#7b7a7d]">{v.color || '—'}</td>
                  <td className="px-5 py-4 text-sm text-[#323235]">{formatCurrency(v.monthlyFee)}</td>
                  <td className="px-5 py-4 text-sm text-[#323235]">{v.tenant?.fullName || '—'}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusCfg.bg} ${statusCfg.text}`}>
                      {statusCfg.label}
                    </span>
                  </td>
                  <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                    {v.status === 'ACTIVE' && (
                      <button
                        onClick={() => onDeactivate(v.id)}
                        className="rounded px-2 py-1 text-xs text-[#7b7a7d] hover:bg-gray-100 hover:text-red-600"
                      >
                        Ngung
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3">
          <p className="text-sm text-[#7b7a7d]">
            Trang {meta.page} / {meta.totalPages} ({meta.total} phuong tien)
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              className="rounded-lg p-1.5 text-[#7b7a7d] transition-colors hover:bg-gray-100 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`min-w-[32px] rounded-lg px-2.5 py-1 text-sm font-medium transition-colors ${
                  page === currentPage
                    ? 'bg-[#1d5fa8] text-white'
                    : 'text-[#7b7a7d] hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => onPageChange(Math.min(meta.totalPages, currentPage + 1))}
              disabled={currentPage >= meta.totalPages}
              className="rounded-lg p-1.5 text-[#7b7a7d] transition-colors hover:bg-gray-100 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
