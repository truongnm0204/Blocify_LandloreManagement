import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ChevronRight,
  Wifi,
  Wind,
  Refrigerator,
  Tv,
  Car,
  Flame,
  ShirtIcon,
  Shield,
  Minus,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
} from 'lucide-react'
import { useRoom, useCreateRoom, useUpdateRoom } from '@/hooks/use-rooms'
import { useMotels } from '@/hooks/use-motels'
import type { CreateRoomPayload, UpdateRoomPayload } from '@/api/rooms.api'
import { RoomTenantList } from './components/room-tenant-list'

type RoomStatus = 'VACANT' | 'RESERVED' | 'OCCUPIED' | 'MAINTENANCE'

interface RoomFormData {
  motelId: string
  roomCode: string
  name: string
  floor: number | ''
  area: number
  baseRent: number
  maxOccupants: number
  status: RoomStatus
  notes: string
}

const amenityOptions = [
  { id: 'wifi', label: 'Wifi', icon: Wifi },
  { id: 'aircon', label: 'Dieu hoa', icon: Wind },
  { id: 'fridge', label: 'Tu lanh', icon: Refrigerator },
  { id: 'tv', label: 'Ti vi', icon: Tv },
  { id: 'parking', label: 'Cho de xe', icon: Car },
  { id: 'heater', label: 'Nong lanh', icon: Flame },
  { id: 'closet', label: 'Tu quan ao', icon: ShirtIcon },
  { id: 'security', label: 'Bao ve', icon: Shield },
]

const statusOptions: { value: RoomStatus; label: string; description: string; color: string }[] = [
  { value: 'VACANT', label: 'Trong', description: 'San sang cho thue', color: 'bg-green-500' },
  { value: 'RESERVED', label: 'Da dat', description: 'Phong da duoc dat truoc', color: 'bg-yellow-500' },
  { value: 'OCCUPIED', label: 'Da thue', description: 'Phong dang co khach thue', color: 'bg-blue-500' },
  { value: 'MAINTENANCE', label: 'Dang sua chua', description: 'Tam ngung cho thue', color: 'bg-orange-500' },
]

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('vi-VN').format(value)
}

const DEFAULT_FORM: RoomFormData = {
  motelId: '',
  roomCode: '',
  name: '',
  floor: '',
  area: 25,
  baseRent: 3500000,
  maxOccupants: 2,
  status: 'VACANT',
  notes: '',
}

export function RoomDetailPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const isEdit = !!roomId

  const [form, setForm] = useState<RoomFormData>(DEFAULT_FORM)
  const [amenities, setAmenities] = useState<string[]>(['wifi', 'aircon'])
  const [errors, setErrors] = useState<Partial<Record<keyof RoomFormData, string>>>({})

  // Load existing room when editing
  const { data: existingRoom, isLoading: roomLoading } = useRoom(roomId ?? '')
  const { data: motelsData } = useMotels(1, 100)

  const createRoom = useCreateRoom()
  const updateRoom = useUpdateRoom()

  const isSaving = createRoom.isPending || updateRoom.isPending

  // Populate form when room data loads
  useEffect(() => {
    if (existingRoom && isEdit) {
      setForm({
        motelId: existingRoom.motelId ?? '',
        roomCode: existingRoom.roomCode ?? '',
        name: existingRoom.name ?? '',
        floor: existingRoom.floor ?? '',
        area: existingRoom.area ?? 25,
        baseRent: existingRoom.baseRent ?? 0,
        maxOccupants: existingRoom.maxOccupants ?? 2,
        status: (existingRoom.status as RoomStatus) ?? 'VACANT',
        notes: existingRoom.notes ?? '',
      })
    }
  }, [existingRoom, isEdit])

  const updateField = <K extends keyof RoomFormData>(field: K, value: RoomFormData[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const toggleAmenity = (id: string) => {
    setAmenities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    )
  }

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof RoomFormData, string>> = {}
    if (!form.motelId) newErrors.motelId = 'Vui long chon nha tro'
    if (!form.roomCode.trim()) newErrors.roomCode = 'Vui long nhap ma phong'
    if (!form.name.trim()) newErrors.name = 'Vui long nhap ten phong'
    if (form.baseRent <= 0) newErrors.baseRent = 'Gia thue phai lon hon 0'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validate()) return

    if (isEdit && roomId) {
      const payload: UpdateRoomPayload = {
        roomCode: form.roomCode,
        name: form.name,
        floor: form.floor !== '' ? Number(form.floor) : undefined,
        area: form.area,
        baseRent: form.baseRent,
        maxOccupants: form.maxOccupants,
        status: form.status,
        notes: form.notes || undefined,
      }
      updateRoom.mutate(
        { id: roomId, data: payload },
        { onSuccess: () => navigate('/rooms') }
      )
    } else {
      const payload: CreateRoomPayload = {
        motelId: form.motelId,
        roomCode: form.roomCode,
        name: form.name,
        floor: form.floor !== '' ? Number(form.floor) : undefined,
        area: form.area,
        baseRent: form.baseRent,
        maxOccupants: form.maxOccupants,
        notes: form.notes || undefined,
      }
      createRoom.mutate(payload, { onSuccess: () => navigate('/rooms') })
    }
  }

  const handleCancel = () => navigate(-1)

  if (isEdit && roomLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1d5fa8] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[960px]">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1 text-sm text-[#7b7a7d]">
        <button onClick={() => navigate('/')} className="hover:text-[#323235]">He thong</button>
        <ChevronRight className="h-3 w-3" />
        <button onClick={() => navigate('/rooms')} className="hover:text-[#323235]">Quan ly phong</button>
        <ChevronRight className="h-3 w-3" />
        <span className="text-[#323235]">{isEdit ? 'Chinh sua phong' : 'Tao phong moi'}</span>
      </nav>

      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#323235]">
            {isEdit ? 'Chinh Sua Phong' : 'Tao Phong Moi'}
          </h2>
          <p className="mt-1 text-sm text-[#7b7a7d]">
            {isEdit
              ? 'Cap nhat thong tin chi tiet cho can phong.'
              : 'Them phong moi vao he thong quan ly.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-[#323235] transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            Huy
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-lg bg-[#1d5fa8] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#174d8a] disabled:opacity-50"
          >
            {isSaving ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? 'Dang luu...' : 'Luu thong tin'}
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex gap-8">
        {/* Left Column */}
        <div className="flex-1 space-y-8">
          {/* Basic Info */}
          <section>
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-[#323235]">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1d5fa8] text-xs text-white">1</span>
              Thong tin co ban
            </h3>
            <div className="space-y-4">
              {/* Motel select */}
              {!isEdit && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#323235]">
                    Nha tro <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.motelId}
                    onChange={(e) => updateField('motelId', e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2.5 text-sm text-[#323235] focus:outline-none ${
                      errors.motelId
                        ? 'border-red-400 focus:border-red-400'
                        : 'border-gray-200 focus:border-[#1d5fa8]'
                    }`}
                  >
                    <option value="">Chon nha tro...</option>
                    {motelsData?.data?.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                  {errors.motelId && <p className="mt-1 text-xs text-red-500">{errors.motelId}</p>}
                </div>
              )}

              {/* Room code + Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#323235]">
                    Ma phong <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Vi du: P101"
                    value={form.roomCode}
                    onChange={(e) => updateField('roomCode', e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2.5 text-sm text-[#323235] placeholder:text-[#7b7a7d] focus:outline-none ${
                      errors.roomCode ? 'border-red-400' : 'border-gray-200 focus:border-[#1d5fa8]'
                    }`}
                  />
                  {errors.roomCode && <p className="mt-1 text-xs text-red-500">{errors.roomCode}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#323235]">
                    Ten phong <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Vi du: Phong Studio A1"
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2.5 text-sm text-[#323235] placeholder:text-[#7b7a7d] focus:outline-none ${
                      errors.name ? 'border-red-400' : 'border-gray-200 focus:border-[#1d5fa8]'
                    }`}
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                </div>
              </div>

              {/* Floor + Area */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#323235]">Tang</label>
                  <input
                    type="number"
                    min={1}
                    placeholder="Vi du: 1"
                    value={form.floor}
                    onChange={(e) => updateField('floor', e.target.value === '' ? '' : parseInt(e.target.value) || '')}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-[#323235] placeholder:text-[#7b7a7d] focus:border-[#1d5fa8] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#323235]">Dien tich (m2)</label>
                  <input
                    type="number"
                    min={1}
                    value={form.area}
                    onChange={(e) => updateField('area', parseInt(e.target.value) || 0)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-[#323235] focus:border-[#1d5fa8] focus:outline-none"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#323235]">Mo ta phong</label>
                <textarea
                  placeholder="Nhap chi tiet ve dac diem phong..."
                  rows={3}
                  value={form.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                  className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-[#323235] placeholder:text-[#7b7a7d] focus:border-[#1d5fa8] focus:outline-none"
                />
              </div>
            </div>
          </section>

          {/* Amenities */}
          <section>
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-[#323235]">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1d5fa8] text-xs text-white">2</span>
              Tien ich di kem
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {amenityOptions.map((amenity) => {
                const Icon = amenity.icon
                const isSelected = amenities.includes(amenity.id)
                return (
                  <button
                    key={amenity.id}
                    type="button"
                    onClick={() => toggleAmenity(amenity.id)}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-colors ${
                      isSelected
                        ? 'border-[#1d5fa8] bg-blue-50 text-[#1d5fa8]'
                        : 'border-gray-200 bg-white text-[#7b7a7d] hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{amenity.label}</span>
                  </button>
                )
              })}
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="w-[304px] space-y-6">
          {/* Financial */}
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-base font-semibold text-[#323235]">Tai chinh</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm text-[#7b7a7d]">
                  Gia thue co ban (d) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formatCurrency(form.baseRent)}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '')
                    updateField('baseRent', parseInt(raw) || 0)
                  }}
                  className={`w-full rounded-lg border px-3 py-2.5 text-right text-sm font-medium text-[#1d5fa8] focus:outline-none ${
                    errors.baseRent ? 'border-red-400' : 'border-[#1d5fa8] focus:border-[#1d5fa8]'
                  }`}
                />
                {errors.baseRent && <p className="mt-1 text-xs text-red-500">{errors.baseRent}</p>}
              </div>
            </div>
          </section>

          {/* Operations */}
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-base font-semibold text-[#323235]">Van hanh</h3>
            <div className="space-y-4">
              {/* Max occupants */}
              <div>
                <label className="mb-1.5 block text-sm text-[#7b7a7d]">So nguoi toi da</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => updateField('maxOccupants', Math.max(1, form.maxOccupants - 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-[#7b7a7d] transition-colors hover:bg-gray-50"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-[32px] text-center text-lg font-semibold text-[#323235]">
                    {form.maxOccupants}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateField('maxOccupants', form.maxOccupants + 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-[#7b7a7d] transition-colors hover:bg-gray-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="mb-2 block text-sm text-[#7b7a7d]">Trang thai phong</label>
                <div className="space-y-2">
                  {statusOptions.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                        form.status === opt.value
                          ? 'border-[#1d5fa8] bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="status"
                        value={opt.value}
                        checked={form.status === opt.value}
                        onChange={() => updateField('status', opt.value)}
                        className="sr-only"
                      />
                      <span className={`h-3 w-3 rounded-full ${opt.color}`} />
                      <div>
                        <p className="text-sm font-medium text-[#323235]">{opt.label}</p>
                        <p className="text-xs text-[#7b7a7d]">{opt.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Tenant list — only when editing an existing room */}
          {isEdit && existingRoom && (
            <RoomTenantList room={existingRoom} />
          )}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-[#7b7a7d] transition-colors hover:text-[#323235]"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lai
        </button>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-[#323235] transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Huy thay doi
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-lg bg-[#1d5fa8] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#174d8a] disabled:opacity-50"
          >
            {isSaving ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? 'Dang luu...' : 'Hoan tat & Luu'}
          </button>
        </div>
      </div>
    </div>
  )
}
