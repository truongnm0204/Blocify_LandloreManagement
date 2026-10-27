import { Plus, RotateCcw, Save } from 'lucide-react'

interface InputSummaryBarProps {
  totalRevenue: string
  totalElectric: string
  totalWater: string
  onCancel?: () => void
  onSave?: () => void
  onAddRoom?: () => void
}

export function InputSummaryBar({
  totalRevenue,
  totalElectric,
  totalWater,
  onCancel,
  onSave,
  onAddRoom,
}: InputSummaryBarProps) {
  return (
    <div className="sticky bottom-0 flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-3 shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
      {/* Add room button */}
      <button
        onClick={onAddRoom}
        className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-[#323235] transition-colors hover:bg-gray-50"
      >
        <Plus className="h-4 w-4" />
        Them phong moi
      </button>

      {/* Stats */}
      <div className="flex items-center gap-6">
        <div className="text-center">
          <p className="text-xs text-[#7b7a7d]">Tong doanh thu</p>
          <p className="text-sm font-semibold text-[#323235]">{totalRevenue}</p>
        </div>
        <div className="h-8 w-px bg-gray-200" />
        <div className="text-center">
          <p className="text-xs text-[#7b7a7d]">Tong dien</p>
          <p className="text-sm font-semibold text-[#323235]">{totalElectric}</p>
        </div>
        <div className="h-8 w-px bg-gray-200" />
        <div className="text-center">
          <p className="text-xs text-[#7b7a7d]">Tong nuoc</p>
          <p className="text-sm font-semibold text-[#323235]">{totalWater}</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-[#323235] transition-colors hover:bg-gray-50"
        >
          <RotateCcw className="h-4 w-4" />
          Huy thay doi
        </button>
        <button
          onClick={onSave}
          className="flex items-center gap-2 rounded-lg bg-[#1d5fa8] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#174d8a]"
        >
          <Save className="h-4 w-4" />
          Luu & Dong bo du lieu
        </button>
      </div>
    </div>
  )
}
