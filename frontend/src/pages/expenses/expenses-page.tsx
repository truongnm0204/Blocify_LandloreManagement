import { useState, useMemo } from 'react'
import {
  Plus, Wallet, Wrench, Zap, Package, Sparkles, Shield,
  ChevronLeft, ChevronRight, Search, CheckCircle, XCircle, Banknote,
} from 'lucide-react'
import { useExpenses, useUpdateExpense } from '@/hooks/use-expenses'
import { ExpenseFormModal } from './components/expense-form-modal'
import { useMotels } from '@/hooks/use-motels'
import type { Expense, ExpenseCategory, ExpenseStatus } from '@/types'

const ITEMS_PER_PAGE = 20

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

const CATEGORY_CONFIG: Record<ExpenseCategory, { label: string; icon: typeof Wallet; iconBg: string; iconColor: string }> = {
  MAINTENANCE: { label: 'Bao tri', icon: Wrench, iconBg: 'bg-orange-100', iconColor: 'text-orange-600' },
  UTILITIES: { label: 'Dien nuoc', icon: Zap, iconBg: 'bg-yellow-100', iconColor: 'text-yellow-600' },
  SUPPLIES: { label: 'Vat tu', icon: Package, iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
  CLEANING: { label: 'Ve sinh', icon: Sparkles, iconBg: 'bg-green-100', iconColor: 'text-green-600' },
  SECURITY: { label: 'Bao ve', icon: Shield, iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
  OTHER: { label: 'Khac', icon: Wallet, iconBg: 'bg-gray-100', iconColor: 'text-gray-600' },
}

const STATUS_CONFIG: Record<ExpenseStatus, { label: string; bg: string; text: string }> = {
  PENDING: { label: 'Cho duyet', bg: 'bg-yellow-50', text: 'text-yellow-700' },
  APPROVED: { label: 'Da duyet', bg: 'bg-blue-50', text: 'text-blue-700' },
  PAID: { label: 'Da thanh toan', bg: 'bg-green-50', text: 'text-green-700' },
  CANCELLED: { label: 'Da huy', bg: 'bg-red-50', text: 'text-red-700' },
}

const STATUS_FILTERS: { value: ExpenseStatus | ''; label: string }[] = [
  { value: '', label: 'Tat ca' },
  { value: 'PENDING', label: 'Cho duyet' },
  { value: 'APPROVED', label: 'Da duyet' },
  { value: 'PAID', label: 'Da thanh toan' },
  { value: 'CANCELLED', label: 'Da huy' },
]

const CATEGORY_FILTERS: { value: ExpenseCategory | ''; label: string }[] = [
  { value: '', label: 'Tat ca' },
  { value: 'MAINTENANCE', label: 'Bao tri' },
  { value: 'UTILITIES', label: 'Dien nuoc' },
  { value: 'SUPPLIES', label: 'Vat tu' },
  { value: 'CLEANING', label: 'Ve sinh' },
  { value: 'SECURITY', label: 'Bao ve' },
  { value: 'OTHER', label: 'Khac' },
]

export function ExpensesPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [filterStatus, setFilterStatus] = useState<ExpenseStatus | ''>('')
  const [filterCategory, setFilterCategory] = useState<ExpenseCategory | ''>('')
  const [filterMotel, setFilterMotel] = useState('')
  const [searchText, setSearchText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFormModal, setShowFormModal] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | undefined>()

  const { data: motelsData } = useMotels(1, 100)
  const motels = motelsData?.data ?? []
  const updateExpense = useUpdateExpense()

  const queryParams = useMemo(() => ({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    ...(filterStatus ? { status: filterStatus } : {}),
    ...(filterCategory ? { category: filterCategory } : {}),
    ...(filterMotel ? { motelId: filterMotel } : {}),
    ...(searchQuery ? { search: searchQuery } : {}),
  }), [currentPage, filterStatus, filterCategory, filterMotel, searchQuery])

  const { data: response, isLoading } = useExpenses(queryParams)

  // Stats query (all matching, no pagination)
  const statsParams = useMemo(() => ({
    limit: 9999,
    ...(filterStatus ? { status: filterStatus } : {}),
    ...(filterCategory ? { category: filterCategory } : {}),
    ...(filterMotel ? { motelId: filterMotel } : {}),
    ...(searchQuery ? { search: searchQuery } : {}),
  }), [filterStatus, filterCategory, filterMotel, searchQuery])

  const { data: statsResponse } = useExpenses(statsParams)
  const allExpenses = statsResponse?.data ?? []

  const expenses = response?.data ?? []
  const meta = response?.meta ?? { total: 0, page: 1, limit: ITEMS_PER_PAGE, totalPages: 1 }

  const stats = useMemo(() => {
    const totalAmount = allExpenses.reduce((s, e) => s + e.amount, 0)
    const paidAmount = allExpenses.filter((e) => e.status === 'PAID').reduce((s, e) => s + e.amount, 0)
    const pendingAmount = allExpenses.filter((e) => e.status === 'PENDING').reduce((s, e) => s + e.amount, 0)
    return { totalCount: allExpenses.length, totalAmount, paidAmount, pendingAmount }
  }, [allExpenses])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(searchText.trim())
    setCurrentPage(1)
  }

  const handleRowClick = (expense: Expense) => {
    setSelectedExpense(expense)
    setShowFormModal(true)
  }

  const handleModalClose = () => {
    setShowFormModal(false)
    setSelectedExpense(undefined)
  }

  const handleStatusChange = async (id: string, newStatus: ExpenseStatus, confirmMsg: string) => {
    if (!window.confirm(confirmMsg)) return
    try {
      await updateExpense.mutateAsync({ id, data: { status: newStatus } })
    } catch {
      // error toast handled by hook
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-[#7b7a7d]">
        <span>Trang chu</span>
        <span>&rsaquo;</span>
        <span className="text-[#323235]">Chi phi</span>
      </nav>

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#323235]">Quan ly Chi phi</h2>
          <p className="mt-1 text-sm text-[#7b7a7d]">Quan ly chi phi bao tri, sua chua va cac khoan chi khac</p>
        </div>
        <button
          onClick={() => setShowFormModal(true)}
          className="flex items-center gap-2 rounded-lg bg-[#1d5fa8] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#174d8a]"
        >
          <Plus className="h-4 w-4" />
          Them chi phi
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Wallet} iconBg="bg-[#c8e6ff]" iconColor="text-[#004c6e]" label="Tong chi phi" value={stats.totalCount} />
        <StatCard icon={Wallet} iconBg="bg-indigo-100" iconColor="text-indigo-700" label="Tong tien" value={formatVnd(stats.totalAmount)} isText />
        <StatCard icon={Wallet} iconBg="bg-[#dcfce7]" iconColor="text-green-700" label="Da thanh toan" value={formatVnd(stats.paidAmount)} isText />
        <StatCard icon={Wallet} iconBg="bg-amber-100" iconColor="text-amber-700" label="Cho xu ly" value={formatVnd(stats.pendingAmount)} isText />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b7a7d]" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Tim mo ta chi phi..."
              className="w-56 rounded-lg border border-gray-200 bg-white py-1.5 pl-9 pr-3 text-sm text-[#323235] placeholder:text-[#7b7a7d] focus:border-[#1d5fa8] focus:outline-none"
            />
          </div>
          <button type="submit" className="rounded-lg bg-[#1d5fa8] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#174d8a]">
            Tim
          </button>
          {searchQuery && (
            <button
              type="button"
              onClick={() => { setSearchText(''); setSearchQuery(''); setCurrentPage(1) }}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-[#7b7a7d] hover:bg-gray-100"
            >
              Xoa
            </button>
          )}
        </form>

        {/* Motel filter */}
        <select
          value={filterMotel}
          onChange={(e) => { setFilterMotel(e.target.value); setCurrentPage(1) }}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-[#323235] focus:border-[#1d5fa8] focus:outline-none"
        >
          <option value="">Tat ca toa nha</option>
          {motels.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>

      {/* Status + Category filter chips */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-[#7b7a7d]">Trang thai:</span>
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => { setFilterStatus(f.value as ExpenseStatus | ''); setCurrentPage(1) }}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filterStatus === f.value ? 'bg-[#1d5fa8] text-white' : 'bg-white text-[#7b7a7d] hover:bg-gray-100'
            }`}
          >
            {f.label}
          </button>
        ))}

        <span className="ml-2 text-sm text-[#7b7a7d]">Loai:</span>
        {CATEGORY_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => { setFilterCategory(f.value as ExpenseCategory | ''); setCurrentPage(1) }}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filterCategory === f.value ? 'bg-[#1d5fa8] text-white' : 'bg-white text-[#7b7a7d] hover:bg-gray-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1d5fa8] border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl bg-white shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
            {expenses.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-[#7b7a7d]">Chua co chi phi nao.</p>
              </div>
            ) : (
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase text-[#7b7a7d]">
                    <th className="px-5 py-3">Loai</th>
                    <th className="px-5 py-3">Mo ta</th>
                    <th className="px-5 py-3">Toa nha</th>
                    <th className="px-5 py-3">Ngay</th>
                    <th className="px-5 py-3 text-right">So tien</th>
                    <th className="px-5 py-3">Trang thai</th>
                    <th className="px-5 py-3 text-center">Thao tac</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((exp) => {
                    const cat = CATEGORY_CONFIG[exp.category] ?? CATEGORY_CONFIG.OTHER
                    const CatIcon = cat.icon
                    const st = STATUS_CONFIG[exp.status] ?? STATUS_CONFIG.PENDING
                    return (
                      <tr
                        key={exp.id}
                        onClick={() => handleRowClick(exp)}
                        className="cursor-pointer border-b border-gray-50 transition-colors last:border-0 hover:bg-gray-50"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${cat.iconBg}`}>
                              <CatIcon className={`h-4 w-4 ${cat.iconColor}`} />
                            </div>
                            <span className="text-sm font-medium text-[#323235]">{cat.label}</span>
                          </div>
                        </td>
                        <td className="max-w-[240px] truncate px-5 py-4 text-sm text-[#323235]">
                          {exp.description}
                        </td>
                        <td className="px-5 py-4 text-sm text-[#7b7a7d]">
                          {exp.motel?.name ?? '-'}
                        </td>
                        <td className="px-5 py-4 text-sm text-[#7b7a7d]">
                          {formatDate(exp.date)}
                        </td>
                        <td className="px-5 py-4 text-right text-sm font-medium text-[#323235]">
                          {formatVnd(exp.amount)}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${st.bg} ${st.text}`}>
                            {st.label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-1">
                            {/* PENDING -> Duyet hoac Huy */}
                            {exp.status === 'PENDING' && (
                              <>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleStatusChange(exp.id, 'APPROVED', 'Xac nhan duyet chi phi nay?') }}
                                  className="rounded-lg p-1.5 text-blue-600 transition-colors hover:bg-blue-50"
                                  title="Duyet"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleStatusChange(exp.id, 'CANCELLED', 'Xac nhan huy chi phi nay?') }}
                                  className="rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-50"
                                  title="Huy"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              </>
                            )}
                            {/* APPROVED -> Thanh toan hoac Huy */}
                            {exp.status === 'APPROVED' && (
                              <>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleStatusChange(exp.id, 'PAID', 'Xac nhan da thanh toan chi phi nay?') }}
                                  className="rounded-lg p-1.5 text-green-600 transition-colors hover:bg-green-50"
                                  title="Thanh toan"
                                >
                                  <Banknote className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleStatusChange(exp.id, 'CANCELLED', 'Xac nhan huy chi phi nay?') }}
                                  className="rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-50"
                                  title="Huy"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              </>
                            )}
                            {/* PAID / CANCELLED -> no actions */}
                            {(exp.status === 'PAID' || exp.status === 'CANCELLED') && (
                              <span className="text-xs text-[#94a3b8]">--</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between px-1 py-3">
              <p className="text-sm text-[#7b7a7d]">
                Trang {meta.page} / {meta.totalPages} ({meta.total} chi phi)
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="rounded-lg p-1.5 text-[#7b7a7d] transition-colors hover:bg-gray-100 disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`min-w-[32px] rounded-lg px-2.5 py-1 text-sm font-medium transition-colors ${
                      page === currentPage ? 'bg-[#1d5fa8] text-white' : 'text-[#7b7a7d] hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(meta.totalPages, p + 1))}
                  disabled={currentPage >= meta.totalPages}
                  className="rounded-lg p-1.5 text-[#7b7a7d] transition-colors hover:bg-gray-100 disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Form modal */}
      <ExpenseFormModal
        isOpen={showFormModal}
        onClose={handleModalClose}
        expense={selectedExpense}
      />
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
