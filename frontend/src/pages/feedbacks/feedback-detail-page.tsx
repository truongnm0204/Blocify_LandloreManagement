import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useFeedback, useUpdateFeedback } from '@/hooks/use-feedbacks'
import {
  StatusBadge,
  CategoryBadge,
  PriorityBadge,
  STATUS_CONFIG,
} from './components/feedback-status-badge'
import type { FeedbackStatus } from '@/types'

function formatDateTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString('vi-VN')
  } catch {
    return dateStr
  }
}

const STATUS_TRANSITIONS: Record<FeedbackStatus, FeedbackStatus[]> = {
  NEW: ['IN_PROGRESS', 'CLOSED'],
  IN_PROGRESS: ['RESOLVED', 'CLOSED'],
  RESOLVED: ['CLOSED'],
  CLOSED: [],
}

export function FeedbackDetailPage() {
  const { feedbackId } = useParams<{ feedbackId: string }>()
  const navigate = useNavigate()
  const { data: feedback, isLoading } = useFeedback(feedbackId ?? '')
  const updateFeedback = useUpdateFeedback()
  const [resolution, setResolution] = useState('')
  const [showResolution, setShowResolution] = useState(false)

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1d5fa8] border-t-transparent" />
      </div>
    )
  }

  if (!feedback) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-[#7b7a7d]">Khong tim thay y kien.</p>
      </div>
    )
  }

  const allowedTransitions = STATUS_TRANSITIONS[feedback.status] ?? []

  const handleStatusChange = async (newStatus: FeedbackStatus) => {
    if (newStatus === 'RESOLVED' && !feedback.resolution && !resolution) {
      setShowResolution(true)
      return
    }

    try {
      await updateFeedback.mutateAsync({
        id: feedback.id,
        data: {
          status: newStatus,
          ...(resolution ? { resolution } : {}),
        },
      })
      setShowResolution(false)
      setResolution('')
    } catch {
      // Error handled by React Query
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-[#7b7a7d]">
        <span>Trang chu</span>
        <span>&rsaquo;</span>
        <button onClick={() => navigate('/feedbacks')} className="hover:text-[#1d5fa8]">
          Y kien cu dan
        </button>
        <span>&rsaquo;</span>
        <span className="text-[#323235]">Chi tiet</span>
      </nav>

      {/* Back button + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/feedbacks')}
          className="rounded-lg p-1.5 text-[#7b7a7d] transition-colors hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-semibold text-[#323235]">{feedback.title}</h2>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column - main content */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Description */}
          <div className="rounded-xl bg-white p-6 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
            <h3 className="mb-3 text-sm font-medium text-[#7b7a7d]">Mo ta</h3>
            <p className="whitespace-pre-wrap text-sm text-[#323235]">{feedback.description}</p>
          </div>

          {/* Images */}
          {feedback.images && feedback.images.length > 0 && (
            <div className="rounded-xl bg-white p-6 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
              <h3 className="mb-3 text-sm font-medium text-[#7b7a7d]">Hinh anh</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {feedback.images.map((url, idx) => (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="overflow-hidden rounded-lg border border-gray-200"
                  >
                    <img
                      src={url}
                      alt={`Hinh ${idx + 1}`}
                      className="h-32 w-full object-cover transition-transform hover:scale-105"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Resolution */}
          {feedback.resolution && (
            <div className="rounded-xl bg-green-50 p-6 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
              <h3 className="mb-3 text-sm font-medium text-green-700">Ket qua xu ly</h3>
              <p className="whitespace-pre-wrap text-sm text-[#323235]">{feedback.resolution}</p>
            </div>
          )}

          {/* Resolution input (when transitioning to RESOLVED) */}
          {showResolution && (
            <div className="rounded-xl bg-white p-6 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
              <h3 className="mb-3 text-sm font-medium text-[#323235]">Nhap ket qua xu ly</h3>
              <textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                rows={3}
                placeholder="Mo ta cach giai quyet..."
                className="mb-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#323235] placeholder:text-[#7b7a7d] focus:border-[#1d5fa8] focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleStatusChange('RESOLVED')}
                  disabled={!resolution.trim() || updateFeedback.isPending}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {updateFeedback.isPending ? 'Dang xu ly...' : 'Xac nhan giai quyet'}
                </button>
                <button
                  onClick={() => setShowResolution(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-[#7b7a7d] hover:bg-gray-100"
                >
                  Huy
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-4">
          {/* Status + Actions */}
          <div className="rounded-xl bg-white p-6 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
            <h3 className="mb-3 text-sm font-medium text-[#7b7a7d]">Trang thai</h3>
            <div className="mb-4">
              <StatusBadge status={feedback.status} />
            </div>
            {allowedTransitions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {allowedTransitions.map((nextStatus) => {
                  const cfg = STATUS_CONFIG[nextStatus]
                  return (
                    <button
                      key={nextStatus}
                      onClick={() => handleStatusChange(nextStatus)}
                      disabled={updateFeedback.isPending}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${cfg.bg} ${cfg.text} hover:opacity-80 disabled:opacity-50`}
                    >
                      {cfg.label}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Category + Priority */}
          <div className="rounded-xl bg-white p-6 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
            <div className="mb-4">
              <h3 className="mb-2 text-sm font-medium text-[#7b7a7d]">Danh muc</h3>
              <CategoryBadge category={feedback.category} />
            </div>
            <div>
              <h3 className="mb-2 text-sm font-medium text-[#7b7a7d]">Muc do uu tien</h3>
              <PriorityBadge priority={feedback.priority} />
            </div>
          </div>

          {/* Tenant info */}
          <div className="rounded-xl bg-white p-6 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
            <h3 className="mb-3 text-sm font-medium text-[#7b7a7d]">Cu dan</h3>
            <p className="text-sm font-medium text-[#323235]">{feedback.tenant?.fullName ?? '—'}</p>
            {feedback.tenant?.phoneNumber && (
              <p className="mt-1 text-sm text-[#7b7a7d]">{feedback.tenant.phoneNumber}</p>
            )}
          </div>

          {/* Motel / Room */}
          <div className="rounded-xl bg-white p-6 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
            <h3 className="mb-3 text-sm font-medium text-[#7b7a7d]">Nha tro / Phong</h3>
            <p className="text-sm font-medium text-[#323235]">{feedback.motel?.name ?? '—'}</p>
            {feedback.room && (
              <p className="mt-1 text-sm text-[#7b7a7d]">
                Phong: {feedback.room.roomCode}
                {feedback.room.roomName ? ` - ${feedback.room.roomName}` : ''}
              </p>
            )}
          </div>

          {/* Staff info */}
          <div className="rounded-xl bg-white p-6 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
            <h3 className="mb-3 text-sm font-medium text-[#7b7a7d]">Nhan vien</h3>
            <div className="mb-2">
              <p className="text-xs text-[#7b7a7d]">Nguoi tao</p>
              <p className="text-sm text-[#323235]">{feedback.createdBy?.fullName ?? '—'}</p>
            </div>
            {feedback.assignedTo && (
              <div>
                <p className="text-xs text-[#7b7a7d]">Nguoi phu trach</p>
                <p className="text-sm text-[#323235]">{feedback.assignedTo.fullName}</p>
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="rounded-xl bg-white p-6 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
            <h3 className="mb-3 text-sm font-medium text-[#7b7a7d]">Thoi gian</h3>
            <div className="mb-2">
              <p className="text-xs text-[#7b7a7d]">Ngay tao</p>
              <p className="text-sm text-[#323235]">{formatDateTime(feedback.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs text-[#7b7a7d]">Cap nhat lan cuoi</p>
              <p className="text-sm text-[#323235]">{formatDateTime(feedback.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
