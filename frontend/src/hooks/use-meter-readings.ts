import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  meterReadingsApi,
  type MeterReadingQueryParams,
  type MeterReadingStatsParams,
  type CreateMeterReadingPayload,
  type UpdateMeterReadingPayload,
} from '@/api/meter-readings.api'
import { useToastStore } from '@/stores/toast.store'
import { getErrorMessage } from '@/lib/error-utils'

export function useMeterReadings(params: MeterReadingQueryParams = {}) {
  return useQuery({
    queryKey: ['meter-readings', params],
    queryFn: () => meterReadingsApi.getMeterReadings(params),
  })
}

export function useMeterReading(id: string) {
  return useQuery({
    queryKey: ['meter-readings', id],
    queryFn: () => meterReadingsApi.getMeterReading(id),
    enabled: !!id,
  })
}

export function useMeterReadingStats(params: MeterReadingStatsParams = {}) {
  return useQuery({
    queryKey: ['meter-reading-stats', params],
    queryFn: () => meterReadingsApi.getStats(params),
  })
}

export function useCreateMeterReading() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateMeterReadingPayload) => meterReadingsApi.createMeterReading(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meter-readings'] })
      queryClient.invalidateQueries({ queryKey: ['meter-reading-stats'] })
      useToastStore.getState().add({ type: 'success', title: 'Them chi so dien nuoc thanh cong' })
    },
    onError: (err) => {
      useToastStore.getState().add({ type: 'error', title: 'Them chi so dien nuoc that bai', message: getErrorMessage(err) })
    },
  })
}

export function useUpdateMeterReading() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMeterReadingPayload }) =>
      meterReadingsApi.updateMeterReading(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meter-readings'] })
      queryClient.invalidateQueries({ queryKey: ['meter-reading-stats'] })
      useToastStore.getState().add({ type: 'success', title: 'Cap nhat chi so thanh cong' })
    },
    onError: (err) => {
      useToastStore.getState().add({ type: 'error', title: 'Cap nhat chi so that bai', message: getErrorMessage(err) })
    },
  })
}

export function useLockMeterReading() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => meterReadingsApi.lockMeterReading(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meter-readings'] })
      queryClient.invalidateQueries({ queryKey: ['meter-reading-stats'] })
      useToastStore.getState().add({ type: 'success', title: 'Khoa chi so thanh cong' })
    },
    onError: (err) => {
      useToastStore.getState().add({ type: 'error', title: 'Khoa chi so that bai', message: getErrorMessage(err) })
    },
  })
}
