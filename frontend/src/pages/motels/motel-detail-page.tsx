import { useNavigate, useParams } from 'react-router-dom'
import { ChevronRight, MapPin, Pencil, Trash2 } from 'lucide-react'
import { useMotel, useDeleteMotel, useUpdateMotel } from '@/hooks/use-motels'
import { useMotelRooms } from '@/hooks/use-rooms'
import { MotelDetailStatCards } from './components/motel-detail-stat-cards'
import { MotelDetailInfoSection } from './components/motel-detail-info-section'
import { MotelDetailImageGallery } from './components/motel-detail-image-gallery'
import { MotelDetailRoomTable } from './components/motel-detail-room-table'

export function MotelDetailPage() {
  const { motelId } = useParams<{ motelId: string }>()
  const navigate = useNavigate()

  const { data: motel, isLoading: motelLoading, error: motelError } = useMotel(motelId ?? '')
  const { data: roomsData, isLoading: roomsLoading } = useMotelRooms(motelId)
  const deleteMotel = useDeleteMotel()
  const updateMotel = useUpdateMotel()

  const rooms = roomsData?.data ?? []

  // Stats come from backend's nested stats object
  const stats = motel?.stats
  const totalRooms = stats?.totalRooms ?? rooms.length
  const occupiedRooms = stats?.occupiedRooms ?? rooms.filter((r) => r.status === 'OCCUPIED').length
  const vacantRooms = stats?.vacantRooms ?? rooms.filter((r) => r.status === 'VACANT').length
  const monthlyRevenue = stats?.monthlyRevenue ?? 0

  async function handleDelete() {
    if (!motelId) return
    const confirmed = window.confirm(
      'Ban co chac muon xoa nha tro nay? Hanh dong nay khong the hoan tac.',
    )
    if (!confirmed) return
    try {
      await deleteMotel.mutateAsync(motelId)
      navigate('/motels')
    } catch {
      alert('Xoa nha tro that bai. Vui long thu lai.')
    }
  }

  async function handleToggleAutoInvoice(value: boolean) {
    if (!motelId) return
    try {
      await updateMotel.mutateAsync({ id: motelId, data: { autoInvoice: value } })
    } catch {
      alert('Cap nhat tu dong hoa don that bai. Vui long thu lai.')
    }
  }

  if (motelLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1d5fa8] border-t-transparent" />
      </div>
    )
  }

  if (motelError || !motel) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-red-500">Khong the tai thong tin nha tro. Vui long thu lai.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-[#7b7a7d]">
        <button onClick={() => navigate('/')} className="hover:text-[#323235]">
          Trang chu
        </button>
        <ChevronRight className="h-3 w-3" />
        <button onClick={() => navigate('/motels')} className="hover:text-[#323235]">
          Quan ly nha tro
        </button>
        <ChevronRight className="h-3 w-3" />
        <span className="text-[#323235]">{motel.name}</span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[#323235]">{motel.name}</h2>
          {motel.address && (
            <p className="mt-1 flex items-center gap-1 text-sm text-[#7b7a7d]">
              <MapPin className="h-3.5 w-3.5" />
              {motel.address}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/motels/${motelId}/edit`)}
            className="flex items-center gap-2 rounded-lg border border-[#1d5fa8] bg-white px-4 py-2 text-sm font-medium text-[#1d5fa8] transition-colors hover:bg-blue-50"
          >
            <Pencil className="h-4 w-4" />
            Cap nhat
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteMotel.isPending}
            className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" />
            {deleteMotel.isPending ? 'Dang xoa...' : 'Xoa'}
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <MotelDetailStatCards
        totalRooms={totalRooms}
        occupiedRooms={occupiedRooms}
        vacantRooms={vacantRooms}
        monthlyRevenue={monthlyRevenue}
      />

      {/* Image Gallery */}
      <MotelDetailImageGallery images={motel.images} />

      {/* Info Section */}
      <MotelDetailInfoSection motel={motel} onToggleAutoInvoice={handleToggleAutoInvoice} />

      {/* Room Table */}
      {roomsLoading ? (
        <div className="h-40 animate-pulse rounded-xl bg-gray-200" />
      ) : (
        <MotelDetailRoomTable
          rooms={rooms}
          onCreateRoom={() => navigate(`/rooms/new?motelId=${motelId}`)}
        />
      )}
    </div>
  )
}
