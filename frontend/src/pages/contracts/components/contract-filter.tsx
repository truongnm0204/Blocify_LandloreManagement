import { RotateCcw, SlidersHorizontal } from 'lucide-react'
import { useRoomsByMotel } from '@/hooks/use-rooms'
import type { Motel } from '@/types'

export interface ContractFilterValues {
  contractCode: string
  motelId: string
  roomId: string
  tenant: string
  status: string
  startDateFrom: string
  startDateTo: string
}

interface ContractFilterProps {
  values: ContractFilterValues
  onChange: (values: ContractFilterValues) => void
  onReset: () => void
  motels: Motel[]
}

const STATUS_OPTIONS = [
  { value: '', label: 'Tat ca trang thai' },
  { value: 'ACTIVE', label: 'Dang hieu luc' },
  { value: 'DRAFT', label: 'Nhap' },
  { value: 'ENDED', label: 'Da ket thuc' },
  { value: 'CANCELLED', label: 'Da huy' },
]

export const DEFAULT_CONTRACT_FILTER: ContractFilterValues = {
  contractCode: '',
  motelId: '',
  roomId: '',
  tenant: '',
  status: '',
  startDateFrom: '',
  startDateTo: '',
}

export function ContractFilter({ values, onChange, onReset, motels }: ContractFilterProps) {
  // Load rooms when a motel is selected
  const { data: roomsData, isLoading: roomsLoading } = useRoomsByMotel(
    values.motelId || undefined,
    1,
    100,
  )
  const rooms = roomsData?.data ?? []

  const update = (field: keyof ContractFilterValues, value: string) => {
    // Clear room selection when motel changes
    if (field === 'motelId') {
      onChange({ ...values, motelId: value, roomId: '' })
      return
    }
    onChange({ ...values, [field]: value })
  }

  return (
    <div className="rounded-xl bg-white p-5 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
      <div className="mb-4 flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-[#7b7a7d]" />
        <h3 className="text-sm font-semibold text-[#323235]">Bo loc tim kiem</h3>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#7b7a7d]">Toa nha</label>
          <select
            value={values.motelId}
            onChange={(e) => update('motelId', e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#323235] focus:border-[#1d5fa8] focus:outline-none"
          >
            <option value="">Tat ca toa nha</option>
            {motels.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#7b7a7d]">Phong</label>
          <select
            value={values.roomId}
            onChange={(e) => update('roomId', e.target.value)}
            disabled={!values.motelId}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#323235] focus:border-[#1d5fa8] focus:outline-none disabled:opacity-50"
          >
            <option value="">
              {!values.motelId
                ? 'Chon toa nha truoc'
                : roomsLoading
                  ? 'Dang tai...'
                  : 'Tat ca phong'}
            </option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.roomCode}{r.name ? ` - ${r.name}` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#7b7a7d]">Ma hop dong</label>
          <input
            type="text"
            placeholder="Vi du: HD-101"
            value={values.contractCode}
            onChange={(e) => update('contractCode', e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#323235] placeholder:text-[#7b7a7d] focus:border-[#1d5fa8] focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#7b7a7d]">Khach thue</label>
          <input
            type="text"
            placeholder="Ten khach thue..."
            value={values.tenant}
            onChange={(e) => update('tenant', e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#323235] placeholder:text-[#7b7a7d] focus:border-[#1d5fa8] focus:outline-none"
          />
        </div>
      </div>

      {/* Second row: status + date range */}
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#7b7a7d]">Trang thai</label>
          <select
            value={values.status}
            onChange={(e) => update('status', e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#323235] focus:border-[#1d5fa8] focus:outline-none"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#7b7a7d]">Ngay bat dau tu</label>
          <input
            type="date"
            value={values.startDateFrom}
            onChange={(e) => update('startDateFrom', e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#323235] focus:border-[#1d5fa8] focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#7b7a7d]">Ngay bat dau den</label>
          <input
            type="date"
            value={values.startDateTo}
            onChange={(e) => update('startDateTo', e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#323235] focus:border-[#1d5fa8] focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-3">
        <button
          onClick={onReset}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-[#323235] transition-colors hover:bg-gray-50"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Dat lai
        </button>
      </div>
    </div>
  )
}
