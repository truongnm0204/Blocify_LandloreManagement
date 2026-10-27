import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  vehiclesApi,
  type VehicleQueryParams,
  type CreateVehiclePayload,
  type UpdateVehiclePayload,
} from '@/api/vehicles.api'
import { useToastStore } from '@/stores/toast.store'
import { getErrorMessage } from '@/lib/error-utils'

export function useVehicles(params: VehicleQueryParams = {}) {
  return useQuery({
    queryKey: ['vehicles', params],
    queryFn: () => vehiclesApi.getVehicles(params),
  })
}

export function useVehicle(id: string) {
  return useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => vehiclesApi.getVehicle(id),
    enabled: !!id,
  })
}

export function useCreateVehicle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateVehiclePayload) => vehiclesApi.createVehicle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      useToastStore.getState().add({ type: 'success', title: 'Them phuong tien thanh cong' })
    },
    onError: (err) => {
      useToastStore.getState().add({ type: 'error', title: 'Them phuong tien that bai', message: getErrorMessage(err) })
    },
  })
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVehiclePayload }) =>
      vehiclesApi.updateVehicle(id, data),
    onSuccess: (_result, { id }) => {
      // Invalidate both list and single vehicle cache
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      queryClient.invalidateQueries({ queryKey: ['vehicle', id] })
      useToastStore.getState().add({ type: 'success', title: 'Cap nhat phuong tien thanh cong' })
    },
    onError: (err) => {
      useToastStore.getState().add({ type: 'error', title: 'Cap nhat phuong tien that bai', message: getErrorMessage(err) })
    },
  })
}
