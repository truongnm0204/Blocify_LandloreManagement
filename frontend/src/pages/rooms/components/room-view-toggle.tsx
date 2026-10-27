import { List, LayoutGrid } from 'lucide-react'

export type ViewMode = 'list' | 'grid'

interface RoomViewToggleProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

export function RoomViewToggle({ viewMode, onViewModeChange }: RoomViewToggleProps) {
  return (
    <div className="flex items-center overflow-hidden rounded-lg border border-gray-200">
      <button
        onClick={() => onViewModeChange('list')}
        className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
          viewMode === 'list'
            ? 'bg-[#1d5fa8] text-white'
            : 'bg-white text-[#7b7a7d] hover:bg-gray-50'
        }`}
        title="Danh sach"
      >
        <List className="h-4 w-4" />
      </button>
      <button
        onClick={() => onViewModeChange('grid')}
        className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
          viewMode === 'grid'
            ? 'bg-[#1d5fa8] text-white'
            : 'bg-white text-[#7b7a7d] hover:bg-gray-50'
        }`}
        title="So do phong"
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
    </div>
  )
}
