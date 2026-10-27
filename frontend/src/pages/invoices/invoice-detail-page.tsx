import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Printer } from 'lucide-react'
import { useInvoice } from '@/hooks/use-invoices'
import { RecordPaymentModal } from '@/pages/payments/components/record-payment-modal'
import { openPrintWindow } from '@/lib/print-utils'
import { buildInvoicePrintHtml } from './components/invoice-print-template'
import type { InvoiceStatus, InvoiceItemType, PaymentMethod } from '@/types'

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; bg: string; text: string }> = {
  DRAFT: { label: 'Nhap', bg: 'bg-gray-100', text: 'text-gray-600' },
  ISSUED: { label: 'Da phat hanh', bg: 'bg-blue-50', text: 'text-blue-700' },
  PARTIALLY_PAID: { label: 'Thanh toan mot phan', bg: 'bg-yellow-50', text: 'text-yellow-700' },
  PAID: { label: 'Da thanh toan', bg: 'bg-green-50', text: 'text-green-700' },
  OVERDUE: { label: 'Qua han', bg: 'bg-red-50', text: 'text-red-700' },
}

const ITEM_TYPE_LABELS: Record<InvoiceItemType, string> = {
  ROOM_RENT: 'Tien phong',
  ELECTRICITY: 'Tien dien',
  WATER: 'Tien nuoc',
  SERVICE_FEE: 'Phi dich vu',
  SURCHARGE: 'Phu thu',
  DISCOUNT: 'Giam gia',
  OTHER: 'Khac',
}

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: 'Tien mat',
  BANK_TRANSFER: 'Chuyen khoan',
  OTHER: 'Khac',
}

function formatVnd(value: number): string {
  return value.toLocaleString('vi-VN') + ' d'
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('vi-VN')
  } catch {
    return dateStr
  }
}

export function InvoiceDetailPage() {
  const { invoiceId } = useParams<{ invoiceId: string }>()
  const navigate = useNavigate()
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const { data: invoice, isLoading } = useInvoice(invoiceId ?? '')

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1d5fa8] border-t-transparent" />
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-[#7b7a7d]">Khong tim thay hoa don.</p>
      </div>
    )
  }

  const remaining = invoice.totalAmount - invoice.paidAmount
  const canPay = ['ISSUED', 'PARTIALLY_PAID', 'OVERDUE'].includes(invoice.status)
  const statusCfg = STATUS_CONFIG[invoice.status] ?? STATUS_CONFIG.DRAFT

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-[#7b7a7d]">
        <span>Trang chu</span>
        <span>&rsaquo;</span>
        <button onClick={() => navigate('/invoices')} className="hover:text-[#323235]">Hoa don</button>
        <span>&rsaquo;</span>
        <span className="text-[#323235]">Chi tiet</span>
      </nav>

      {/* Back button + header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/invoices')}
            className="rounded-lg p-2 text-[#7b7a7d] hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-[#323235]">{invoice.invoiceCode}</h2>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusCfg.bg} ${statusCfg.text}`}>
                {statusCfg.label}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-[#7b7a7d]">
              Ky {invoice.invoiceMonth}/{invoice.invoiceYear}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => openPrintWindow({
              title: `Hoa don ${invoice.invoiceCode}`,
              content: buildInvoicePrintHtml(invoice),
            })}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-[#323235] hover:bg-gray-50"
          >
            <Printer className="h-4 w-4" />
            In hoa don
          </button>
          {canPay && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="flex items-center gap-2 rounded-lg bg-[#1d5fa8] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#174d8a]"
            >
              <Plus className="h-4 w-4" />
              Ghi nhan thanh toan
            </button>
          )}
        </div>
      </div>

      {/* Invoice info card */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-white p-5 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
          <h3 className="mb-3 text-sm font-semibold uppercase text-[#7b7a7d]">Thong tin hoa don</h3>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-[#7b7a7d]">Toa nha</span>
              <span className="text-sm font-medium text-[#323235]">{invoice.motel?.name ?? '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7b7a7d]">Phong</span>
              <span className="font-medium text-[#323235]">{invoice.room?.roomCode ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7b7a7d]">Nguoi thue</span>
              <span className="font-medium text-[#323235]">{invoice.representativeTenant?.fullName ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7b7a7d]">Ngay lap</span>
              <span className="text-[#323235]">{formatDate(invoice.billingDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7b7a7d]">Han tra</span>
              <span className="text-[#323235]">{invoice.dueDate ? formatDate(invoice.dueDate) : '—'}</span>
            </div>
          </div>
        </div>

        {/* Payment summary */}
        <div className="rounded-xl bg-white p-5 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
          <h3 className="mb-3 text-sm font-semibold uppercase text-[#7b7a7d]">Thanh toan</h3>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#7b7a7d]">Tong cong</span>
              <span className="font-medium text-[#323235]">{formatVnd(invoice.totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7b7a7d]">Da thanh toan</span>
              <span className="font-medium text-green-700">{formatVnd(invoice.paidAmount)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-2">
              <span className="font-medium text-[#323235]">Con lai</span>
              <span className={`font-semibold ${remaining > 0 ? 'text-red-600' : 'text-green-700'}`}>
                {formatVnd(remaining)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Line items table */}
      <div className="rounded-xl bg-white shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
        <div className="px-5 pt-5 pb-3">
          <h3 className="text-sm font-semibold uppercase text-[#7b7a7d]">Chi tiet hoa don</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase text-[#7b7a7d]">
                <th className="px-5 py-3">Muc</th>
                <th className="px-5 py-3">Mo ta</th>
                <th className="px-5 py-3 text-right">So luong</th>
                <th className="px-5 py-3 text-right">Don gia</th>
                <th className="px-5 py-3 text-right">Thanh tien</th>
              </tr>
            </thead>
            <tbody>
              {(invoice.invoiceItems ?? []).map((item) => (
                <tr key={item.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-5 py-3 text-sm font-medium text-[#323235]">
                    {ITEM_TYPE_LABELS[item.itemType] ?? item.itemType}
                  </td>
                  <td className="px-5 py-3 text-sm text-[#7b7a7d]">{item.description}</td>
                  <td className="px-5 py-3 text-right text-sm text-[#7b7a7d]">
                    {item.quantity ?? '—'}
                  </td>
                  <td className="px-5 py-3 text-right text-sm text-[#7b7a7d]">
                    {item.unitPrice ? formatVnd(item.unitPrice) : '—'}
                  </td>
                  <td className="px-5 py-3 text-right text-sm font-medium text-[#323235]">
                    {formatVnd(item.amount)}
                  </td>
                </tr>
              ))}
              {/* Total row */}
              <tr className="bg-[#f5f6fa]">
                <td colSpan={4} className="px-5 py-3 text-right text-sm font-semibold text-[#323235]">
                  Tong cong
                </td>
                <td className="px-5 py-3 text-right text-sm font-semibold text-[#323235]">
                  {formatVnd(invoice.totalAmount)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment history */}
      <div className="rounded-xl bg-white shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
        <div className="px-5 pt-5 pb-3">
          <h3 className="text-sm font-semibold uppercase text-[#7b7a7d]">Lich su thanh toan</h3>
        </div>
        {(invoice.payments ?? []).length === 0 ? (
          <div className="px-5 pb-5">
            <p className="text-sm text-[#7b7a7d]">Chua co thanh toan nao.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase text-[#7b7a7d]">
                  <th className="px-5 py-3">Ma TT</th>
                  <th className="px-5 py-3 text-right">So tien</th>
                  <th className="px-5 py-3">Ngay</th>
                  <th className="px-5 py-3">Phuong thuc</th>
                  <th className="px-5 py-3">Ma tham chieu</th>
                  <th className="px-5 py-3">Ghi chu</th>
                </tr>
              </thead>
              <tbody>
                {(invoice.payments ?? []).map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-5 py-3 text-sm font-medium text-[#323235]">{p.paymentCode ?? '—'}</td>
                    <td className="px-5 py-3 text-right text-sm font-medium text-[#323235]">{formatVnd(p.amount)}</td>
                    <td className="px-5 py-3 text-sm text-[#7b7a7d]">{formatDate(p.paymentDate)}</td>
                    <td className="px-5 py-3 text-sm text-[#7b7a7d]">{PAYMENT_METHOD_LABELS[p.paymentMethod] ?? p.paymentMethod}</td>
                    <td className="px-5 py-3 text-sm text-[#7b7a7d]">{p.referenceNumber || '—'}</td>
                    <td className="px-5 py-3 text-sm text-[#7b7a7d]">{p.note || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record payment modal */}
      <RecordPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        preselectedInvoiceId={invoiceId}
      />
    </div>
  )
}
