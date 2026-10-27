import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { roomsApi, type CreateRoomPayload, type UpdateRoomPayload } from '@/api/rooms.api'
import { useToastStore } from '@/stores/toast.store'
import { getErrorMessage } from '@/lib/error-utils'

export function useRooms(motelId?: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: ['rooms', motelId, page, limit],
    queryFn: () => roomsApi.getRooms(motelId, page, limit),
    // no motelId = fetch all rooms belonging to the current user
  })
}

/** Fetch rooms filtered by motelId — only runs when motelId is provided */
export function useRoomsByMotel(motelId: string | undefined, page = 1, limit = 100) {
  return useQuery({
    queryKey: ['rooms', 'byMotel', motelId, page, limit],
    queryFn: () => roomsApi.getRooms(motelId, page, limit),
    enabled: !!motelId,
  })
}

/** Rooms under a specific motel - includes currentTenant info */
export function useMotelRooms(motelId?: string, page = 1, limit = 100) {
  return useQuery({
    queryKey: ['motel-rooms', motelId, page, limit],
    queryFn: () => roomsApi.getMotelRooms(motelId!, page, limit),
    enabled: !!motelId,
  })
}

export function useRoom(id: string) {
  return useQuery({
    queryKey: ['room', id],
    queryFn: () => roomsApi.getRoom(id),
    enabled: !!id,
  })
}

export function useCreateRoom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateRoomPayload) => roomsApi.createRoom(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
      queryClient.invalidateQueries({ queryKey: ['motel-rooms'] })
      useToastStore.getState().add({ type: 'success', title: 'Tao phong thanh cong' })
    },
    onError: (err) => {
      useToastStore.getState().add({ type: 'error', title: 'Tao phong that bai', message: getErrorMessage(err) })
    },
  })
}

export function useUpdateRoom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoomPayload }) =>
      roomsApi.updateRoom(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
      queryClient.invalidateQueries({ queryKey: ['motel-rooms'] })
      useToastStore.getState().add({ type: 'success', title: 'Cap nhat phong thanh cong' })
    },
    onError: (err) => {
      useToastStore.getState().add({ type: 'error', title: 'Cap nhat phong that bai', message: getErrorMessage(err) })
    },
  })
}

export function useDeleteRoom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => roomsApi.deleteRoom(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
      queryClient.invalidateQueries({ queryKey: ['motel-rooms'] })
      useToastStore.getState().add({ type: 'success', title: 'Xoa phong thanh cong' })
    },
    onError: (err) => {
      useToastStore.getState().add({ type: 'error', title: 'Xoa phong that bai', message: getErrorMessage(err) })
    },
  })
}
