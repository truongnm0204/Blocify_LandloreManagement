import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Save, X } from 'lucide-react'
import { useMotels } from '@/hooks/use-motels'
import { useRoomsByMotel } from '@/hooks/use-rooms'
import { useContracts } from '@/hooks/use-contracts'
import { useGenerateInvoice } from '@/hooks/use-invoices'
import type { AxiosError } from 'axios'

interface ApiErrorResponse {
  message: string | string[]
  statusCode?: number
}

function extractErrorMessage(err: unknown): string {
  const axiosErr = err as AxiosError<ApiErrorResponse>
  if (axiosErr?.response?.data?.message) {
    const msg = axiosErr.response.data.message
    return Array.isArray(msg) ? msg.join(', ') : msg
  }
  if (err instanceof Error) return err.message
  return 'Co loi xay ra, vui long thu lai'
}

function formatVnd(value: number): string {
  return value.toLocaleString('vi-VN') + ' d'
}

export function InvoiceGeneratePage() {
  const navigate = useNavigate()
  const now = new Date()

  const [selectedMotelId, setSelectedMotelId] = useState('')
  const [selectedRoomId, setSelectedRoomId] = useState('')
  const [month, setMonth] = useState(String(now.getMonth() + 1))
  const [year, setYear] = useState(String(now.getFullYear()))
  const [billingDate, setBillingDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [surcharge, setSurcharge] = useState('')
  const [discount, setDiscount] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)

  const { data: motelsResponse } = useMotels(1, 100)
  const motels = motelsResponse?.data ?? []

  const { data: roomsResponse } = useRoomsByMotel(selectedMotelId || undefined)
  const rooms = roomsResponse?.data ?? []

  const { data: contractsResponse } = useContracts(
    selectedRoomId ? { roomId: selectedRoomId, status: 'ACTIVE', limit: 1 } : { limit: 0 }
  )
  const activeContract = selectedRoomId ? (contractsResponse?.data?.[0] ?? null) : null

  const generateInvoice = useGenerateInvoice()

  function handleMotelChange(motelId: string) {
    setSelectedMotelId(motelId)
    setSelectedRoomId('')
    setError(null)
  }

  function handleRoomChange(roomId: string) {
    setSelectedRoomId(roomId)
    setError(null)
  }

  async function handleSubmit() {
    setError(null)

    if (!selectedMotelId) {
      setError('Vui long chon toa nha')
      return
    }
    if (!selectedRoomId) {
      setError('Vui long chon phong')
      return
    }
    if (!activeContract) {
      setError('Phong nay khong co hop dong dang hoat dong')
      return
    }
    if (!month || !year) {
      setError('Vui long chon ky hoa don')
      return
    }

    try {
      const payload = {
        contractId: activeContract.id,
        invoiceMonth: Number(month),
        invoiceYear: Number(year),
        billingDate: billingDate || undefined,
        dueDate: dueDate || undefined,
        surchargeAmount: surcharge ? Number(surcharge) : undefined,
        discountAmount: discount ? Number(discount) : undefined,
        note: note || undefined,
      }
      await generateInvoice.mutateAsync(payload)
      navigate('/invoices')
    } catch (err: unknown) {
      setError(extractErrorMessage(err))
    }
  }

  const representativeTenant = activeContract?.contractTenants?.find((ct) => ct.isRepresentative)?.tenant
    ?? activeContract?.representativeTenant

  const yearOptions = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i)

  return (
    <div className="mx-auto max-w-[800px]">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1 text-sm text-[#7b7a7d]">
        <button onClick={() => navigate('/invoices')} className="hover:text-[#323235]">
          Hoa don
        </button>
        <ChevronRight className="h-3 w-3" />
        <span className="text-[#323235]">Tao hoa don</span>
      </nav>

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[#323235]">Tao hoa don thu cong</h2>
          <p className="mt-1 text-sm text-[#7b7a7d]">Tao hoa don thu cong cho hop dong dang hoat dong</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/invoices')}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-[#323235] transition-colors hover:bg-gray-50"
          >
            <X className="h-4 w-4" />
            Huy
          </button>
          <button
            onClick={handleSubmit}
            disabled={generateInvoice.isPending}
            className="flex items-center gap-2 rounded-lg bg-[#1d5fa8] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#174d8a] disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {generateInvoice.isPending ? 'Dang tao...' : 'Tao hoa don'}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-5">
        {/* Selection card */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-[#323235]">Chon phong</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Motel */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#7b7a7d]">
                Toa nha <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedMotelId}
                onChange={(e) => handleMotelChange(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#323235] focus:border-[#1d5fa8] focus:outline-none"
              >
                <option value="">-- Chon toa nha --</option>
                {motels.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            {/* Room */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#7b7a7d]">
                Phong <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedRoomId}
                onChange={(e) => handleRoomChange(e.target.value)}
                disabled={!selectedMotelId}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#323235] focus:border-[#1d5fa8] focus:outline-none disabled:bg-gray-50 disabled:text-[#7b7a7d]"
              >
                <option value="">-- Chon phong --</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>{r.roomCode} - {r.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Contract info (read-only) */}
        {selectedRoomId && (
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-[#323235]">Thong tin hop dong</h3>
            {activeContract ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-[#7b7a7d]">Khach thue dai dien</p>
                  <p className="mt-1 text-sm font-medium text-[#323235]">
                    {representativeTenant?.fullName ?? '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#7b7a7d]">Tien thue</p>
                  <p className="mt-1 text-sm font-medium text-[#323235]">
                    {formatVnd(activeContract.rentAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#7b7a7d]">Ma hop dong</p>
                  <p className="mt-1 text-sm text-[#323235]">{activeContract.contractCode ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-[#7b7a7d]">Trang thai</p>
                  <span className="mt-1 inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                    Dang hoat dong
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#7b7a7d]">Phong nay khong co hop dong dang hoat dong.</p>
            )}
          </div>
        )}

        {/* Invoice period */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-[#323235]">Ky hoa don</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#7b7a7d]">
                Thang <span className="text-red-500">*</span>
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#323235] focus:border-[#1d5fa8] focus:outline-none"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>Thang {m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#7b7a7d]">
                Nam <span className="text-red-500">*</span>
              </label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#323235] focus:border-[#1d5fa8] focus:outline-none"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#7b7a7d]">Ngay lap hoa don</label>
              <input
                type="date"
                value={billingDate}
                onChange={(e) => setBillingDate(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#323235] focus:border-[#1d5fa8] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#7b7a7d]">Han thanh toan</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#323235] focus:border-[#1d5fa8] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Additional charges */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-[#323235]">Phu phi & Giam gia</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#7b7a7d]">Phu phi (VND)</label>
              <input
                type="number"
                min="0"
                value={surcharge}
                onChange={(e) => setSurcharge(e.target.value)}
                placeholder="0"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#323235] placeholder:text-[#7b7a7d] focus:border-[#1d5fa8] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#7b7a7d]">Giam gia (VND)</label>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="0"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#323235] placeholder:text-[#7b7a7d] focus:border-[#1d5fa8] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-[#323235]">Ghi chu</h3>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Ghi chu them (tuy chon)..."
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#323235] placeholder:text-[#7b7a7d] focus:border-[#1d5fa8] focus:outline-none"
          />
        </div>
      </div>
    </div>
  )
}
