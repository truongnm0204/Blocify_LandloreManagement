import { Eye, Pencil } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

type ContractRowStatus = 'DRAFT' | 'ACTIVE' | 'EXPIRING' | 'ENDED' | 'CANCELLED'

interface ContractRow {
  id: string
  contractCode: string
  room: string
  tenantName: string
  tenantPhone: string
  startDate: string
  endDate: string
  rentAmount: number
  depositAmount: number
  status: ContractRowStatus
}

interface ContractTableProps {
  contracts: ContractRow[]
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + 'd'
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

const STATUS_CONFIG: Record<ContractRowStatus, { label: string; bg: string; color: string }> = {
  DRAFT: { label: 'Nhap', bg: '#e0e7ff', color: '#4338ca' },
  ACTIVE: { label: 'Dang hieu luc', bg: '#dcfce7', color: '#16a34a' },
  EXPIRING: { label: 'Sap het han', bg: '#ffedd5', color: '#c2410c' },
  ENDED: { label: 'Da ket thuc', bg: '#f3f4f6', color: '#6b7280' },
  CANCELLED: { label: 'Da huy', bg: '#fef2f2', color: '#dc2626' },
}

export function ContractTable({ contracts }: ContractTableProps) {
  const navigate = useNavigate()

  if (contracts.length === 0) {
    return (
      <div className="rounded-xl bg-white p-8 text-center shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
        <p className="text-sm text-[#7b7a7d]">Chua co hop dong nao.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase text-[#7b7a7d]">
            <th className="px-5 py-3">Ma hop dong</th>
            <th className="px-5 py-3">Phong</th>
            <th className="px-5 py-3">Dai dien</th>
            <th className="px-5 py-3">Thoi han</th>
            <th className="px-5 py-3">Tai chinh</th>
            <th className="px-5 py-3">Trang thai</th>
            <th className="px-5 py-3 text-right">Thao tac</th>
          </tr>
        </thead>
        <tbody>
          {contracts.map((row) => {
            const status = STATUS_CONFIG[row.status] ?? STATUS_CONFIG.ENDED
            return (
              <tr
                key={row.id}
                className="border-b border-gray-50 transition-colors last:border-0 hover:bg-gray-50"
              >
                <td className="px-5 py-4">
                  <span className="text-sm font-medium text-[#1d5fa8]">{row.contractCode}</span>
                </td>

                <td className="px-5 py-4">
                  <span className="text-sm text-[#323235]">{row.room}</span>
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#c8e6ff] text-xs font-semibold text-[#004c6e]">
                      {row.tenantName !== '-' ? getInitials(row.tenantName) : '-'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#323235]">{row.tenantName}</p>
                      <p className="text-xs text-[#7b7a7d]">{row.tenantPhone}</p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <p className="text-sm text-[#323235]">{row.startDate}</p>
                  <p className="text-xs text-[#7b7a7d]">den {row.endDate}</p>
                </td>

                <td className="px-5 py-4">
                  <p className="text-sm font-medium text-[#323235]">{formatCurrency(row.rentAmount)}</p>
                  <p className="text-xs text-[#7b7a7d]">Coc: {formatCurrency(row.depositAmount)}</p>
                </td>

                <td className="px-5 py-4">
                  <span
                    className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{ backgroundColor: status.bg, color: status.color }}
                  >
                    {status.label}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => navigate(`/contracts/${row.id}`)}
                      className="rounded-lg p-2 text-[#7b7a7d] transition-colors hover:bg-gray-100 hover:text-[#323235]"
                      title="Xem chi tiet"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/contracts/${row.id}/edit`)}
                      className="rounded-lg p-2 text-[#7b7a7d] transition-colors hover:bg-gray-100 hover:text-[#323235]"
                      title="Chinh sua"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
