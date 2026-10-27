import { useState, useMemo } from 'react'
import { Plus, Search } from 'lucide-react'
import { usePayments } from '@/hooks/use-payments'
import { useMotels } from '@/hooks/use-motels'
import { PaymentStatCards } from './components/payment-stat-cards'
import { PaymentTable } from './components/payment-table'
import { RecordPaymentModal } from './components/record-payment-modal'

const ITEMS_PER_PAGE = 20

const METHOD_FILTERS = [
  { value: '', label: 'Tat ca' },
  { value: 'CASH', label: 'Tien mat' },
  { value: 'BANK_TRANSFER', label: 'Chuyen khoan' },
  { value: 'OTHER', label: 'Khac' },
]

export function PaymentsPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [filterMotelId, setFilterMotelId] = useState('')
  const [filterMethod, setFilterMethod] = useState('')
  const [searchCode, setSearchCode] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showRecordModal, setShowRecordModal] = useState(false)

  const queryParams = useMemo(() => ({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    ...(filterMotelId ? { motelId: filterMotelId } : {}),
    ...(filterMethod ? { paymentMethod: filterMethod } : {}),
  }), [currentPage, filterMotelId, filterMethod])

  const { data: response, isLoading } = usePayments(queryParams)
  const { data: motelsResponse } = useMotels(1, 100)

  const payments = response?.data ?? []
  const meta = response?.meta ?? { total: 0, page: 1, limit: ITEMS_PER_PAGE, totalPages: 1 }
  const motels = motelsResponse?.data ?? []

  // Client-side filters: search by code + date range
  const filteredPayments = useMemo(() => {
    let result = payments
    if (searchCode.trim()) {
      const q = searchCode.trim().toLowerCase()
      result = result.filter(
        (p) =>
          p.paymentCode?.toLowerCase().includes(q) ||
          p.invoice?.invoiceCode?.toLowerCase().includes(q),
      )
    }
    if (dateFrom) {
      result = result.filter((p) => p.paymentDate >= dateFrom)
    }
    if (dateTo) {
      result = result.filter((p) => p.paymentDate <= dateTo + 'T23:59:59')
    }
    return result
  }, [payments, searchCode, dateFrom, dateTo])

  // Stats computed from current page data
  const totalAmount = useMemo(() => filteredPayments.reduce((s, p) => s + p.amount, 0), [filteredPayments])
  const cashCount = useMemo(() => filteredPayments.filter((p) => p.paymentMethod === 'CASH').length, [filteredPayments])
  const transferCount = useMemo(() => filteredPayments.filter((p) => p.paymentMethod === 'BANK_TRANSFER').length, [filteredPayments])

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-[#7b7a7d]">
        <span>Trang chu</span>
        <span>&rsaquo;</span>
        <span className="text-[#323235]">Thanh toan</span>
      </nav>

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#323235]">Quan ly Thanh toan</h2>
          <p className="mt-1 text-sm text-[#7b7a7d]">Lich su va ghi nhan thanh toan</p>
        </div>
        <button
          onClick={() => setShowRecordModal(true)}
          className="flex items-center gap-2 rounded-lg bg-[#1d5fa8] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#174d8a]"
        >
          <Plus className="h-4 w-4" />
          Ghi nhan thanh toan
        </button>
      </div>

      {/* Stat cards */}
      <PaymentStatCards
        totalCount={meta.total}
        totalAmount={totalAmount}
        cashCount={cashCount}
        transferCount={transferCount}
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search by payment/invoice code */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b7a7d]" />
          <input
            type="text"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            placeholder="Ma thanh toan, ma hoa don..."
            className="w-56 rounded-lg border border-gray-200 bg-white py-1.5 pl-9 pr-3 text-sm text-[#323235] placeholder:text-[#7b7a7d] focus:border-[#1d5fa8] focus:outline-none"
          />
        </div>

        {/* Date range */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1) }}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-[#323235] focus:border-[#1d5fa8] focus:outline-none"
          />
          <span className="text-xs text-[#7b7a7d]">—</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1) }}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-[#323235] focus:border-[#1d5fa8] focus:outline-none"
          />
          {(dateFrom || dateTo) && (
            <button
              onClick={() => { setDateFrom(''); setDateTo('') }}
              className="text-xs text-[#7b7a7d] hover:text-red-500"
            >
              Xoa
            </button>
          )}
        </div>

        {/* Motel filter */}
        {motels.length > 1 && (
          <select
            value={filterMotelId}
            onChange={(e) => { setFilterMotelId(e.target.value); setCurrentPage(1) }}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-[#323235] focus:border-[#1d5fa8] focus:outline-none"
          >
            <option value="">Tat ca nha tro</option>
            {motels.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        )}

        {/* Payment method filter */}
        <div className="flex items-center gap-1">
          <span className="mr-1 text-sm text-[#7b7a7d]">Phuong thuc:</span>
          {METHOD_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => { setFilterMethod(f.value); setCurrentPage(1) }}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                filterMethod === f.value
                  ? 'bg-[#1d5fa8] text-white'
                  : 'bg-white text-[#7b7a7d] hover:bg-gray-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading or table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1d5fa8] border-t-transparent" />
        </div>
      ) : (
        <PaymentTable
          payments={filteredPayments}
          meta={meta}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Record payment modal */}
      <RecordPaymentModal
        isOpen={showRecordModal}
        onClose={() => setShowRecordModal(false)}
      />
    </div>
  )
}
