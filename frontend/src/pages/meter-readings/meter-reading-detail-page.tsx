import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2, User, Building2, Calendar, FileText, Lock } from 'lucide-react'
import { MeterReadingInfoCard } from './components/meter-reading-info-card'
import { MeterReadingSummaryCard } from './components/meter-reading-summary-card'
import { useMeterReading, useMeterReadings, useLockMeterReading } from '@/hooks/use-meter-readings'

function fmt(value: number): string {
  return new Intl.NumberFormat('vi-VN').format(value) + 'd'
}

function fmtDate(dateStr?: string): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('vi-VN')
}

function StatusBadge({ locked }: { locked: boolean }) {
  return locked ? (
    <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">Da chot</span>
  ) : (
    <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-700">Chua chot</span>
  )
}

export function MeterReadingDetailPage() {
  const navigate = useNavigate()
  const { readingId: id } = useParams<{ readingId: string }>()
  const { data: reading, isLoading, isError, refetch } = useMeterReading(id ?? '')
  const lockMutation = useLockMeterReading()

  const { data: historyData } = useMeterReadings(
    reading?.room?.id ? { roomId: reading.room.id, limit: 50 } : {}
  )
  const historyReadings = historyData?.data ?? []

  function handleLock() {
    if (!id) return
    lockMutation.mutate(id, {
      onSuccess: () => refetch(),
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1d5fa8] border-t-transparent" />
      </div>
    )
  }

  if (isError || !reading) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <p className="text-sm text-red-500">Khong tim thay chi so. Vui long thu lai.</p>
        <button
          onClick={() => navigate('/meter-readings')}
          className="text-sm font-medium text-[#1d5fa8] hover:underline"
        >
          Quay lai danh sach
        </button>
      </div>
    )
  }

  const elecTotal = reading.electricityUsage * reading.electricityUnitPrice
  const waterTotal = reading.waterUsage * reading.waterUnitPrice
  const grandTotal = elecTotal + waterTotal

  const tenant = reading.contract?.tenants?.find((t) => t.isRepresentative)?.tenant

  const electricRows = [
    { label: 'Chi so cu', value: `${reading.electricityPrevious.toLocaleString('vi-VN')} kWh` },
    { label: 'Chi so moi', value: `${reading.electricityCurrent.toLocaleString('vi-VN')} kWh` },
    { label: 'Tieu thu', value: `${reading.electricityUsage.toLocaleString('vi-VN')} kWh`, bold: true, dividerBefore: true },
    { label: 'Don gia', value: `${reading.electricityUnitPrice.toLocaleString('vi-VN')}d/kWh`, dividerBefore: true },
    { label: 'Thanh tien', value: fmt(elecTotal), bold: true, blue: true },
  ]

  const waterRows = [
    { label: 'Chi so cu', value: `${reading.waterPrevious.toLocaleString('vi-VN')} m3` },
    { label: 'Chi so moi', value: `${reading.waterCurrent.toLocaleString('vi-VN')} m3` },
    { label: 'Tieu thu', value: `${reading.waterUsage.toLocaleString('vi-VN')} m3`, bold: true, dividerBefore: true },
    { label: 'Don gia', value: `${reading.waterUnitPrice.toLocaleString('vi-VN')}d/m3`, dividerBefore: true },
    { label: 'Thanh tien', value: fmt(waterTotal), bold: true, blue: true },
  ]

  const summaryRows = [
    { label: 'Tien dien', value: fmt(elecTotal) },
    { label: 'Tien nuoc', value: fmt(waterTotal) },
    { label: 'Tong cong', value: fmt(grandTotal), dividerBefore: true, large: true },
  ]

  const additionalItems = [
    { icon: <User className="h-4 w-4 text-[#7b7a7d]" />, label: 'Khach thue', value: tenant?.fullName ?? '-' },
    { icon: <Calendar className="h-4 w-4 text-[#7b7a7d]" />, label: 'Ngay ghi', value: fmtDate(reading.recordedDate ?? reading.createdAt) },
    { icon: <FileText className="h-4 w-4 text-[#7b7a7d]" />, label: 'Phong', value: reading.room?.roomCode ?? reading.room?.roomName ?? '-' },
    { icon: <Building2 className="h-4 w-4 text-[#7b7a7d]" />, label: 'Toa nha', value: reading.motel?.name ?? '-' },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-[#7b7a7d]">
        <button onClick={() => navigate('/meter-readings')} className="flex items-center gap-1 hover:text-[#323235]">
          <ArrowLeft className="h-3.5 w-3.5" />
          Chi so dien nuoc
        </button>
        <span>&rsaquo;</span>
        <span className="text-[#323235]">Chi tiet</span>
      </nav>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <h2 className="text-xl font-semibold text-[#323235]">
              Chi tiet chi so - Phong {reading.room?.roomCode ?? '-'}
            </h2>
            <StatusBadge locked={reading.isLocked} />
          </div>
          <p className="text-sm text-[#7b7a7d]">
            Ky ghi: Thang {reading.readingMonth}/{reading.readingYear}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!reading.isLocked && (
            <>
              <button
                onClick={() => navigate(`/meter-readings/${reading.id}/edit`)}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-[#323235] transition-colors hover:bg-gray-50"
              >
                <Pencil className="h-4 w-4" />
                Chinh sua
              </button>
              <button
                onClick={handleLock}
                disabled={lockMutation.isPending}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-60"
              >
                <Lock className="h-4 w-4" />
                {lockMutation.isPending ? 'Dang chot...' : 'Chot chi so'}
              </button>
            </>
          )}
          <button className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50">
            <Trash2 className="h-4 w-4" />
            Xoa
          </button>
        </div>
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Left column */}
        <div className="flex flex-col gap-5">
          <MeterReadingInfoCard title="Thong tin chi so dien" rows={electricRows} />
          <MeterReadingInfoCard title="Thong tin chi so nuoc" rows={waterRows} />
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5">
          <MeterReadingSummaryCard title="Tong ket" rows={summaryRows} />
          <div className="rounded-xl bg-white p-6 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
            <h4 className="mb-4 text-sm font-semibold text-[#323235]">Thong tin bo sung</h4>
            <div className="space-y-0">
              {additionalItems.map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-2">
                    {item.icon}
                    <span className="text-sm text-[#7b7a7d]">{item.label}</span>
                  </div>
                  <span className="text-sm font-medium text-[#323235]">{item.value}</span>
                </div>
              ))}
            </div>
            {reading.note && (
              <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2.5">
                <p className="text-xs text-[#7b7a7d]">Ghi chu</p>
                <p className="mt-0.5 text-sm text-[#323235]">{reading.note}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* History table */}
      {historyReadings.length > 0 && (
        <div className="rounded-xl bg-white p-6 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
          <h4 className="mb-4 text-sm font-semibold text-[#323235]">Lich su ghi chi so</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-3 pr-4 text-left text-xs font-medium text-[#7b7a7d]">Ky ghi</th>
                  <th className="pb-3 pr-4 text-left text-xs font-medium text-[#7b7a7d]">Chi so dien</th>
                  <th className="pb-3 pr-4 text-left text-xs font-medium text-[#7b7a7d]">Chi so nuoc</th>
                  <th className="pb-3 pr-4 text-left text-xs font-medium text-[#7b7a7d]">Trang thai</th>
                  <th className="pb-3 text-left text-xs font-medium text-[#7b7a7d]">Ngay ghi</th>
                </tr>
              </thead>
              <tbody>
                {historyReadings.map((r) => {
                  const isCurrent = r.id === reading.id
                  return (
                    <tr
                      key={r.id}
                      className={`border-b border-gray-50 last:border-0 ${isCurrent ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                    >
                      <td className={`py-3 pr-4 font-medium ${isCurrent ? 'text-[#1d5fa8]' : 'text-[#323235]'}`}>
                        Thang {r.readingMonth}/{r.readingYear}
                      </td>
                      <td className="py-3 pr-4 text-[#323235]">
                        {r.electricityPrevious.toLocaleString('vi-VN')} &rarr; {r.electricityCurrent.toLocaleString('vi-VN')}
                      </td>
                      <td className="py-3 pr-4 text-[#323235]">
                        {r.waterPrevious.toLocaleString('vi-VN')} &rarr; {r.waterCurrent.toLocaleString('vi-VN')}
                      </td>
                      <td className="py-3 pr-4">
                        <StatusBadge locked={r.isLocked} />
                      </td>
                      <td className="py-3 text-[#7b7a7d]">
                        {fmtDate(r.recordedDate ?? r.createdAt)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
