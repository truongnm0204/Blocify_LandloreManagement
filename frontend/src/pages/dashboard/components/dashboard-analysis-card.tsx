import { Lightbulb } from 'lucide-react'
import type { DashboardData } from '@/types'

interface Props {
  data?: DashboardData
}

export function DashboardAnalysisCard({ data }: Props) {
  const tips: string[] = []

  if (data) {
    const { finance, rooms, invoices } = data

    if (finance.netProfit > 0) {
      const margin = ((finance.netProfit / (finance.monthlyRevenue || 1)) * 100).toFixed(0)
      tips.push(`Lai rong dat ${margin}% doanh thu. Bien loi nhuan o muc tot.`)
    } else if (finance.netProfit < 0) {
      tips.push('Chi phi dang vuot doanh thu. Can xem xet cat giam chi phi.')
    }

    if (rooms.occupancyRate >= 90) {
      tips.push(`Ty le lap day ${rooms.occupancyRate}% - Rat tot! Co the xem xet tang gia thue.`)
    } else if (rooms.occupancyRate < 70) {
      tips.push(
        `Ty le lap day chi ${rooms.occupancyRate}%. Can tang cuong tiep thi de thu hut khach thue.`,
      )
    }

    if (invoices.overdue > 0) {
      tips.push(`Co ${invoices.overdue} hoa don qua han. Can lien he khach thue de thu hoi.`)
    }

    if (finance.totalReceivables > 0) {
      tips.push(
        `Cong no con lai ${new Intl.NumberFormat('vi-VN').format(finance.totalReceivables)} d. Theo doi sat de dam bao thu dung han.`,
      )
    }
  }

  if (tips.length === 0) {
    tips.push('Chua co du lieu de phan tich. Hay tao hoa don va ghi nhan thanh toan.')
  }

  return (
    <div className="rounded-xl bg-[#fffbeb] p-5 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fef3c7]">
          <Lightbulb className="h-4 w-4 text-[#f59e0b]" />
        </div>
        <h3 className="text-sm font-semibold text-[#323235]">Goi y phan tich</h3>
      </div>
      <ul className="space-y-2">
        {tips.map((tip, i) => (
          <li key={i} className="text-xs leading-relaxed text-[#78716c]">
            {tip}
          </li>
        ))}
      </ul>
      <button className="mt-3 text-xs font-medium text-[#f59e0b] hover:underline">
        Xem chi tiet
      </button>
    </div>
  )
}
