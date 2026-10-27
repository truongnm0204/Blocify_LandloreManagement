import { TrendingUp, Wallet, Receipt } from 'lucide-react'
import type { DashboardData } from '@/types'

interface Props {
  data?: DashboardData
}

function formatCurrency(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(3).replace('.', ',')} ty d`
  }
  return `${new Intl.NumberFormat('vi-VN').format(amount)} d`
}

export function DashboardFinanceSummary({ data }: Props) {
  const netProfit = data?.finance?.netProfit ?? 0
  const monthlyRevenue = data?.finance?.monthlyRevenue ?? 0
  const totalExpenses = data?.finance?.totalExpenses ?? 0

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {/* Net Profit - Large blue gradient card */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1d5fa8] to-[#2d7fd4] p-5 text-white">
        <div className="relative z-10">
          <div className="mb-1 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
              <TrendingUp className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium text-white/80">Lai rong sau chi phi</span>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight">
            {new Intl.NumberFormat('vi-VN').format(netProfit)}
          </p>
          <p className="mt-1 text-xs text-white/70">d</p>
          {netProfit > 0 && (
            <p className="mt-2 text-xs text-white/80">
              Bien loi nhuan: {((netProfit / (monthlyRevenue || 1)) * 100).toFixed(0)}%
            </p>
          )}
        </div>
        {/* Decorative circles */}
        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
        <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-white/5" />
      </div>

      {/* Total Revenue */}
      <div className="rounded-xl bg-white p-5 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
        <div className="mb-1 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e8f0fe]">
            <Wallet className="h-4 w-4 text-[#1d5fa8]" />
          </div>
          <span className="text-sm font-medium text-[#7b7a7d]">Tong thu thuc te</span>
        </div>
        <p className="mt-3 text-2xl font-bold text-[#323235]">
          {formatCurrency(monthlyRevenue)}
        </p>
      </div>

      {/* Total Expenses */}
      <div className="rounded-xl bg-white p-5 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
        <div className="mb-1 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fef2f2]">
            <Receipt className="h-4 w-4 text-[#ef4444]" />
          </div>
          <span className="text-sm font-medium text-[#7b7a7d]">Tong chi phi</span>
        </div>
        <p className="mt-3 text-2xl font-bold text-[#323235]">
          {formatCurrency(totalExpenses)}
        </p>
      </div>
    </div>
  )
}
