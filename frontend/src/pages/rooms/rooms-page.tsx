import { useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, Search, Building2, ChevronDown, ChevronRight } from 'lucide-react'
import { useRooms } from '@/hooks/use-rooms'
import { useMotels } from '@/hooks/use-motels'
import type { Room } from '@/types'
import { RoomTable, type RoomWithMotel } from './components/room-table'
import { RoomStatCard } from './components/room-stat-card'
import { RoomFeaturedCard } from './components/room-featured-card'
import { RoomViewToggle, type ViewMode } from './components/room-view-toggle'
import { RoomGridView } from './components/room-grid-view'

const ITEMS_PER_PAGE = 100

/** Extract representative tenant name from active contract */
function extractTenantName(room: Room): string | null {
  if (room.status !== 'OCCUPIED' && room.status !== 'RESERVED') return null
  const active = room.contracts?.find((c) => c.status === 'ACTIVE')
  if (!active?.tenants?.length) return null
  const rep = active.tenants.find((t) => t.isRepresentative)
  return rep?.tenant?.fullName ?? active.tenants[0]?.tenant?.fullName ?? null
}

/** Count actual tenants in active contract */
function countCurrentOccupants(room: Room): number {
  const active = room.contracts?.find((c) => c.status === 'ACTIVE')
  return active?.tenants?.length ?? 0
}

function enrichRoom(room: Room, motelName: string): RoomWithMotel {
  return {
    ...room,
    motelName,
    deposit: room.baseRent,
    // actual tenant count from active contract, not maxOccupants
    occupantCount: countCurrentOccupants(room),
    tenantName: extractTenantName(room),
  }
}


export function RoomsPage() {
  const { motelId } = useParams<{ motelId: string }>()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('list')

  const { data: motelsData } = useMotels(1, 100)
  const { data: roomsData, isLoading, error } = useRooms(motelId, 1, ITEMS_PER_PAGE)

  // Build motel name map
  const motelMap = useMemo(() => {
    const map: Record<string, string> = {}
    if (motelsData?.data) {
      for (const m of motelsData.data) {
        map[m.id] = m.name
      }
    }
    return map
  }, [motelsData])

  // Enrich rooms with motel names
  const apiRooms = useMemo(() => {
    if (!roomsData?.data?.length) return []
    return roomsData.data.map((room) =>
      enrichRoom(room, motelMap[room.motelId] || 'Khong xac dinh')
    )
  }, [roomsData, motelMap])

  const rooms = apiRooms

  // Apply filters
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchSearch = searchQuery === '' ||
        room.roomCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchStatus = statusFilter === 'all' || room.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [rooms, searchQuery, statusFilter])

  // Group rooms by motel
  const groupedByMotel = useMemo(() => {
    const groups: Record<string, { motelId: string; motelName: string; rooms: RoomWithMotel[] }> = {}
    for (const room of filteredRooms) {
      const key = room.motelId
      if (!groups[key]) {
        groups[key] = { motelId: key, motelName: room.motelName || 'Khong xac dinh', rooms: [] }
      }
      groups[key].rooms.push(room)
    }
    return Object.values(groups)
  }, [filteredRooms])

  // Track expanded sections - default all expanded
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())
  const toggleSection = (motelId: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev)
      if (next.has(motelId)) next.delete(motelId)
      else next.add(motelId)
      return next
    })
  }

  // Stats
  const totalRooms = rooms.length

  const handleView = (id: string) => navigate(`/rooms/${id}`)
  const handleEdit = (id: string) => navigate(`/rooms/${id}/edit`)

  /** Navigate to contract creation form with room pre-filled */
  const handleAddTenant = (room: RoomWithMotel) => {
    const params = new URLSearchParams({ roomId: room.id })
    if (room.motelId) params.set('motelId', room.motelId)
    navigate(`/contracts/new?${params.toString()}`)
  }

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
          <h2 className="text-xl font-semibold text-[#323235]">Quan ly phong</h2>
          <p className="mt-1 text-sm text-[#7b7a7d]">
            Quan ly chi tiet trang thai va thong tin tat ca cac phong, chia theo toa nha
          </p>
        </div>
        <button
          onClick={() => navigate('/rooms/new')}
          className="flex items-center gap-2 rounded-lg bg-[#1d5fa8] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#174d8a]"
        >
          <Plus className="h-4 w-4" />
          Them phong moi
        </button>
      </div>

      {/* Filters + Stat Row */}
      <div className="flex items-start gap-6">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative w-56">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b7a7d]" />
            <input
              type="text"
              placeholder="Tim theo ma phong..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm text-[#323235] placeholder:text-[#7b7a7d] focus:border-[#1d5fa8] focus:outline-none"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#323235] focus:border-[#1d5fa8] focus:outline-none"
          >
            <option value="all">Tat ca trang thai</option>
            <option value="VACANT">Trong</option>
            <option value="OCCUPIED">Da thue</option>
            <option value="RESERVED">Da dat coc</option>
            <option value="MAINTENANCE">Dang sua chua</option>
          </select>

          {/* View mode toggle */}
          <RoomViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        </div>

        <RoomStatCard
          label="Tong so phong"
          value={totalRooms}
          subtitle={`${groupedByMotel.length} toa nha`}
        />
      </div>

      {/* Rooms grouped by Motel */}
      {isLoading ? (
        <div className="space-y-4">
          <div className="h-12 animate-pulse rounded-xl bg-gray-200" />
          <div className="h-48 animate-pulse rounded-xl bg-gray-200" />
        </div>
      ) : groupedByMotel.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
          <p className="text-sm text-[#7b7a7d]">Khong tim thay phong nao phu hop.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedByMotel.map((group) => {
            const isCollapsed = collapsedSections.has(group.motelId)
            const occupied = group.rooms.filter((r) => r.status === 'OCCUPIED').length
            const vacant = group.rooms.filter((r) => r.status === 'VACANT').length

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
                  <Building2 className="h-5 w-5 text-[#1d5fa8]" />
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-[#323235]">{group.motelName}</span>
                    <span className="ml-3 text-xs text-[#7b7a7d]">
                      {group.rooms.length} phong
                    </span>
                  </div>
                  {/* Quick stats badges */}
                  <div className="flex items-center gap-2">
                    {occupied > 0 && (
                      <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                        {occupied} da thue
                      </span>
                    )}
                    {vacant > 0 && (
                      <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                        {vacant} trong
                      </span>
                    )}
                  </div>
                </button>

                {/* Room content for this motel */}
                {!isCollapsed && (
                  <div className="border-t border-gray-100">
                    {viewMode === 'list' ? (
                      <RoomTable
                        rooms={group.rooms}
                        onView={handleView}
                        onEdit={handleEdit}
                        onAddTenant={handleAddTenant}
                      />
                    ) : (
                      <RoomGridView
                        rooms={group.rooms}
                        onRoomClick={handleView}
                      />
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Featured Cards */}
      <RoomFeaturedCard />
    </div>
  )
}
