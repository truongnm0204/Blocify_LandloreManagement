import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motelsApi, type CreateMotelPayload, type UpdateMotelPayload } from '@/api/motels.api'
import { useToastStore } from '@/stores/toast.store'
import { getErrorMessage } from '@/lib/error-utils'

export function useMotels(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['motels', page, limit],
    queryFn: () => motelsApi.getMotels(page, limit),
  })
}

export function useMotel(id: string) {
  return useQuery({
    queryKey: ['motel', id],
    queryFn: () => motelsApi.getMotel(id),
    enabled: !!id,
  })
}

export function useCreateMotel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateMotelPayload) => motelsApi.createMotel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['motels'] })
      useToastStore.getState().add({ type: 'success', title: 'Tao toa nha thanh cong' })
    },
    onError: (err) => {
      useToastStore.getState().add({ type: 'error', title: 'Tao toa nha that bai', message: getErrorMessage(err) })
    },
  })
}

export function useUpdateMotel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMotelPayload }) =>
      motelsApi.updateMotel(id, data),
    onSuccess: (_result, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['motels'] })
      queryClient.invalidateQueries({ queryKey: ['motel', id] })
      useToastStore.getState().add({ type: 'success', title: 'Cap nhat toa nha thanh cong' })
    },
    onError: (err) => {
      useToastStore.getState().add({ type: 'error', title: 'Cap nhat toa nha that bai', message: getErrorMessage(err) })
    },
  })
}

export function useDeleteMotel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => motelsApi.deleteMotel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['motels'] })
      useToastStore.getState().add({ type: 'success', title: 'Xoa toa nha thanh cong' })
    },
    onError: (err) => {
      useToastStore.getState().add({ type: 'error', title: 'Xoa toa nha that bai', message: getErrorMessage(err) })
    },
  })
}
