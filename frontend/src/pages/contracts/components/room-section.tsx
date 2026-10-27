import { DoorOpen } from 'lucide-react'
import { useMotels } from '@/hooks/use-motels'
import { useRoomsByMotel } from '@/hooks/use-rooms'
import type { ContractFormData } from './contract-form-types'

interface Props {
  data: ContractFormData
  onChange: (field: keyof ContractFormData, value: string) => void
}

export function RoomSection({ data, onChange }: Props) {
  const { data: motelsData } = useMotels(1, 50)
  const motels = motelsData?.data ?? []

  const { data: roomsData } = useRoomsByMotel(data.motelId || undefined, 1, 100)
  const rooms = roomsData?.data ?? []

  const selectedRoom = rooms.find((r) => r.id === data.roomId) ?? null

  function handleMotelChange(motelId: string) {
    onChange('motelId', motelId)
    onChange('roomId', '')
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c8e6ff]">
          <DoorOpen className="h-4 w-4 text-[#1d5fa8]" />
        </div>
        <h3 className="text-base font-semibold text-[#323235]">Phong thue</h3>
      </div>

      <div className="flex flex-col gap-3">
        {/* Toa nha */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#323235]">
            Toa nha <span className="text-red-500">*</span>
          </label>
          <select
            value={data.motelId}
            onChange={(e) => handleMotelChange(e.target.value)}
            className="rounded-lg border border-gray-200 bg-[#f8fafc] px-3 py-2.5 text-sm text-[#323235] focus:border-[#1d5fa8] focus:outline-none"
          >
            <option value="">Chon toa nha...</option>
            {motels.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* Phong */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#323235]">
            Phong <span className="text-red-500">*</span>
          </label>
          <select
            value={data.roomId}
            onChange={(e) => onChange('roomId', e.target.value)}
            disabled={!data.motelId}
            className="rounded-lg border border-gray-200 bg-[#f8fafc] px-3 py-2.5 text-sm text-[#323235] focus:border-[#1d5fa8] focus:outline-none disabled:opacity-50"
          >
            <option value="">Chon phong...</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.roomCode}{r.name ? ` - ${r.name}` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Selected room info */}
        {selectedRoom && (
          <div className="rounded-lg border border-gray-200 bg-[#f5f6fa] p-4">
            <p className="text-sm font-semibold text-[#323235]">
              {selectedRoom.roomCode}{selectedRoom.name ? ` - ${selectedRoom.name}` : ''}
            </p>
            {selectedRoom.area && (
              <p className="mt-1 text-xs text-[#7b7a7d]">{selectedRoom.area} m2</p>
            )}
            <p className="mt-0.5 text-xs font-medium text-[#1d5fa8]">
              {new Intl.NumberFormat('vi-VN').format(selectedRoom.baseRent)} d/thang
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
