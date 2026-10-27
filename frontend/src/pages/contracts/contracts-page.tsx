import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, CheckCircle, AlertTriangle, Plus } from 'lucide-react'
import { ContractStatCard } from './components/contract-stat-card'
import { ContractFilter, DEFAULT_CONTRACT_FILTER } from './components/contract-filter'
import type { ContractFilterValues } from './components/contract-filter'
import { ContractMotelSection } from './components/contract-motel-section'
import { useContracts } from '@/hooks/use-contracts'
import { useMotels } from '@/hooks/use-motels'

// Fetch a large limit to get all contracts for client-side grouping + per-section pagination
const FETCH_LIMIT = 500

export function ContractsPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<ContractFilterValues>(DEFAULT_CONTRACT_FILTER)

  const { data: motelsData } = useMotels(1, 100)
  const motels = motelsData?.data ?? []

  const { data: contractsData, isLoading } = useContracts({
    page: 1,
    limit: FETCH_LIMIT,
    motelId: filter.motelId || undefined,
    roomId: filter.roomId || undefined,
    status: filter.status || undefined,
    startDateFrom: filter.startDateFrom || undefined,
    startDateTo: filter.startDateTo || undefined,
  })

  const contracts = contractsData?.data ?? []
  const totalItems = contractsData?.total ?? 0

  // Stats from all fetched data
  const activeCount = contracts.filter((c) => c.status === 'ACTIVE').length
  const endedCount = contracts.filter(
    (c) => c.status === 'ENDED' || c.status === 'CANCELLED',
  ).length

  // Map to table row shape
  const tableRows = useMemo(() => {
    return contracts.map((c) => {
      const contractCode = c.contractCode ?? c.id.slice(0, 8)
      return {
        id: c.id,
        contractCode,
        room: c.room?.roomCode ?? '-',
        motelName: c.motel?.name ?? '',
        motelId: c.motelId ?? '',
        tenantName: c.representativeTenant?.fullName ?? '-',
        tenantPhone: c.representativeTenant?.phoneNumber ?? '-',
        startDate: c.startDate ? new Date(c.startDate).toLocaleDateString('vi-VN') : '-',
        endDate: c.endDate ? new Date(c.endDate).toLocaleDateString('vi-VN') : '-',
        rentAmount: c.rentAmount,
        depositAmount: c.depositAmount,
        status: c.status as 'DRAFT' | 'ACTIVE' | 'EXPIRING' | 'ENDED' | 'CANCELLED',
      }
    })
  }, [contracts])

  // Client-side filter by contract code and tenant name
  const filteredRows = useMemo(() => {
    return tableRows.filter((row) => {
      if (
        filter.contractCode &&
        !row.contractCode.toLowerCase().includes(filter.contractCode.toLowerCase())
      ) {
        return false
      }
      if (
        filter.tenant &&
        !row.tenantName.toLowerCase().includes(filter.tenant.toLowerCase())
      ) {
        return false
      }
      return true
    })
  }, [tableRows, filter.contractCode, filter.tenant])

  // Group contracts by motel
  const groupedByMotel = useMemo(() => {
    const groups: Record<string, { motelName: string; rows: typeof filteredRows }> = {}
    for (const row of filteredRows) {
      const key = row.motelId || '_unknown'
      if (!groups[key]) {
        groups[key] = { motelName: row.motelName || 'Khong xac dinh', rows: [] }
      }
      groups[key].rows.push(row)
    }
    return Object.entries(groups).sort(([, a], [, b]) =>
      a.motelName.localeCompare(b.motelName),
    )
  }, [filteredRows])

  const handleFilterChange = (values: ContractFilterValues) => {
    setFilter(values)
  }

  const handleReset = () => {
    setFilter(DEFAULT_CONTRACT_FILTER)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#323235]">Hop dong</h2>
          <p className="mt-1 text-sm text-[#7b7a7d]">
            Quan ly va theo doi tat ca hop dong thue phong
          </p>
        </div>
        <button
          onClick={() => navigate('/contracts/new')}
          className="flex items-center gap-2 rounded-lg bg-[#1d5fa8] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#174d8a]"
        >
          <Plus className="h-4 w-4" />
          Tao hop dong
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <ContractStatCard
          icon={<FileText className="h-5 w-5 text-[#004c6e]" />}
          iconBg="#c8e6ff"
          label="Tong so hop dong"
          value={totalItems}
        />
        <ContractStatCard
          icon={<CheckCircle className="h-5 w-5 text-green-700" />}
          iconBg="#dcfce7"
          label="Dang hieu luc"
          value={activeCount}
          subtitle="Ban ghi"
        />
        <ContractStatCard
          icon={<AlertTriangle className="h-5 w-5 text-orange-600" />}
          iconBg="#ffedd5"
          label="Da ket thuc / Huy"
          value={endedCount}
        />
      </div>

      {/* Filter */}
      <ContractFilter
        values={filter}
        onChange={handleFilterChange}
        onReset={handleReset}
        motels={motels}
      />

      {/* Contract list grouped by motel, each section with its own pagination */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-[#323235]">Danh sach hop dong</h3>
          <span className="text-sm text-[#7b7a7d]">{filteredRows.length} hop dong</span>
        </div>

        {isLoading ? (
          <div className="rounded-xl bg-white p-8 text-center shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
            <p className="text-sm text-[#7b7a7d]">Dang tai du lieu...</p>
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
            <p className="text-sm text-[#7b7a7d]">Khong tim thay hop dong nao.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedByMotel.map(([motelId, group]) => (
              <ContractMotelSection
                key={motelId}
                motelName={group.motelName}
                rows={group.rows}
                hideHeader={groupedByMotel.length === 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
