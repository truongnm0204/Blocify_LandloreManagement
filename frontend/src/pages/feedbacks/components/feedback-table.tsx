import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { StatusBadge, CategoryBadge, PriorityBadge } from './feedback-status-badge'
import type { Feedback } from '@/types'

interface FeedbackTableProps {
  feedbacks: Feedback[]
  meta: { total: number; page: number; limit: number; totalPages: number }
  currentPage: number
  onPageChange: (page: number) => void
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('vi-VN')
  } catch {
    return dateStr
  }
}

export function FeedbackTable({ feedbacks, meta, currentPage, onPageChange }: FeedbackTableProps) {
  const navigate = useNavigate()

  if (feedbacks.length === 0) {
    return (
      <div className="rounded-xl bg-white p-8 text-center shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
        <p className="text-sm text-[#7b7a7d]">Chua co y kien nao.</p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl bg-white shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
        <table className="w-full min-w-[1000px]">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase text-[#7b7a7d]">
              <th className="px-5 py-3">Tieu de</th>
              <th className="px-5 py-3">Cu dan</th>
              <th className="px-5 py-3">Nha tro / Phong</th>
              <th className="px-5 py-3">Danh muc</th>
              <th className="px-5 py-3">Uu tien</th>
              <th className="px-5 py-3">Trang thai</th>
              <th className="px-5 py-3">Ngay tao</th>
            </tr>
          </thead>
          <tbody>
            {feedbacks.map((f) => (
              <tr
                key={f.id}
                onClick={() => navigate(`/feedbacks/${f.id}`)}
                className="cursor-pointer border-b border-gray-50 transition-colors last:border-0 hover:bg-gray-50"
              >
                <td className="px-5 py-4 text-sm font-medium text-[#323235]">
                  {f.title}
                </td>
                <td className="px-5 py-4 text-sm text-[#323235]">
                  {f.tenant?.fullName ?? '—'}
                </td>
                <td className="px-5 py-4 text-sm text-[#7b7a7d]">
                  {f.motel?.name ?? '—'}
                  {f.room ? ` / ${f.room.roomCode}` : ''}
                </td>
                <td className="px-5 py-4">
                  <CategoryBadge category={f.category} />
                </td>
                <td className="px-5 py-4">
                  <PriorityBadge priority={f.priority} />
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status={f.status} />
                </td>
                <td className="px-5 py-4 text-sm text-[#7b7a7d]">
                  {formatDate(f.createdAt)}
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
            Trang {meta.page} / {meta.totalPages} ({meta.total} y kien)
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
