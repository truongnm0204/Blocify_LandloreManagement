import { useState } from 'react'
import { X } from 'lucide-react'
import { useCreatePayment } from '@/hooks/use-payments'
import { useInvoice } from '@/hooks/use-invoices'
import type { PaymentMethod } from '@/types'

interface RecordPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  preselectedInvoiceId?: string
}

const METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'CASH', label: 'Tien mat' },
  { value: 'BANK_TRANSFER', label: 'Chuyen khoan' },
  { value: 'OTHER', label: 'Khac' },
]

function formatVnd(value: number): string {
  return value.toLocaleString('vi-VN') + ' d'
}

function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function RecordPaymentModal({ isOpen, onClose, preselectedInvoiceId }: RecordPaymentModalProps) {
  const [invoiceId, setInvoiceId] = useState(preselectedInvoiceId ?? '')
  const [amount, setAmount] = useState('')
  const [paymentDate, setPaymentDate] = useState(todayISO())
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH')
  const [referenceNumber, setReferenceNumber] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  const createPayment = useCreatePayment()

  // Fetch invoice info when invoiceId is set (for balance display)
  const { data: invoice } = useInvoice(invoiceId)
  const remaining = invoice ? invoice.totalAmount - invoice.paidAmount : null

  const resetForm = () => {
    if (!preselectedInvoiceId) setInvoiceId('')
    setAmount('')
    setPaymentDate(todayISO())
    setPaymentMethod('CASH')
    setReferenceNumber('')
    setNote('')
    setError('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!invoiceId.trim()) {
      setError('Vui long nhap ma hoa don')
      return
    }

    const numAmount = Number(amount)
    if (!numAmount || numAmount <= 0) {
      setError('So tien phai lon hon 0')
      return
    }

    if (remaining !== null && numAmount > remaining) {
      setError(`So tien vuot qua so du con lai (${formatVnd(remaining)})`)
      return
    }

    try {
      await createPayment.mutateAsync({
        invoiceId: invoiceId.trim(),
        amount: numAmount,
        paymentDate,
        paymentMethod,
        ...(referenceNumber ? { referenceNumber } : {}),
        ...(note ? { note } : {}),
      })
      handleClose()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg || 'Ghi nhan thanh toan that bai')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#323235]">Ghi nhan thanh toan</h3>
          <button onClick={handleClose} className="rounded-lg p-1 text-[#7b7a7d] hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Invoice ID */}
          {!preselectedInvoiceId && (
            <div>
              <label className="mb-1 block text-sm font-medium text-[#323235]">Ma hoa don (Invoice ID)</label>
              <input
                type="text"
                value={invoiceId}
                onChange={(e) => setInvoiceId(e.target.value)}
                placeholder="Nhap Invoice ID"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#323235] placeholder:text-[#7b7a7d] focus:border-[#1d5fa8] focus:outline-none"
              />
            </div>
          )}

          {/* Remaining balance info */}
          {invoice && remaining !== null && (
            <div className="rounded-lg bg-[#f5f6fa] px-4 py-3">
              <p className="text-sm text-[#7b7a7d]">
                Hoa don: <span className="font-medium text-[#323235]">{invoice.invoiceCode}</span>
              </p>
              <p className="text-sm text-[#7b7a7d]">
                Tong tien: <span className="font-medium text-[#323235]">{formatVnd(invoice.totalAmount)}</span>
                {' | '}Da tra: <span className="font-medium text-[#323235]">{formatVnd(invoice.paidAmount)}</span>
                {' | '}Con lai: <span className="font-medium text-[#1d5fa8]">{formatVnd(remaining)}</span>
              </p>
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#323235]">So tien (VND)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={1}
              placeholder="0"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#323235] placeholder:text-[#7b7a7d] focus:border-[#1d5fa8] focus:outline-none"
            />
          </div>

          {/* Payment date */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#323235]">Ngay thanh toan</label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#323235] focus:border-[#1d5fa8] focus:outline-none"
            />
          </div>

          {/* Payment method */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#323235]">Phuong thuc thanh toan</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#323235] focus:border-[#1d5fa8] focus:outline-none"
            >
              {METHODS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Reference number */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#323235]">Ma tham chieu</label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="VD: TXN-12345"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#323235] placeholder:text-[#7b7a7d] focus:border-[#1d5fa8] focus:outline-none"
            />
          </div>

          {/* Note */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#323235]">Ghi chu</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Ghi chu them..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#323235] placeholder:text-[#7b7a7d] focus:border-[#1d5fa8] focus:outline-none"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-[#7b7a7d] hover:bg-gray-100"
            >
              Huy
            </button>
            <button
              type="submit"
              disabled={createPayment.isPending}
              className="rounded-lg bg-[#1d5fa8] px-4 py-2 text-sm font-medium text-white hover:bg-[#174d8a] disabled:opacity-50"
            >
              {createPayment.isPending ? 'Dang xu ly...' : 'Ghi nhan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
