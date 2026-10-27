import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Car, Bike, DollarSign, Search, Building2, ChevronDown, ChevronRight } from 'lucide-react'
import { useVehicles } from '@/hooks/use-vehicles'
import { useUpdateVehicle } from '@/hooks/use-vehicles'
import { VehicleTable } from './components/vehicle-table'
import type { Vehicle, VehicleType, VehicleStatus } from '@/types'

const STATUS_FILTERS: { value: VehicleStatus | ''; label: string }[] = [
  { value: '', label: 'Tat ca' },
  { value: 'ACTIVE', label: 'Hoat dong' },
  { value: 'INACTIVE', label: 'Ngung' },
]

const TYPE_FILTERS: { value: VehicleType | ''; label: string }[] = [
  { value: '', label: 'Tat ca' },
  { value: 'MOTORCYCLE', label: 'Xe may' },
  { value: 'CAR', label: 'O to' },
  { value: 'BICYCLE', label: 'Xe dap' },
  { value: 'ELECTRIC_BIKE', label: 'Xe dap dien' },
  { value: 'OTHER', label: 'Khac' },
]

interface VehicleWithMotel extends Vehicle {
  motelId: string
  motelName: string
}

export function VehiclesPage() {
  const navigate = useNavigate()
  const [filterStatus, setFilterStatus] = useState<VehicleStatus | ''>('')
  const [filterType, setFilterType] = useState<VehicleType | ''>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())

  const queryParams = useMemo(() => ({
    page: 1,
    limit: 200,
    ...(filterStatus ? { status: filterStatus } : {}),
    ...(filterType ? { vehicleType: filterType } : {}),
    ...(searchQuery ? { search: searchQuery } : {}),
  }), [filterStatus, filterType, searchQuery])

  const { data: response, isLoading } = useVehicles(queryParams)
  const updateVehicle = useUpdateVehicle()

  const vehicles = response?.data ?? []
  const meta = response?.meta ?? { total: 0, page: 1, limit: 200, totalPages: 1 }

  // Group vehicles by motel via tenant -> contractTenants -> active contract -> motel
  const groupedByMotel = useMemo(() => {
    const groups: Record<string, { motelId: string; motelName: string; vehicles: VehicleWithMotel[] }> = {}
    const unassigned: VehicleWithMotel[] = []

    for (const v of vehicles) {
      const contracts = v.tenant?.contractTenants ?? []
      const active = contracts.find((ct) => ct.contract.status === 'ACTIVE' && ct.contract.motel)
      if (active?.contract.motel) {
        const { id: motelId, name: motelName } = active.contract.motel
        if (!groups[motelId]) {
          groups[motelId] = { motelId, motelName, vehicles: [] }
        }
        groups[motelId].vehicles.push({ ...v, motelId, motelName })
      } else {
        unassigned.push({ ...v, motelId: '_unassigned', motelName: 'Chua gan toa nha' })
      }
    }

    const result = Object.values(groups)
    if (unassigned.length > 0) {
      result.push({ motelId: '_unassigned', motelName: 'Chua gan toa nha', vehicles: unassigned })
    }
    return result
  }, [vehicles])

  const toggleSection = (motelId: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev)
      if (next.has(motelId)) next.delete(motelId)
      else next.add(motelId)
      return next
    })
  }

  const handleRowClick = (vehicle: Vehicle) => {
    navigate(`/vehicles/${vehicle.id}/edit`)
  }

  const handleDeactivate = async (id: string) => {
    if (!window.confirm('Xac nhan ngung hoat dong phuong tien nay?')) return
    try {
      await updateVehicle.mutateAsync({ id, data: { status: 'INACTIVE' } })
    } catch {
      // silently handled
    }
  }

  // Stat card values
  const totalFee = vehicles
    .filter((v) => v.status === 'ACTIVE' && v.monthlyFee)
    .reduce((sum, v) => sum + (v.monthlyFee ?? 0), 0)
  const motorcycleCount = vehicles.filter((v) => v.vehicleType === 'MOTORCYCLE').length
  const carCount = vehicles.filter((v) => v.vehicleType === 'CAR').length

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-[#7b7a7d]">
        <span>Trang chu</span>
        <span>&rsaquo;</span>
        <span className="text-[#323235]">Phuong tien</span>
      </nav>

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#323235]">Quan ly phuong tien</h2>
          <p className="mt-1 text-sm text-[#7b7a7d]">Danh sach phuong tien, chia theo toa nha</p>
        </div>
        <button
          onClick={() => navigate('/vehicles/new')}
          className="flex items-center gap-2 rounded-lg bg-[#1d5fa8] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#174d8a]"
        >
          <Plus className="h-4 w-4" />
          Them phuong tien
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard icon={Car} iconBg="bg-[#c8e6ff]" iconColor="text-[#004c6e]" label="Tong phuong tien" value={meta.total} />
        <StatCard icon={Bike} iconBg="bg-[#dcfce7]" iconColor="text-green-700" label="Xe may" value={motorcycleCount} />
        <StatCard icon={Car} iconBg="bg-purple-100" iconColor="text-purple-700" label="O to" value={carCount} />
        <StatCard icon={DollarSign} iconBg="bg-amber-100" iconColor="text-amber-700" label="Tong chi phi/thang" value={totalFee.toLocaleString('vi-VN') + ' d'} isText />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search bar - real-time */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b7a7d]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tim bien so, nhan hieu..."
            className="w-56 rounded-lg border border-gray-200 bg-white py-1.5 pl-9 pr-3 text-sm text-[#323235] placeholder:text-[#7b7a7d] focus:border-[#1d5fa8] focus:outline-none"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1">
          <span className="mr-1 text-sm text-[#7b7a7d]">Trang thai:</span>
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilterStatus(f.value as VehicleStatus | '')}
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

        {/* Vehicle type filter */}
        <div className="flex items-center gap-1">
          <span className="mr-1 text-sm text-[#7b7a7d]">Loai xe:</span>
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilterType(f.value as VehicleType | '')}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                filterType === f.value
                  ? 'bg-[#1d5fa8] text-white'
                  : 'bg-white text-[#7b7a7d] hover:bg-gray-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vehicles grouped by motel */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1d5fa8] border-t-transparent" />
        </div>
      ) : groupedByMotel.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
          <p className="text-sm text-[#7b7a7d]">Chua co phuong tien nao.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedByMotel.map((group) => {
            const isCollapsed = collapsedSections.has(group.motelId)
            const activeCount = group.vehicles.filter((v) => v.status === 'ACTIVE').length

            return (
              <div key={group.motelId} className="overflow-hidden rounded-xl bg-white shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
                {/* Section header */}
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
                      {group.vehicles.length} phuong tien
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {activeCount > 0 && (
                      <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                        {activeCount} hoat dong
                      </span>
                    )}
                  </div>
                </button>

                {/* Vehicle table */}
                {!isCollapsed && (
                  <div className="border-t border-gray-100">
                    <VehicleTable
                      vehicles={group.vehicles}
                      meta={{ total: group.vehicles.length, page: 1, limit: group.vehicles.length, totalPages: 1 }}
                      currentPage={1}
                      onPageChange={() => {}}
                      onRowClick={handleRowClick}
                      onDeactivate={handleDeactivate}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, iconBg, iconColor, label, value, isText }: {
  icon: React.ComponentType<{ className?: string }>
  iconBg: string
  iconColor: string
  label: string
  value: number | string
  isText?: boolean
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <div>
        <p className="text-sm text-[#7b7a7d]">{label}</p>
        {isText
          ? <p className="text-lg font-semibold text-[#323235]">{value}</p>
          : <p className="text-2xl font-semibold text-[#323235]">{value}</p>
        }
      </div>
    </div>
  )
}
