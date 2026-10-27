import { Search } from 'lucide-react'

interface MeterReadingsFilterBarProps {
  readingMonth: number
  readingYear: number
  motelId?: string
  search?: string
  motels?: { id: string; name: string }[]
  onMonthChange: (month: number) => void
  onYearChange: (year: number) => void
  onMotelChange: (motelId?: string) => void
  onSearchChange: (search: string) => void
}

const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
const YEARS = [2024, 2025, 2026, 2027, 2028, 2029, 2030]

const selectClass =
  'rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#323235] transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1d5fa8] focus:ring-offset-1'

export function MeterReadingsFilterBar({
  readingMonth,
  readingYear,
  motelId,
  search = '',
  motels = [],
  onMonthChange,
  onYearChange,
  onMotelChange,
  onSearchChange,
}: MeterReadingsFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Month picker */}
      <select
        value={readingMonth}
        onChange={(e) => onMonthChange(Number(e.target.value))}
        className={selectClass}
      >
        {MONTHS.map((m) => (
          <option key={m} value={m}>
            Thang {m}
          </option>
        ))}
      </select>

      {/* Year picker */}
      <select
        value={readingYear}
        onChange={(e) => onYearChange(Number(e.target.value))}
        className={selectClass}
      >
        {YEARS.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>

      {/* Motel selector */}
      {motels.length > 0 && (
        <select
          value={motelId ?? ''}
          onChange={(e) => onMotelChange(e.target.value || undefined)}
          className={selectClass}
        >
          <option value="">Tat ca khu vuc</option>
          {motels.map((motel) => (
            <option key={motel.id} value={motel.id}>
              {motel.name}
            </option>
          ))}
        </select>
      )}

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b7a7d]" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tim phong..."
          className="rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-[#323235] placeholder-[#7b7a7d] transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1d5fa8] focus:ring-offset-1"
        />
      </div>
    </div>
  )
}
