import { useRecentTransactions } from '@/hooks/use-dashboard'
import { ArrowDownRight, ArrowUpRight, MoreHorizontal } from 'lucide-react'

const categoryLabels: Record<string, { label: string; color: string }> = {
  CASH: { label: 'Tien mat', color: '#16a34a' },
  BANK_TRANSFER: { label: 'Chuyen khoan', color: '#1d5fa8' },
  OTHER: { label: 'Khac', color: '#7b7a7d' },
}

interface Props {
  motelId?: string
}

export function DashboardTransactionsTable({ motelId }: Props) {
  const { data: transactions, isLoading } = useRecentTransactions(10, motelId)

  return (
    <div className="rounded-xl bg-white p-5 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-[#323235]">Bien dong dong tien gan day</h3>
        <button className="text-xs font-medium text-[#1d5fa8] hover:underline">Xem tat ca</button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : !transactions || transactions.length === 0 ? (
        <p className="py-8 text-center text-sm text-[#7b7a7d]">Chua co giao dich nao</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-3 text-left text-xs font-medium text-[#7b7a7d]">Ngay</th>
                <th className="pb-3 text-left text-xs font-medium text-[#7b7a7d]">Noi dung</th>
                <th className="pb-3 text-left text-xs font-medium text-[#7b7a7d]">Danh muc</th>
                <th className="pb-3 text-right text-xs font-medium text-[#7b7a7d]">So tien</th>
                <th className="pb-3 text-right text-xs font-medium text-[#7b7a7d]"></th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => {
                const catConfig = categoryLabels[tx.category] ?? {
                  label: tx.category,
                  color: '#7b7a7d',
                }
                const isIncome = tx.type === 'income'
                const formattedDate = new Date(tx.date).toLocaleDateString('vi-VN')

                return (
                  <tr key={tx.id} className="border-b border-gray-50 transition-colors hover:bg-[#f5f6fa]">
                    <td className="py-3 text-xs text-[#7b7a7d]">{formattedDate}</td>
                    <td className="py-3">
                      <span className="text-sm text-[#323235]">{tx.description}</span>
                    </td>
                    <td className="py-3">
                      <span
                        className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: `${catConfig.color}15`,
                          color: catConfig.color,
                        }}
                      >
                        {catConfig.label}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <span className={`flex items-center justify-end gap-1 text-sm font-medium ${isIncome ? 'text-[#16a34a]' : 'text-[#ef4444]'}`}>
                        {isIncome ? (
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        ) : (
                          <ArrowDownRight className="h-3.5 w-3.5" />
                        )}
                        {isIncome ? '+' : '-'}{' '}
                        {new Intl.NumberFormat('vi-VN').format(tx.amount)} d
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button className="rounded-lg p-1 text-[#7b7a7d] transition-colors hover:bg-gray-100">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
