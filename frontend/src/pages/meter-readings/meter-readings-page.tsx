import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, Droplets, Lock, Building2, ChevronDown, ChevronUp } from 'lucide-react'
import { MeterReadingsFilterBar } from './components/meter-readings-filter-bar'
import { MeterReadingsTable } from './components/meter-readings-table'
import { MeterReadingsPagination } from './components/meter-readings-pagination'
import { MeterReadingStatCard } from './components/meter-reading-stat-card'
import { MeterReadingRevenueDonut } from './components/meter-reading-revenue-donut'
import { MeterReadingProgressCard } from './components/meter-reading-progress-card'
import { MeterReadingGrowthChart } from './components/meter-reading-growth-chart'
import {
  useMeterReadings,
  useMeterReadingStats,
  useUpdateMeterReading,
  useLockMeterReading,
} from '@/hooks/use-meter-readings'
import { useMotels } from '@/hooks/use-motels'
import type { MeterReading } from '@/types'

const ITEMS_PER_PAGE = 100 // load all when grouping by motel

function formatNum(value: number): string {
  return value.toLocaleString('vi-VN')
}

/** Group readings by motel, resolving names from motelMap (id → name) */
function groupByMotel(
  readings: MeterReading[],
  motelMap: Record<string, string>,
): { motelId: string; motelName: string; readings: MeterReading[] }[] {
  const map = new Map<string, { motelId: string; motelName: string; readings: MeterReading[] }>()
  for (const r of readings) {
    const key = r.motelId
    if (!map.has(key)) {
      // Prefer motelMap lookup → r.motel.name → fallback
      const name = motelMap[key] ?? r.motel?.name ?? `Nha tro (${key.slice(0, 6)})`
      map.set(key, { motelId: key, motelName: name, readings: [] })
    }
    map.get(key)!.readings.push(r)
  }
  return Array.from(map.values())
}

/** Collapsible section per motel */
function MotelSection({
  motelName,
  readings,
  defaultOpen = true,
  onSave,
  onLock,
  onView,
  onEdit,
}: {
  motelName: string
  readings: MeterReading[]
  defaultOpen?: boolean
  onSave: (id: string, data: { electricityCurrent: number; waterCurrent: number }) => void
  onLock: (id: string) => void
  onView: (id: string) => void
  onEdit: (id: string) => void
}) {
  const [open, setOpen] = useState(defaultOpen)

  const lockedCount = readings.filter((r) => r.isLocked).length
  const totalElec = readings.reduce((acc, r) => acc + r.electricityUsage, 0)
  const totalWater = readings.reduce((acc, r) => acc + r.waterUsage, 0)

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Section header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 transition-colors hover:bg-gray-50"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1d5fa8]/10">
            <Building2 className="h-4 w-4 text-[#1d5fa8]" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-[#323235]">{motelName}</p>
            <p className="text-xs text-[#7b7a7d]">
              {readings.length} phong &bull; {lockedCount}/{readings.length} da chot &bull;{' '}
              Dien: {formatNum(totalElec)} kWh &bull; Nuoc: {formatNum(totalWater)} m3
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Progress pill */}
          <div className="hidden items-center gap-2 sm:flex">
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-[#1d5fa8] transition-all"
                style={{ width: `${readings.length > 0 ? (lockedCount / readings.length) * 100 : 0}%` }}
              />
            </div>
            <span className="text-xs text-[#7b7a7d]">
              {readings.length > 0 ? Math.round((lockedCount / readings.length) * 100) : 0}%
            </span>
          </div>
          {open ? (
            <ChevronUp className="h-4 w-4 text-[#7b7a7d]" />
          ) : (
            <ChevronDown className="h-4 w-4 text-[#7b7a7d]" />
          )}
        </div>
      </button>

      {/* Collapsible table */}
      {open && (
        <div className="border-t border-gray-100">
          <MeterReadingsTable
            readings={readings}
            onSave={onSave}
            onLock={onLock}
            onView={onView}
            onEdit={onEdit}
            embedded
          />
        </div>
      )}
    </div>
  )
}

export function MeterReadingsPage() {
  const navigate = useNavigate()
  const now = new Date()
  const [currentPage, setCurrentPage] = useState(1)
  const [readingMonth, setReadingMonth] = useState(now.getMonth() + 1)
  const [readingYear, setReadingYear] = useState(now.getFullYear())
  const [motelId, setMotelId] = useState<string | undefined>(undefined)
  const [search, setSearch] = useState('')

  // When filtering by a specific motel, paginate normally; otherwise load all for grouping
  const limit = motelId ? 20 : ITEMS_PER_PAGE

  const { data: response, isLoading } = useMeterReadings({
    page: currentPage,
    limit,
    readingMonth,
    readingYear,
    motelId,
  })

  const { data: stats } = useMeterReadingStats({ readingMonth, readingYear, motelId })
  const { data: motelsResponse } = useMotels()
  const updateMutation = useUpdateMeterReading()
  const lockMutation = useLockMeterReading()

  const readings = response?.data ?? []
  const meta = response?.meta ?? { total: 0, page: 1, limit, totalPages: 1 }

  const motels = useMemo(
    () => (motelsResponse?.data ?? []).map((m) => ({ id: m.id, name: m.name })),
    [motelsResponse],
  )

  // id → name map for grouping
  const motelMap = useMemo(() => {
    const map: Record<string, string> = {}
    for (const m of motelsResponse?.data ?? []) map[m.id] = m.name
    return map
  }, [motelsResponse])

  // Client-side search filter
  const filteredReadings = useMemo(() => {
    if (!search.trim()) return readings
    const q = search.trim().toLowerCase()
    return readings.filter((r) => r.room?.roomCode?.toLowerCase().includes(q))
  }, [readings, search])

  // Group by motel only when no specific motel is selected
  const groupedMotels = useMemo(
    () => (motelId ? null : groupByMotel(filteredReadings, motelMap)),
    [filteredReadings, motelId],
  )

  const elecRevenue = stats ? stats.totalElectricity * (readings[0]?.electricityUnitPrice || 3500) : 0
  const waterRevenue = stats ? stats.totalWater * (readings[0]?.waterUnitPrice || 15000) : 0

  function handleSave(id: string, data: { electricityCurrent: number; waterCurrent: number }) {
    updateMutation.mutate({ id, data })
  }

  function handleLock(id: string) {
    lockMutation.mutate(id)
  }

  function handleFilterChange(setter: (v: number) => void) {
    return (val: number) => { setter(val); setCurrentPage(1) }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-[#7b7a7d]">
        <span>Trang chu</span>
        <span>&rsaquo;</span>
        <span className="text-[#323235]">Chi so dien nuoc</span>
      </nav>

      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#323235]">Quan ly Chi so Dien nuoc</h2>
          <p className="mt-1 text-sm text-[#7b7a7d]">
            Theo doi va quan ly chi so dien nuoc hang thang cho tung phong
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-[#1d5fa8] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#174d8a]">
          <Lock className="h-4 w-4" />
          Chot chi so dien nuoc
        </button>
      </div>

      {/* Stats Row 1 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MeterReadingRevenueDonut
          electricityRevenue={stats?.estimatedRevenue ? elecRevenue : 0}
          waterRevenue={stats?.estimatedRevenue ? waterRevenue : 0}
        />
        <MeterReadingStatCard
          label="Tong dien tieu thu"
          value={`${formatNum(stats?.totalElectricity ?? 0)} kWh`}
          icon={<Zap className="h-5 w-5 text-[#004c6e]" />}
        />
        <MeterReadingStatCard
          label="Tong nuoc tieu thu"
          value={`${formatNum(stats?.totalWater ?? 0)} m3`}
          icon={<Droplets className="h-5 w-5 text-[#004c6e]" />}
        />
      </div>

      {/* Stats Row 2 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-[#7b7a7d]">Tong chi so dien</p>
          <div className="mt-3 flex gap-6">
            <div>
              <p className="text-xs text-[#9CA3AF]">Cu (kWh)</p>
              <p className="text-xl font-bold text-[#1F2937]">{formatNum(stats?.totalElectricityOld ?? 0)}</p>
            </div>
            <div>
              <p className="text-xs text-[#9CA3AF]">Moi (kWh)</p>
              <p className="text-xl font-bold text-[#2563EB]">{formatNum(stats?.totalElectricityNew ?? 0)}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#EFF6FF] px-3 py-1.5">
            <span className="text-xs text-[#6B7280]">Tieu thu:</span>
            <span className="text-xs font-bold text-[#2563EB]">{formatNum(stats?.totalElectricity ?? 0)} kWh</span>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-[#7b7a7d]">Tong chi so nuoc</p>
          <div className="mt-3 flex gap-6">
            <div>
              <p className="text-xs text-[#9CA3AF]">Cu (m3)</p>
              <p className="text-xl font-bold text-[#1F2937]">{formatNum(stats?.totalWaterOld ?? 0)}</p>
            </div>
            <div>
              <p className="text-xs text-[#9CA3AF]">Moi (m3)</p>
              <p className="text-xl font-bold text-[#0EA5E9]">{formatNum(stats?.totalWaterNew ?? 0)}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#F0F9FF] px-3 py-1.5">
            <span className="text-xs text-[#6B7280]">Tieu thu:</span>
            <span className="text-xs font-bold text-[#0EA5E9]">{formatNum(stats?.totalWater ?? 0)} m3</span>
          </div>
        </div>

        <MeterReadingProgressCard
          totalRooms={stats?.progress?.totalRooms ?? 0}
          recorded={stats?.progress?.recorded ?? 0}
          locked={stats?.progress?.locked ?? 0}
          unlocked={stats?.progress?.unlocked ?? 0}
        />

        <MeterReadingGrowthChart data={stats?.growth ?? []} />
      </div>

      {/* Filters */}
      <MeterReadingsFilterBar
        readingMonth={readingMonth}
        readingYear={readingYear}
        motelId={motelId}
        search={search}
        motels={motels}
        onMonthChange={handleFilterChange(setReadingMonth)}
        onYearChange={handleFilterChange(setReadingYear)}
        onMotelChange={(id) => { setMotelId(id); setCurrentPage(1) }}
        onSearchChange={setSearch}
      />

      {/* Table area */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1d5fa8] border-t-transparent" />
        </div>
      ) : groupedMotels ? (
        // --- Grouped by motel ---
        <div className="flex flex-col gap-4">
          {groupedMotels.length === 0 ? (
            <div className="rounded-xl bg-white p-8 text-center shadow-sm">
              <p className="text-sm text-[#7b7a7d]">Chua co du lieu chi so dien nuoc.</p>
            </div>
          ) : (
            groupedMotels.map((group) => (
              <MotelSection
                key={group.motelId}
                motelName={group.motelName}
                readings={group.readings}
                onSave={handleSave}
                onLock={handleLock}
                onView={(id) => navigate(`/meter-readings/${id}`)}
                onEdit={(id) => navigate(`/meter-readings/${id}/edit`)}
              />
            ))
          )}
        </div>
      ) : (
        // --- Single motel: flat paginated view ---
        <>
          <MeterReadingsTable
            readings={filteredReadings}
            onSave={handleSave}
            onLock={handleLock}
            onView={(id) => navigate(`/meter-readings/${id}`)}
            onEdit={(id) => navigate(`/meter-readings/${id}/edit`)}
          />
          {meta.totalPages > 1 && (
            <MeterReadingsPagination
              currentPage={meta.page}
              totalPages={meta.totalPages}
              totalItems={meta.total}
              itemsPerPage={meta.limit}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}
    </div>
  )
}
