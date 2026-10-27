import { api } from '@/lib/axios'
import type { Room, RoomWithTenant, PaginatedResponse } from '@/types'

export interface CreateRoomPayload {
  motelId: string
  roomCode: string
  name: string
  baseRent: number
  floor?: number
  area?: number
  maxOccupants?: number
  notes?: string
}

export interface UpdateRoomPayload extends Partial<CreateRoomPayload> {
  status?: 'VACANT' | 'RESERVED' | 'OCCUPIED' | 'MAINTENANCE'
}

export const roomsApi = {
  getRooms: (motelId?: string, page = 1, limit = 20) =>
    api
      .get<PaginatedResponse<Room>>('/rooms', {
        params: { motelId, page, limit },
      })
      .then((r) => r.data),

  /** Rooms under a specific motel - includes currentTenant */
  getMotelRooms: (motelId: string, page = 1, limit = 100) =>
    api
      .get<PaginatedResponse<RoomWithTenant>>(`/motels/${motelId}/rooms`, {
        params: { page, limit },
      })
      .then((r) => r.data),

  getRoom: (id: string) =>
    api.get<Room>(`/rooms/${id}`).then((r) => r.data),

  createRoom: (data: CreateRoomPayload) =>
    api.post<Room>('/rooms', data).then((r) => r.data),

  updateRoom: (id: string, data: UpdateRoomPayload) =>
    api.patch<Room>(`/rooms/${id}`, data).then((r) => r.data),

  deleteRoom: (id: string) =>
    api.delete(`/rooms/${id}`).then((r) => r.data),
}
