import { Inbox, Clock, CheckCircle2, XCircle } from 'lucide-react'
import type { FeedbackStats } from '@/types'

interface FeedbackStatCardsProps {
  stats: FeedbackStats
}

export function FeedbackStatCards({ stats }: FeedbackStatCardsProps) {
  const cards = [
    {
      icon: Inbox,
      iconBg: 'bg-[#c8e6ff]',
      iconColor: 'text-[#004c6e]',
      label: 'Moi',
      value: stats.new,
    },
    {
      icon: Clock,
      iconBg: 'bg-[#fef3c7]',
      iconColor: 'text-yellow-700',
      label: 'Dang xu ly',
      value: stats.inProgress,
    },
    {
      icon: CheckCircle2,
      iconBg: 'bg-[#dcfce7]',
      iconColor: 'text-green-700',
      label: 'Da giai quyet',
      value: stats.resolved,
    },
    {
      icon: XCircle,
      iconBg: 'bg-[#e0e7ff]',
      iconColor: 'text-indigo-700',
      label: 'Da dong',
      value: stats.closed,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.label}
            className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]"
          >
            <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${card.iconBg}`}>
              <Icon className={`h-5 w-5 ${card.iconColor}`} />
            </div>
            <div>
              <p className="text-sm text-[#7b7a7d]">{card.label}</p>
              <p className="text-2xl font-semibold text-[#323235]">{card.value}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
