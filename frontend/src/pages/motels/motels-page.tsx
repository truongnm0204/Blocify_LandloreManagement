import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileDown, Plus, Filter } from 'lucide-react'
import { useMotels } from '@/hooks/use-motels'
import { useDashboard } from '@/hooks/use-dashboard'
import { StatCard } from './components/stat-card'
import { OccupancyCard } from './components/occupancy-card'
import { MotelTable } from './components/motel-table'
import { Pagination } from './components/pagination'
import { FeaturedCards } from './components/featured-cards'

const ITEMS_PER_PAGE = 3

export function MotelsPage() {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const { data, isLoading, error } = useMotels(currentPage, ITEMS_PER_PAGE)
  const { data: dashboardData } = useDashboard()

  // Backend now returns room stats per motel (totalRooms, occupiedRooms, vacantRooms)
  const motels = data?.data ?? []
  const totalItems = data?.total ?? 0
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)

  // Use dashboard API for aggregate stats (accurate across all motels, not just current page)
  const totalBuildings = totalItems || motels.length
  const totalRooms = dashboardData?.rooms.total ?? motels.reduce((sum, m) => sum + (m.totalRooms ?? 0), 0)
  const totalOccupied = dashboardData?.rooms.occupied ?? motels.reduce((sum, m) => sum + (m.occupiedRooms ?? 0), 0)
  const occupancyRate = dashboardData?.rooms.occupancyRate ?? (totalRooms > 0 ? Math.round((totalOccupied / totalRooms) * 100) : 0)

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-sm text-red-500">Khong the tai du lieu. Vui long thu lai.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#323235]">Tong quan he thong</h2>
          <p className="mt-1 text-sm text-[#7b7a7d]">
            Quan ly va theo doi tat ca cac toa nha trong he thong
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-[#323235] transition-colors hover:bg-gray-50">
            <FileDown className="h-4 w-4" />
            Xuat bao cao
          </button>
          <button
            onClick={() => navigate('/contracts/new')}
            className="flex items-center gap-2 rounded-lg bg-[#1d5fa8] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#174d8a]"
          >
            <Plus className="h-4 w-4" />
            Them Hop Dong
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <StatCard label="Tong toa nha" value={totalBuildings} icon="building" badgeText="Dang hoat dong" />
          <StatCard label="Tong so phong" value={totalRooms} icon="room" badgeText={`${totalOccupied} dang thue`} />
          <OccupancyCard percentage={occupancyRate} occupiedCount={totalOccupied} totalCount={totalRooms} />
        </div>
      )}

      {/* Building List Section */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#323235]">Danh sach toa nha</h3>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-[#323235] transition-colors hover:bg-gray-50">
              <Filter className="h-4 w-4" />
              Bo loc
            </button>
            <button
              onClick={() => navigate('/motels/new')}
              className="flex items-center gap-2 rounded-lg bg-[#1d5fa8] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#174d8a]"
            >
              <Plus className="h-4 w-4" />
              Them toa nha moi
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="h-48 animate-pulse rounded-xl bg-gray-200" />
        ) : (
          <>
            <MotelTable
              motels={motels}
              onView={(id) => navigate(`/motels/${id}`)}
              onEdit={(id) => navigate(`/motels/${id}`)}
            />
            {totalPages > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </div>

      {/* Featured Cards */}
      <FeaturedCards />
    </div>
  )
}
