import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, CheckCircle, AlertTriangle, Wallet, Receipt, Search, Plus } from 'lucide-react'
import { useInvoices } from '@/hooks/use-invoices'
import { InvoiceMotelSection } from './components/invoice-motel-section'
import type { Invoice, InvoiceStatus } from '@/types'

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; bg: string; text: string }> = {
  DRAFT: { label: 'Nhap', bg: 'bg-gray-100', text: 'text-gray-600' },
  ISSUED: { label: 'Da phat hanh', bg: 'bg-blue-50', text: 'text-blue-700' },
  PARTIALLY_PAID: { label: 'Thanh toan mot phan', bg: 'bg-yellow-50', text: 'text-yellow-700' },
  PAID: { label: 'Da thanh toan', bg: 'bg-green-50', text: 'text-green-700' },
  OVERDUE: { label: 'Qua han', bg: 'bg-red-50', text: 'text-red-700' },
}

function formatVnd(value: number): string {
  return value.toLocaleString('vi-VN') + ' d'
}

export function InvoicesPage() {
  const navigate = useNavigate()
  const now = new Date()
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterMonth] = useState(now.getMonth() + 1)
  const [filterYear] = useState(now.getFullYear())
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [searchCode, setSearchCode] = useState('')

  // Single query with high limit for client-side grouping
  const queryParams = useMemo(() => ({
    limit: 500,
    ...(filterStatus ? { status: filterStatus } : {}),
    ...(dateFrom || dateTo
      ? {
          ...(dateFrom ? { dateFrom } : {}),
          ...(dateTo ? { dateTo } : {}),
        }
      : {
          invoiceMonth: filterMonth,
          invoiceYear: filterYear,
        }),
  }), [filterStatus, filterMonth, filterYear, dateFrom, dateTo])

  const { data: response, isLoading } = useInvoices(queryParams)
  const allInvoices = response?.data ?? []

  // Client-side filter by invoiceCode search
  const filteredInvoices = useMemo(() => {
    if (!searchCode.trim()) return allInvoices
    const q = searchCode.trim().toLowerCase()
    return allInvoices.filter((i) => i.invoiceCode.toLowerCase().includes(q))
  }, [allInvoices, searchCode])

  // Stats from filtered invoices
  const stats = useMemo(() => {
    const totalAmount = filteredInvoices.reduce((s, i) => s + i.totalAmount, 0)
    const paidAmount = filteredInvoices.reduce((s, i) => s + i.paidAmount, 0)
    const debtAmount = totalAmount - paidAmount
    const overdueCount = filteredInvoices.filter((i) => i.status === 'OVERDUE').length
    return { totalCount: filteredInvoices.length, totalAmount, paidAmount, debtAmount, overdueCount }
  }, [filteredInvoices])

  // Group filtered invoices by motelId, sorted by motelName
  const groupedByMotel = useMemo(() => {
    const groups: Record<string, { motelName: string; invoices: Invoice[] }> = {}
    for (const inv of filteredInvoices) {
      const key = inv.motelId || '_unknown'
      if (!groups[key]) {
        groups[key] = { motelName: inv.motel?.name || 'Khong xac dinh', invoices: [] }
      }
      groups[key].invoices.push(inv)
    }
    return Object.entries(groups).sort(([, a], [, b]) => a.motelName.localeCompare(b.motelName))
  }, [filteredInvoices])

  const onlyOneGroup = groupedByMotel.length === 1

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-[#7b7a7d]">
        <span>Trang chu</span>
        <span>&rsaquo;</span>
        <span className="text-[#323235]">Hoa don</span>
      </nav>

      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[#323235]">Quan ly Hoa don</h2>
          <p className="mt-1 text-sm text-[#7b7a7d]">
            Theo doi va quan ly hoa don hang thang
          </p>
        </div>
        <button
          onClick={() => navigate('/invoices/new')}
          className="flex items-center gap-2 rounded-lg bg-[#1d5fa8] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#174d8a]"
        >
          <Plus className="h-4 w-4" />
          Tao hoa don
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard icon={FileText} iconBg="bg-[#c8e6ff]" iconColor="text-[#004c6e]" label="So luong hoa don" value={stats.totalCount} />
        <StatCard icon={Receipt} iconBg="bg-indigo-100" iconColor="text-indigo-700" label="Tong tien" value={formatVnd(stats.totalAmount)} isText />
        <StatCard icon={CheckCircle} iconBg="bg-[#dcfce7]" iconColor="text-green-700" label="Da thanh toan" value={formatVnd(stats.paidAmount)} isText />
        <StatCard icon={Wallet} iconBg="bg-amber-100" iconColor="text-amber-700" label="Du no" value={formatVnd(stats.debtAmount)} isText />
        <StatCard icon={AlertTriangle} iconBg="bg-[#ffedd5]" iconColor="text-orange-600" label="Qua han" value={stats.overdueCount} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b7a7d]" />
          <input
            type="text"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            placeholder="Tim ma hoa don..."
            className="w-52 rounded-lg border border-gray-200 bg-white py-1.5 pl-9 pr-3 text-sm text-[#323235] placeholder:text-[#7b7a7d] focus:border-[#1d5fa8] focus:outline-none"
          />
        </div>
        <span className="text-sm text-[#7b7a7d]">Trang thai:</span>
        {['', 'DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE'].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filterStatus === s
                ? 'bg-[#1d5fa8] text-white'
                : 'bg-white text-[#7b7a7d] hover:bg-gray-100'
            }`}
          >
            {s === '' ? 'Tat ca' : STATUS_CONFIG[s as InvoiceStatus]?.label ?? s}
          </button>
        ))}
      </div>

      {/* Date range filter */}
      <div className="flex flex-wrap items-end gap-4 rounded-xl bg-white p-4 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#7b7a7d]">Tu ngay</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#323235] focus:border-[#1d5fa8] focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#7b7a7d]">Den ngay</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#323235] focus:border-[#1d5fa8] focus:outline-none"
          />
        </div>
        {(dateFrom || dateTo) && (
          <button
            onClick={() => { setDateFrom(''); setDateTo('') }}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-[#7b7a7d] hover:bg-gray-50"
          >
            Xoa bo loc ngay
          </button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1d5fa8] border-t-transparent" />
        </div>
      ) : groupedByMotel.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
          <p className="text-sm text-[#7b7a7d]">Chua co hoa don nao.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {groupedByMotel.map(([motelId, { motelName, invoices }]) => (
            <InvoiceMotelSection
              key={motelId}
              motelName={motelName}
              invoices={invoices}
              hideHeader={onlyOneGroup}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, iconBg, iconColor, label, value, isText }: {
  icon: React.ComponentType<{ className?: string }>
  iconBg: string
  iconColor: string
  label: string
  value: number | string
  isText?: boolean
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <div>
        <p className="text-sm text-[#7b7a7d]">{label}</p>
        {isText
          ? <p className="text-lg font-semibold text-[#323235]">{value}</p>
          : <p className="text-2xl font-semibold text-[#323235]">{value}</p>
        }
      </div>
    </div>
  )
}
