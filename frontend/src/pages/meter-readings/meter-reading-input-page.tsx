import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, Droplets, FileDown, Lock, Calendar, Building2 } from 'lucide-react'
import { MeterReadingStatCard } from './components/meter-reading-stat-card'
import { RoomInputTable, type RoomInputRow } from './components/room-input-table'
import { InputSummaryBar } from './components/input-summary-bar'
import { useMeterReadings, useMeterReadingStats, useLockMeterReading } from '@/hooks/use-meter-readings'
import { useMotels } from '@/hooks/use-motels'
import type { MeterReading } from '@/types'

const TABS = ['Tong quan', 'Lich su', 'Ho tro']

function mapToInputRow(r: MeterReading): RoomInputRow {
  const locked = r.isLocked
  const hasCurrent = r.electricityCurrent > 0 || r.waterCurrent > 0
  const status: RoomInputRow['status'] = locked
    ? 'da-chot'
    : hasCurrent
      ? 'cho-duyet'
      : 'chua-nhap'

  const tenant = r.contract?.tenants?.find((t) => t.isRepresentative)?.tenant

  return {
    id: r.id,
    roomNumber: r.room?.roomCode ?? r.room?.roomName ?? r.roomId,
    tenantName: tenant?.fullName ?? '-',
    electricPrev: r.electricityPrevious,
    electricCurrent: r.electricityCurrent,
    electricDiff: r.electricityUsage,
    waterPrev: r.waterPrevious,
    waterCurrent: r.waterCurrent,
    waterDiff: r.waterUsage,
    status,
  }
}

export function MeterReadingInputPage() {
  const navigate = useNavigate()
  const now = new Date()
  const [readingMonth] = useState(now.getMonth() + 1)
  const [readingYear] = useState(now.getFullYear())

  const { data: motelsResponse } = useMotels()
  const firstMotel = motelsResponse?.data?.[0]
  const motelId = firstMotel?.id
  const motelName = firstMotel?.name ?? 'Tat ca'

  const { data: response, isLoading } = useMeterReadings({ motelId, readingMonth, readingYear, limit: 100 })
  const { data: stats } = useMeterReadingStats({ motelId, readingMonth, readingYear })
  const lockMutation = useLockMeterReading()

  const readings = response?.data ?? []

  const rows: RoomInputRow[] = useMemo(() => readings.map(mapToInputRow), [readings])

  const totalElectric = useMemo(() => readings.reduce((s, r) => s + r.electricityUsage, 0), [readings])
  const totalWater = useMemo(() => readings.reduce((s, r) => s + r.waterUsage, 0), [readings])
  const totalRevenue = useMemo(
    () => readings.reduce((s, r) => s + r.electricityUsage * r.electricityUnitPrice + r.waterUsage * r.waterUnitPrice, 0),
    [readings],
  )
  const lockedCount = useMemo(() => readings.filter((r) => r.isLocked).length, [readings])
  const totalCount = stats?.progress.totalRooms ?? readings.length

  function handleLockAll() {
    const unlocked = readings.filter((r) => !r.isLocked)
    unlocked.forEach((r) => lockMutation.mutate(r.id))
  }

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* Header tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === 'Tong quan'
                ? 'border-b-2 border-[#1d5fa8] text-[#1d5fa8]'
                : 'text-[#7b7a7d] hover:text-[#323235]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Title + breadcrumb */}
      <div>
        <nav className="mb-1 flex items-center gap-1.5 text-xs text-[#7b7a7d]">
          <span>Trang chu</span>
          <span>&rsaquo;</span>
          <span className="text-[#323235]">Nhap so</span>
        </nav>
        <h2 className="text-xl font-semibold text-[#323235]">Nhap Chi so Dien nuoc</h2>
        <p className="mt-1 text-sm text-[#7b7a7d]">Cap nhat chi so dien nuoc cho tung phong trong thang</p>
      </div>

      {/* Filter row */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-[#323235]">
          <Calendar className="h-4 w-4 text-[#7b7a7d]" />
          <span>
            Thang {readingMonth}, {readingYear}
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-[#323235]">
          <Building2 className="h-4 w-4 text-[#7b7a7d]" />
          <span>{motelName}</span>
        </div>
      </div>

      {/* Revenue stat card */}
      <div className="rounded-xl bg-gradient-to-r from-[#1d5fa8] to-[#174d8a] p-5 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-200">Doanh thu tinh den cu kiem</p>
            <p className="mt-1 text-2xl font-semibold text-white">
              {totalRevenue.toLocaleString('vi-VN')} VND
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-200">Tien da nhap</p>
            <p className="mt-1 text-lg font-semibold text-white">
              {lockedCount}/{totalCount} Phong
            </p>
          </div>
        </div>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <MeterReadingStatCard
          label="Tong dien tieu thu"
          value={`${totalElectric.toLocaleString('vi-VN')} kWh`}
          icon={<Zap className="h-5 w-5 text-[#004c6e]" />}
        />
        <MeterReadingStatCard
          label="Tong nuoc tieu thu"
          value={`${totalWater.toLocaleString('vi-VN')} m3`}
          icon={<Droplets className="h-5 w-5 text-[#004c6e]" />}
        />
      </div>

      {/* Room list section */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-semibold text-[#323235]">
              Danh sach phong ({motelName})
            </h3>
            <span className="rounded-full bg-[#c8e6ff] px-2.5 py-0.5 text-xs font-medium text-[#004c6e]">
              {totalCount} Phong
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-[#323235] transition-colors hover:bg-gray-50">
              <FileDown className="h-4 w-4" />
              Xuat file
            </button>
            <button
              onClick={handleLockAll}
              disabled={lockMutation.isPending}
              className="flex items-center gap-2 rounded-lg bg-[#1d5fa8] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#174d8a] disabled:opacity-60"
            >
              <Lock className="h-4 w-4" />
              Chot tat ca
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1d5fa8] border-t-transparent" />
          </div>
        ) : (
          <RoomInputTable
            rows={rows}
            onView={(id) => navigate(`/meter-readings/${id}`)}
            onEdit={(id) => navigate(`/meter-readings/${id}/edit`)}
            onSave={(id) => lockMutation.mutate(id)}
          />
        )}
      </div>

      {/* Sticky bottom summary bar */}
      <InputSummaryBar
        totalRevenue={`${totalRevenue.toLocaleString('vi-VN')} VND`}
        totalElectric={`${totalElectric.toLocaleString('vi-VN')} kWh`}
        totalWater={`${totalWater.toLocaleString('vi-VN')} m3`}
      />
    </div>
  )
}
