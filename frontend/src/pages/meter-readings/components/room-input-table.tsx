import { Eye, Pencil, Save } from 'lucide-react'

type InputRowStatus = 'da-chot' | 'chua-nhap' | 'do' | 'cho-duyet'

export interface RoomInputRow {
  id: string
  roomNumber: string
  tenantName: string
  electricPrev: number
  electricCurrent: number
  electricDiff: number
  electricAbnormal?: boolean
  waterPrev: number
  waterCurrent: number
  waterDiff: number
  status: InputRowStatus
  deviationPct?: string
}

interface RoomInputTableProps {
  rows: RoomInputRow[]
  onEdit?: (id: string) => void
  onSave?: (id: string) => void
  onView?: (id: string) => void
}

const statusConfig: Record<InputRowStatus, { label: string; className: string }> = {
  'da-chot': { label: 'Da chot', className: 'bg-green-100 text-green-700' },
  'chua-nhap': { label: 'Chua nhap', className: 'bg-gray-100 text-[#7b7a7d]' },
  'do': { label: 'Do', className: 'bg-yellow-100 text-yellow-700' },
  'cho-duyet': { label: 'Cho duyet', className: 'bg-blue-100 text-[#1d5fa8]' },
}

export function RoomInputTable({ rows, onEdit, onSave, onView }: RoomInputTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl bg-white shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase text-[#7b7a7d]">
            <th className="px-5 py-3">Phong / Khach thue</th>
            <th className="px-3 py-3 text-center" colSpan={3}>
              Chi so Dien (kWh)
            </th>
            <th className="px-3 py-3 text-center" colSpan={3}>
              Chi so Nuoc (m3)
            </th>
            <th className="px-5 py-3">Trang thai</th>
            <th className="px-5 py-3 text-right">Thao tac</th>
          </tr>
          <tr className="border-b border-gray-100 text-xs text-[#7b7a7d]">
            <th className="px-5 py-2" />
            <th className="px-3 py-2 font-normal">Cu</th>
            <th className="px-3 py-2 font-normal">Moi</th>
            <th className="px-3 py-2 font-normal">CL</th>
            <th className="px-3 py-2 font-normal">Cu</th>
            <th className="px-3 py-2 font-normal">Moi</th>
            <th className="px-3 py-2 font-normal">CL</th>
            <th className="px-5 py-2" />
            <th className="px-5 py-2" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const cfg = statusConfig[row.status]
            return (
              <tr
                key={row.id}
                className="border-b border-gray-50 transition-colors last:border-0 hover:bg-gray-50"
              >
                {/* Room / Tenant */}
                <td className="px-5 py-4">
                  <p className="text-sm font-medium text-[#323235]">{row.roomNumber}</p>
                  <p className="text-xs text-[#7b7a7d]">{row.tenantName}</p>
                </td>

                {/* Electricity */}
                <td className="px-3 py-4 text-sm text-[#7b7a7d]">{row.electricPrev.toLocaleString()}</td>
                <td className="px-3 py-4">
                  <span
                    className={`text-sm font-medium ${row.electricAbnormal ? 'text-red-500' : 'text-[#323235]'}`}
                  >
                    {row.electricCurrent.toLocaleString()}
                  </span>
                </td>
                <td className="px-3 py-4 text-sm text-[#323235]">{row.electricDiff}</td>

                {/* Water */}
                <td className="px-3 py-4 text-sm text-[#7b7a7d]">{row.waterPrev}</td>
                <td className="px-3 py-4 text-sm text-[#323235]">{row.waterCurrent}</td>
                <td className="px-3 py-4 text-sm text-[#323235]">{row.waterDiff}</td>

                {/* Status */}
                <td className="px-5 py-4">
                  <div className="flex flex-col gap-1">
                    <span className={`w-fit rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.className}`}>
                      {cfg.label}
                    </span>
                    {row.deviationPct && (
                      <span className="text-xs text-yellow-600">{row.deviationPct}</span>
                    )}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onView?.(row.id)}
                      className="rounded-lg p-2 text-[#7b7a7d] transition-colors hover:bg-gray-100 hover:text-[#323235]"
                      title="Xem chi tiet"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEdit?.(row.id)}
                      className="rounded-lg p-2 text-[#7b7a7d] transition-colors hover:bg-gray-100 hover:text-[#323235]"
                      title="Chinh sua"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onSave?.(row.id)}
                      className="rounded-lg p-2 text-[#1d5fa8] transition-colors hover:bg-blue-50"
                      title="Luu"
                    >
                      <Save className="h-4 w-4" />
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
