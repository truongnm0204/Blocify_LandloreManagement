import type { Tenant, TenantStatus } from '@/types'

interface TenantTableProps {
  tenants: Tenant[]
  onRowClick: (id: string) => void
}

const STATUS_CONFIG: Record<TenantStatus, { label: string; bg: string; text: string }> = {
  ACTIVE: { label: 'Dang hoat dong', bg: 'bg-green-50', text: 'text-green-700' },
  INACTIVE: { label: 'Ngung hoat dong', bg: 'bg-gray-100', text: 'text-gray-600' },
  BLACKLISTED: { label: 'Chan', bg: 'bg-red-50', text: 'text-red-700' },
}

// Extract room code from tenant's contractTenants data
function getRoomCode(tenant: Tenant): string {
  const ct = tenant.contractTenants?.[0]
  return ct?.contract?.room?.roomCode ?? '—'
}

export function TenantTable({ tenants, onRowClick }: TenantTableProps) {
  if (tenants.length === 0) {
    return (
      <div className="rounded-xl bg-white p-8 text-center shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
        <p className="text-sm text-[#7b7a7d]">Chua co nguoi thue nao.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl bg-white shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase text-[#7b7a7d]">
            <th className="px-5 py-3">Ho ten</th>
            <th className="px-5 py-3">So dien thoai</th>
            <th className="px-5 py-3">CCCD</th>
            <th className="px-5 py-3">Phong</th>
            <th className="px-5 py-3">Gioi tinh</th>
            <th className="px-5 py-3">Trang thai</th>
          </tr>
        </thead>
        <tbody>
          {tenants.map((t) => {
            const statusCfg = STATUS_CONFIG[t.status] ?? STATUS_CONFIG.ACTIVE
            return (
              <tr
                key={t.id}
                onClick={() => onRowClick(t.id)}
                className="cursor-pointer border-b border-gray-50 transition-colors last:border-0 hover:bg-gray-50"
              >
                <td className="px-5 py-4 text-sm font-medium text-[#323235]">{t.fullName}</td>
                <td className="px-5 py-4 text-sm text-[#323235]">{t.phoneNumber}</td>
                <td className="px-5 py-4 text-sm text-[#7b7a7d]">{t.citizenId || '—'}</td>
                <td className="px-5 py-4 text-sm text-[#1d5fa8] font-medium">{getRoomCode(t)}</td>
                <td className="px-5 py-4 text-sm text-[#7b7a7d]">{t.gender || '—'}</td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusCfg.bg} ${statusCfg.text}`}>
                    {statusCfg.label}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
