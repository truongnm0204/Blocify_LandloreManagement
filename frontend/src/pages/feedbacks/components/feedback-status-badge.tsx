import type { FeedbackStatus, FeedbackCategory, FeedbackPriority } from '@/types'

const STATUS_CONFIG: Record<FeedbackStatus, { label: string; bg: string; text: string }> = {
  NEW: { label: 'Moi', bg: 'bg-blue-50', text: 'text-blue-700' },
  IN_PROGRESS: { label: 'Dang xu ly', bg: 'bg-yellow-50', text: 'text-yellow-700' },
  RESOLVED: { label: 'Da giai quyet', bg: 'bg-green-50', text: 'text-green-700' },
  CLOSED: { label: 'Da dong', bg: 'bg-gray-100', text: 'text-gray-600' },
}

const CATEGORY_CONFIG: Record<FeedbackCategory, { label: string; bg: string; text: string }> = {
  MAINTENANCE: { label: 'Bao tri', bg: 'bg-orange-50', text: 'text-orange-700' },
  NOISE: { label: 'Tieng on', bg: 'bg-red-50', text: 'text-red-700' },
  UTILITIES: { label: 'Dien nuoc', bg: 'bg-cyan-50', text: 'text-cyan-700' },
  SECURITY: { label: 'An ninh', bg: 'bg-purple-50', text: 'text-purple-700' },
  CLEANLINESS: { label: 'Ve sinh', bg: 'bg-teal-50', text: 'text-teal-700' },
  OTHER: { label: 'Khac', bg: 'bg-gray-100', text: 'text-gray-600' },
}

const PRIORITY_CONFIG: Record<FeedbackPriority, { label: string; bg: string; text: string }> = {
  LOW: { label: 'Thap', bg: 'bg-gray-100', text: 'text-gray-600' },
  MEDIUM: { label: 'Trung binh', bg: 'bg-blue-50', text: 'text-blue-700' },
  HIGH: { label: 'Cao', bg: 'bg-orange-50', text: 'text-orange-700' },
  URGENT: { label: 'Khan cap', bg: 'bg-red-50', text: 'text-red-700' },
}

export function StatusBadge({ status }: { status: FeedbackStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.NEW
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  )
}

export function CategoryBadge({ category }: { category: FeedbackCategory }) {
  const cfg = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.OTHER
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  )
}

export function PriorityBadge({ priority }: { priority: FeedbackPriority }) {
  const cfg = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.MEDIUM
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  )
}

export { STATUS_CONFIG, CATEGORY_CONFIG, PRIORITY_CONFIG }
