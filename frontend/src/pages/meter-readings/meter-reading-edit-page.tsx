import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Zap, Droplets, User, Building2, Calendar, FileText, Lock, Trash2 } from 'lucide-react'
import { MeterReadingSummaryCard } from './components/meter-reading-summary-card'
import { useMeterReading, useUpdateMeterReading, useLockMeterReading } from '@/hooks/use-meter-readings'
import type { ReactNode } from 'react'

function fmt(v: number) { return new Intl.NumberFormat('vi-VN').format(v) + 'd' }
function fmtDate(s?: string) { return s ? new Date(s).toLocaleDateString('vi-VN') : '-' }

function NumericField({ label, value, onChange, readOnly, error }: {
  label: string; value: string; onChange?: (v: string) => void; readOnly?: boolean; error?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-[#7b7a7d]">{label}</label>
      {readOnly
        ? <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-medium text-[#323235]">{value}</div>
        : <>
            <input type="number" value={value} onChange={(e) => onChange?.(e.target.value)}
              className={`rounded-lg border px-3 py-2.5 text-sm text-[#323235] focus:outline-none ${error ? 'border-red-400' : 'border-gray-200 focus:border-[#1d5fa8]'}`} />
            {error && <p className="text-xs text-red-500">{error}</p>}
          </>}
    </div>
  )
}

function MeterCard({ icon, title, prev, setPrev, curr, setCurr, unit, setUnit, usage, total, currError, unitLabel }: {
  icon: ReactNode; title: string; prev: string; setPrev: (v: string) => void
  curr: string; setCurr: (v: string) => void; unit: string; setUnit: (v: string) => void
  usage: number; total: number; currError?: string; unitLabel: string
}) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
      <div className="mb-4 flex items-center gap-3">{icon}<h4 className="text-sm font-semibold text-[#323235]">{title}</h4></div>
      <div className="mb-4 border-t border-gray-100" />
      <div className="grid grid-cols-2 gap-4">
        <NumericField label={`Chi so cu (${unitLabel})`} value={prev} onChange={setPrev} />
        <NumericField label={`Chi so moi (${unitLabel})`} value={curr} onChange={setCurr} error={currError} />
        <NumericField label="Don gia (d)" value={unit} onChange={setUnit} />
        <NumericField label="Tieu thu" value={`${new Intl.NumberFormat('vi-VN').format(usage)} ${unitLabel}`} readOnly />
      </div>
      <div className="mt-4 flex justify-end gap-1 text-sm">
        <span className="text-[#7b7a7d]">Thanh tien:</span>
        <span className="font-semibold text-[#1d5fa8]">{fmt(total)}</span>
      </div>
    </div>
  )
}

export function MeterReadingEditPage() {
  const navigate = useNavigate()
  const { readingId: id } = useParams<{ readingId: string }>()
  const { data: reading, isLoading, isError } = useMeterReading(id ?? '')
  const updateMutation = useUpdateMeterReading()
  const lockMutation = useLockMeterReading()

  const [elecPrev, setElecPrev] = useState('')
  const [elecCurr, setElecCurr] = useState('')
  const [elecUnit, setElecUnit] = useState('')
  const [waterPrev, setWaterPrev] = useState('')
  const [waterCurr, setWaterCurr] = useState('')
  const [waterUnit, setWaterUnit] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (!reading) return
    if (reading.isLocked) {
      navigate('/meter-readings/' + id, { replace: true })
      return
    }
    setElecPrev(String(reading.electricityPrevious))
    setElecCurr(String(reading.electricityCurrent))
    setElecUnit(String(reading.electricityUnitPrice))
    setWaterPrev(String(reading.waterPrevious))
    setWaterCurr(String(reading.waterCurrent))
    setWaterUnit(String(reading.waterUnitPrice))
    setNotes(reading.note ?? '')
  }, [reading, id, navigate])

  const ep = Number(elecPrev) || 0, ec = Number(elecCurr) || 0, eu = Number(elecUnit) || 0
  const wp = Number(waterPrev) || 0, wc = Number(waterCurr) || 0, wu = Number(waterUnit) || 0
  const elecUsage = Math.max(0, ec - ep), elecTotal = elecUsage * eu
  const waterUsage = Math.max(0, wc - wp), waterTotal = waterUsage * wu
  const elecError = ec > 0 && ec < ep ? 'Chi so moi phai lon hon chi so cu' : undefined
  const waterError = wc > 0 && wc < wp ? 'Chi so moi phai lon hon chi so cu' : undefined
  const hasError = !!elecError || !!waterError

  function handleSave() {
    if (!id || hasError) return
    updateMutation.mutate(
      { id, data: { electricityPrevious: ep, electricityCurrent: ec, electricityUnitPrice: eu,
          waterPrevious: wp, waterCurrent: wc, waterUnitPrice: wu, note: notes || undefined } },
      { onSuccess: () => navigate(`/meter-readings/${id}`) },
    )
  }

  function handleLock() {
    if (!id) return
    lockMutation.mutate(id, {
      onSuccess: () => navigate(`/meter-readings/${id}`),
    })
  }

  function handleDelete() {
    if (!window.confirm('Ban co chac muon xoa chi so nay?')) return
    alert('Chuc nang xoa chua duoc ho tro')
  }

  const tenant = reading?.contract?.tenants?.find((t) => t.isRepresentative)?.tenant
  const summaryRows = [
    { label: 'Tien dien', value: fmt(elecTotal) },
    { label: 'Tien nuoc', value: fmt(waterTotal) },
    { label: 'Tong cong', value: fmt(elecTotal + waterTotal), dividerBefore: true, large: true },
  ]
  const infoItems = [
    { icon: <FileText className="h-4 w-4 text-[#7b7a7d]" />, label: 'Phong', value: reading?.room?.roomCode ?? '-' },
    { icon: <Building2 className="h-4 w-4 text-[#7b7a7d]" />, label: 'Toa nha', value: reading?.motel?.name ?? '-' },
    { icon: <User className="h-4 w-4 text-[#7b7a7d]" />, label: 'Khach thue', value: tenant?.fullName ?? '-' },
    { icon: <Calendar className="h-4 w-4 text-[#7b7a7d]" />, label: 'Ngay ghi', value: fmtDate(reading?.recordedDate ?? reading?.createdAt) },
  ]

  if (isLoading) return <div className="flex justify-center py-24"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1d5fa8] border-t-transparent" /></div>
  if (isError || !reading) return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <p className="text-sm text-red-500">Khong tim thay chi so. Vui long thu lai.</p>
      <button onClick={() => navigate('/meter-readings')} className="text-sm font-medium text-[#1d5fa8] hover:underline">Quay lai danh sach</button>
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      <nav className="flex items-center gap-1.5 text-xs text-[#7b7a7d]">
        <button onClick={() => navigate(`/meter-readings/${id}`)} className="flex items-center gap-1 hover:text-[#323235]">
          <ArrowLeft className="h-3.5 w-3.5" />Chi so dien nuoc
        </button>
        <span>&rsaquo;</span>
        <span className="text-[#323235]">Chinh sua</span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[#323235]">Chinh sua chi so - Phong {reading.room?.roomCode ?? '-'}</h2>
          <p className="mt-1 text-sm text-[#7b7a7d]">
            Ky ghi: Thang {reading.readingMonth}/{reading.readingYear}
            {reading.recordedDate && ` - Cap nhat: ${fmtDate(reading.recordedDate)}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Xoa
          </button>
          <button onClick={() => navigate(`/meter-readings/${id}`)} className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-[#323235] transition-colors hover:bg-gray-50">Huy</button>
          <button
            onClick={handleLock}
            disabled={lockMutation.isPending}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-60"
          >
            <Lock className="h-4 w-4" />
            {lockMutation.isPending ? 'Dang chot...' : 'Chot chi so'}
          </button>
          <button onClick={handleSave} disabled={hasError || updateMutation.isPending}
            className="flex items-center gap-2 rounded-lg bg-[#1d5fa8] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#174d8a] disabled:opacity-60">
            <Save className="h-4 w-4" />{updateMutation.isPending ? 'Dang luu...' : 'Luu thay doi'}
          </button>
        </div>
      </div>

      {updateMutation.isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">Luu that bai. Vui long thu lai.</div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-5">
          <MeterCard icon={<div className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-100"><Zap className="h-4 w-4 text-yellow-600" /></div>}
            title="Chi so dien" prev={elecPrev} setPrev={setElecPrev} curr={elecCurr} setCurr={setElecCurr}
            unit={elecUnit} setUnit={setElecUnit} usage={elecUsage} total={elecTotal} currError={elecError} unitLabel="kWh" />
          <MeterCard icon={<div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100"><Droplets className="h-4 w-4 text-blue-600" /></div>}
            title="Chi so nuoc" prev={waterPrev} setPrev={setWaterPrev} curr={waterCurr} setCurr={setWaterCurr}
            unit={waterUnit} setUnit={setWaterUnit} usage={waterUsage} total={waterTotal} currError={waterError} unitLabel="m3" />
        </div>
        <div className="flex flex-col gap-5">
          <MeterReadingSummaryCard title="Tong ket chi phi" rows={summaryRows} />
          <div className="rounded-xl bg-white p-6 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
            <h4 className="mb-4 text-sm font-semibold text-[#323235]">Thong tin bo sung</h4>
            {infoItems.map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-2">{item.icon}<span className="text-sm text-[#7b7a7d]">{item.label}</span></div>
                <span className="text-sm font-medium text-[#323235]">{item.value}</span>
              </div>
            ))}
          </div>
          <div className="rounded-xl bg-white p-6 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
            <h4 className="mb-3 text-sm font-semibold text-[#323235]">Ghi chu</h4>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4}
              className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-[#323235] focus:border-[#1d5fa8] focus:outline-none" />
          </div>
        </div>
      </div>
    </div>
  )
}
