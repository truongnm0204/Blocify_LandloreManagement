import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PaymentWithRelations, PaymentMethod } from '@/types'

interface PaymentTableProps {
  payments: PaymentWithRelations[]
  meta: { total: number; page: number; limit: number; totalPages: number }
  currentPage: number
  onPageChange: (page: number) => void
}

const PAYMENT_METHOD_CONFIG: Record<PaymentMethod, { label: string; bg: string; text: string }> = {
  CASH: { label: 'Tien mat', bg: 'bg-green-50', text: 'text-green-700' },
  BANK_TRANSFER: { label: 'Chuyen khoan', bg: 'bg-blue-50', text: 'text-blue-700' },
  OTHER: { label: 'Khac', bg: 'bg-gray-100', text: 'text-gray-600' },
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

function MethodBadge({ method }: { method: PaymentMethod }) {
  const cfg = PAYMENT_METHOD_CONFIG[method] ?? PAYMENT_METHOD_CONFIG.OTHER
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  )
}

export function PaymentTable({ payments, meta, currentPage, onPageChange }: PaymentTableProps) {
  if (payments.length === 0) {
    return (
      <div className="rounded-xl bg-white p-8 text-center shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
        <p className="text-sm text-[#7b7a7d]">Chua co thanh toan nao.</p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl bg-white shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase text-[#7b7a7d]">
              <th className="px-5 py-3">Ma thanh toan</th>
              <th className="px-5 py-3">Ma hoa don</th>
              <th className="px-5 py-3 text-right">So tien</th>
              <th className="px-5 py-3">Ngay thanh toan</th>
              <th className="px-5 py-3">Phuong thuc</th>
              <th className="px-5 py-3">Ma tham chieu</th>
              <th className="px-5 py-3">Nguoi ghi nhan</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr
                key={p.id}
                className="border-b border-gray-50 transition-colors last:border-0 hover:bg-gray-50"
              >
                <td className="px-5 py-4 text-sm font-medium text-[#323235]">
                  {p.paymentCode ?? '—'}
                </td>
                <td className="px-5 py-4 text-sm text-[#323235]">
                  {p.invoice?.invoiceCode ?? '—'}
                </td>
                <td className="px-5 py-4 text-right text-sm font-medium text-[#323235]">
                  {formatVnd(p.amount)}
                </td>
                <td className="px-5 py-4 text-sm text-[#7b7a7d]">
                  {formatDate(p.paymentDate)}
                </td>
                <td className="px-5 py-4">
                  <MethodBadge method={p.paymentMethod} />
                </td>
                <td className="px-5 py-4 text-sm text-[#7b7a7d]">
                  {p.referenceNumber || '—'}
                </td>
                <td className="px-5 py-4 text-sm text-[#7b7a7d]">
                  {p.recordedBy?.fullName ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between px-1 py-3">
          <p className="text-sm text-[#7b7a7d]">
            Trang {meta.page} / {meta.totalPages} ({meta.total} thanh toan)
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              className="rounded-lg p-1.5 text-[#7b7a7d] transition-colors hover:bg-gray-100 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`min-w-[32px] rounded-lg px-2.5 py-1 text-sm font-medium transition-colors ${
                  page === currentPage
                    ? 'bg-[#1d5fa8] text-white'
                    : 'text-[#7b7a7d] hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => onPageChange(Math.min(meta.totalPages, currentPage + 1))}
              disabled={currentPage >= meta.totalPages}
              className="rounded-lg p-1.5 text-[#7b7a7d] transition-colors hover:bg-gray-100 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
