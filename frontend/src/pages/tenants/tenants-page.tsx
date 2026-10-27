import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Users, UserCheck, UserX, Search, Building2, ChevronDown, ChevronRight } from 'lucide-react'
import { useTenants } from '@/hooks/use-tenants'
import { useMotels } from '@/hooks/use-motels'
import { TenantTable } from './components/tenant-table'
import { TenantFormModal } from './components/tenant-form-modal'
import type { Tenant, TenantStatus } from '@/types'

const STATUS_FILTERS: { value: TenantStatus | ''; label: string }[] = [
  { value: '', label: 'Tat ca' },
  { value: 'ACTIVE', label: 'Hoat dong' },
  { value: 'INACTIVE', label: 'Ngung' },
  { value: 'BLACKLISTED', label: 'Chan' },
]

const PAGE_SIZE = 20

// Extract motel info from tenant's contractTenants data
function getTenantMotelInfo(tenant: Tenant): { motelId: string; motelName: string; roomCode: string } | null {
  const ct = tenant.contractTenants?.[0]
  if (!ct?.contract?.room?.motel) return null
  return {
    motelId: ct.contract.room.motel.id,
    motelName: ct.contract.room.motel.name,
    roomCode: ct.contract.room.roomCode,
  }
}

export function TenantsPage() {
  const navigate = useNavigate()
  const [filterStatus, setFilterStatus] = useState<TenantStatus | ''>('')
  const [filterMotelId, setFilterMotelId] = useState('')
  const [searchText, setSearchText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showFormModal, setShowFormModal] = useState(false)
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())

  const queryParams = useMemo(() => ({
    page: currentPage,
    limit: PAGE_SIZE,
    ...(filterStatus ? { status: filterStatus } : {}),
    ...(searchQuery ? { search: searchQuery } : {}),
    ...(filterMotelId ? { motelId: filterMotelId } : {}),
  }), [currentPage, filterStatus, searchQuery, filterMotelId])

  const { data: response, isLoading } = useTenants(queryParams)
  const { data: motelsData } = useMotels(1, 100)

  const tenants = response?.data ?? []
  const meta = response?.meta ?? { total: 0, page: 1, limit: PAGE_SIZE, totalPages: 1 }
  const motels = motelsData?.data ?? []

  // Group tenants by motel using contractTenants from API response
  const groupedByMotel = useMemo(() => {
    const groups: Record<string, { motelId: string; motelName: string; tenants: Tenant[] }> = {}
    const unassigned: Tenant[] = []

    for (const tenant of tenants) {
      const info = getTenantMotelInfo(tenant)
      if (info) {
        if (!groups[info.motelId]) {
          groups[info.motelId] = { motelId: info.motelId, motelName: info.motelName, tenants: [] }
        }
        groups[info.motelId].tenants.push(tenant)
      } else {
        unassigned.push(tenant)
      }
    }

    const result = Object.values(groups)
    if (unassigned.length > 0) {
      result.push({ motelId: '_unassigned', motelName: 'Chua gan toa nha', tenants: unassigned })
    }
    return result
  }, [tenants])

  const toggleSection = (motelId: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev)
      if (next.has(motelId)) next.delete(motelId)
      else next.add(motelId)
      return next
    })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(searchText.trim())
    setCurrentPage(1)
  }

  const handleStatusChange = (status: TenantStatus | '') => {
    setFilterStatus(status)
    setCurrentPage(1)
  }

  const handleMotelChange = (motelId: string) => {
    setFilterMotelId(motelId)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-[#7b7a7d]">
        <span>Trang chu</span>
        <span>&rsaquo;</span>
        <span className="text-[#323235]">Nguoi thue</span>
      </nav>

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#323235]">Quan ly nguoi thue</h2>
          <p className="mt-1 text-sm text-[#7b7a7d]">Danh sach nguoi thue, chia theo toa nha</p>
        </div>
        <button
          onClick={() => setShowFormModal(true)}
          className="flex items-center gap-2 rounded-lg bg-[#1d5fa8] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#174d8a]"
        >
          <Plus className="h-4 w-4" />
          Them nguoi thue
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard icon={Users} iconBg="bg-[#c8e6ff]" iconColor="text-[#004c6e]" label="Tong nguoi thue" value={meta.total} />
        <StatCard icon={UserCheck} iconBg="bg-[#dcfce7]" iconColor="text-green-700" label="Dang hoat dong" value={tenants.filter((t) => t.status === 'ACTIVE').length} />
        <StatCard icon={UserX} iconBg="bg-[#fee2e2]" iconColor="text-red-600" label="Ngung / Chan" value={tenants.filter((t) => t.status !== 'ACTIVE').length} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b7a7d]" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Tim ten, SDT, CCCD..."
              className="w-56 rounded-lg border border-gray-200 bg-white py-1.5 pl-9 pr-3 text-sm text-[#323235] placeholder:text-[#7b7a7d] focus:border-[#1d5fa8] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-[#1d5fa8] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#174d8a]"
          >
            Tim
          </button>
          {searchQuery && (
            <button
              type="button"
              onClick={() => { setSearchText(''); setSearchQuery(''); setCurrentPage(1) }}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-[#7b7a7d] hover:bg-gray-100"
            >
              Xoa
            </button>
          )}
        </form>

        {/* Motel filter */}
        <div className="flex items-center gap-1.5">
          <Building2 className="h-4 w-4 text-[#7b7a7d]" />
          <select
            value={filterMotelId}
            onChange={(e) => handleMotelChange(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-[#323235] focus:border-[#1d5fa8] focus:outline-none"
          >
            <option value="">Tat ca toa nha</option>
            {motels.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1">
          <span className="mr-1 text-sm text-[#7b7a7d]">Trang thai:</span>
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => handleStatusChange(f.value as TenantStatus | '')}
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
      </div>

      {/* Tenants grouped by Motel */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1d5fa8] border-t-transparent" />
        </div>
      ) : groupedByMotel.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
          <p className="text-sm text-[#7b7a7d]">Chua co nguoi thue nao.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedByMotel.map((group) => {
            const isCollapsed = collapsedSections.has(group.motelId)
            const active = group.tenants.filter((t) => t.status === 'ACTIVE').length

            return (
              <div key={group.motelId} className="overflow-hidden rounded-xl bg-white shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
                {/* Motel section header */}
                <button
                  onClick={() => toggleSection(group.motelId)}
                  className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-gray-50"
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-4 w-4 text-[#7b7a7d]" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-[#7b7a7d]" />
                  )}
                  <Building2 className={`h-5 w-5 ${group.motelId === '_unassigned' ? 'text-[#7b7a7d]' : 'text-[#1d5fa8]'}`} />
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-[#323235]">{group.motelName}</span>
                    <span className="ml-3 text-xs text-[#7b7a7d]">
                      {group.tenants.length} nguoi thue
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {active > 0 && (
                      <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                        {active} hoat dong
                      </span>
                    )}
                  </div>
                </button>

                {/* Tenant table for this motel */}
                {!isCollapsed && (
                  <div className="border-t border-gray-100">
                    <TenantTable
                      tenants={group.tenants}
                      onRowClick={(id) => navigate(`/tenants/${id}`)}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination - page-level, not per-group */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between px-1 py-3">
          <p className="text-sm text-[#7b7a7d]">
            Trang {meta.page} / {meta.totalPages} ({meta.total} nguoi thue)
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              className="rounded-lg p-1.5 text-[#7b7a7d] transition-colors hover:bg-gray-100 disabled:opacity-40"
            >
              <ChevronDown className="h-4 w-4 rotate-90" />
            </button>
            {generatePageNumbers(meta.page, meta.totalPages).map((page, idx) =>
              page === '...' ? (
                <span key={`dots-${idx}`} className="px-1 text-sm text-[#7b7a7d]">...</span>
              ) : (
                <button
                  key={page}
                  onClick={() => handlePageChange(page as number)}
                  className={`min-w-[32px] rounded-lg px-2.5 py-1 text-sm font-medium transition-colors ${
                    page === currentPage
                      ? 'bg-[#1d5fa8] text-white'
                      : 'text-[#7b7a7d] hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              )
            )}
            <button
              onClick={() => handlePageChange(Math.min(meta.totalPages, currentPage + 1))}
              disabled={currentPage >= meta.totalPages}
              className="rounded-lg p-1.5 text-[#7b7a7d] transition-colors hover:bg-gray-100 disabled:opacity-40"
            >
              <ChevronDown className="h-4 w-4 -rotate-90" />
            </button>
          </div>
        </div>
      )}

      {/* Create tenant modal */}
      <TenantFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
      />
    </div>
  )
}

// Generate smart page number array: [1, '...', 4, 5, 6, '...', 10]
function generatePageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | '...')[] = []
  pages.push(1)
  if (current > 3) pages.push('...')

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)

  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
}

function StatCard({ icon: Icon, iconBg, iconColor, label, value }: {
  icon: React.ComponentType<{ className?: string }>
  iconBg: string
  iconColor: string
  label: string
  value: number
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <div>
        <p className="text-sm text-[#7b7a7d]">{label}</p>
        <p className="text-2xl font-semibold text-[#323235]">{value}</p>
      </div>
    </div>
  )
}
