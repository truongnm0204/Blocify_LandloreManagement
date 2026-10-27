import { useState, useMemo } from 'react'
import { Plus, Search } from 'lucide-react'
import { useFeedbacks, useFeedbackStats } from '@/hooks/use-feedbacks'
import { useMotels } from '@/hooks/use-motels'
import { FeedbackStatCards } from './components/feedback-stat-cards'
import { FeedbackTable } from './components/feedback-table'
import { FeedbackFormModal } from './components/feedback-form-modal'
import type { FeedbackStatus, FeedbackCategory, FeedbackPriority } from '@/types'

const ITEMS_PER_PAGE = 20

const STATUS_FILTERS: { value: FeedbackStatus | ''; label: string }[] = [
  { value: '', label: 'Tat ca' },
  { value: 'NEW', label: 'Moi' },
  { value: 'IN_PROGRESS', label: 'Dang xu ly' },
  { value: 'RESOLVED', label: 'Da giai quyet' },
  { value: 'CLOSED', label: 'Da dong' },
]

const CATEGORY_OPTIONS: { value: FeedbackCategory | ''; label: string }[] = [
  { value: '', label: 'Tat ca danh muc' },
  { value: 'MAINTENANCE', label: 'Bao tri' },
  { value: 'NOISE', label: 'Tieng on' },
  { value: 'UTILITIES', label: 'Dien nuoc' },
  { value: 'SECURITY', label: 'An ninh' },
  { value: 'CLEANLINESS', label: 'Ve sinh' },
  { value: 'OTHER', label: 'Khac' },
]

const PRIORITY_OPTIONS: { value: FeedbackPriority | ''; label: string }[] = [
  { value: '', label: 'Tat ca muc do' },
  { value: 'LOW', label: 'Thap' },
  { value: 'MEDIUM', label: 'Trung binh' },
  { value: 'HIGH', label: 'Cao' },
  { value: 'URGENT', label: 'Khan cap' },
]

export function FeedbacksPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [filterMotelId, setFilterMotelId] = useState('')
  const [filterStatus, setFilterStatus] = useState<FeedbackStatus | ''>('')
  const [filterCategory, setFilterCategory] = useState<FeedbackCategory | ''>('')
  const [filterPriority, setFilterPriority] = useState<FeedbackPriority | ''>('')
  const [searchText, setSearchText] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const queryParams = useMemo(() => ({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    ...(searchText ? { search: searchText } : {}),
    ...(filterStatus ? { status: filterStatus } : {}),
    ...(filterCategory ? { category: filterCategory } : {}),
    ...(filterPriority ? { priority: filterPriority } : {}),
    ...(filterMotelId ? { motelId: filterMotelId } : {}),
  }), [currentPage, searchText, filterStatus, filterCategory, filterPriority, filterMotelId])

  const { data: response, isLoading } = useFeedbacks(queryParams)
  const { data: stats } = useFeedbackStats(filterMotelId ? { motelId: filterMotelId } : {})
  const { data: motelsResponse } = useMotels(1, 100)

  const feedbacks = response?.data ?? []
  const meta = response?.meta ?? { total: 0, page: 1, limit: ITEMS_PER_PAGE, totalPages: 1 }
  const motels = motelsResponse?.data ?? []
  const feedbackStats = stats ?? { new: 0, inProgress: 0, resolved: 0, closed: 0, total: 0 }

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-[#7b7a7d]">
        <span>Trang chu</span>
        <span>&rsaquo;</span>
        <span className="text-[#323235]">Y kien cu dan</span>
      </nav>

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#323235]">Y kien cu dan</h2>
          <p className="mt-1 text-sm text-[#7b7a7d]">Tiep nhan va xu ly y kien, phan hoi tu cu dan</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-lg bg-[#1d5fa8] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#174d8a]"
        >
          <Plus className="h-4 w-4" />
          Tao y kien moi
        </button>
      </div>

      {/* Stat cards */}
      <FeedbackStatCards stats={feedbackStats} />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b7a7d]" />
          <input
            type="text"
            placeholder="Tim kiem..."
            value={searchText}
            onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1) }}
            className="rounded-lg border border-gray-200 bg-white py-1.5 pl-9 pr-3 text-sm text-[#323235] placeholder:text-[#7b7a7d] focus:border-[#1d5fa8] focus:outline-none"
          />
        </div>

        {/* Status filter buttons */}
        <div className="flex items-center gap-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => { setFilterStatus(f.value as FeedbackStatus | ''); setCurrentPage(1) }}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                filterStatus === f.value
                  ? 'bg-[#1d5fa8] text-white'
                  : 'bg-white text-[#7b7a7d] hover:bg-gray-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Category dropdown */}
        <select
          value={filterCategory}
          onChange={(e) => { setFilterCategory(e.target.value as FeedbackCategory | ''); setCurrentPage(1) }}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-[#323235] focus:border-[#1d5fa8] focus:outline-none"
        >
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>

        {/* Priority dropdown */}
        <select
          value={filterPriority}
          onChange={(e) => { setFilterPriority(e.target.value as FeedbackPriority | ''); setCurrentPage(1) }}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-[#323235] focus:border-[#1d5fa8] focus:outline-none"
        >
          {PRIORITY_OPTIONS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>

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
      </div>

      {/* Loading or table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1d5fa8] border-t-transparent" />
        </div>
      ) : (
        <FeedbackTable
          feedbacks={feedbacks}
          meta={meta}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Create feedback modal */}
      <FeedbackFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  )
}
