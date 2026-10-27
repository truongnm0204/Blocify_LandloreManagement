import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  tenantsApi,
  type TenantQueryParams,
  type CreateTenantPayload,
  type UpdateTenantPayload,
} from '@/api/tenants.api'
import { useToastStore } from '@/stores/toast.store'
import { getErrorMessage } from '@/lib/error-utils'

export function useTenants(params: TenantQueryParams = {}) {
  return useQuery({
    queryKey: ['tenants', params],
    queryFn: () => tenantsApi.getTenants(params),
  })
}

export function useTenant(id: string) {
  return useQuery({
    queryKey: ['tenants', id],
    queryFn: () => tenantsApi.getTenant(id),
    enabled: !!id,
  })
}

export function useCreateTenant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTenantPayload) => tenantsApi.createTenant(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
      useToastStore.getState().add({ type: 'success', title: 'Tao nguoi thue thanh cong' })
    },
    onError: (err) => {
      useToastStore.getState().add({ type: 'error', title: 'Tao nguoi thue that bai', message: getErrorMessage(err) })
    },
  })
}

export function useUpdateTenant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTenantPayload }) =>
      tenantsApi.updateTenant(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
      useToastStore.getState().add({ type: 'success', title: 'Cap nhat nguoi thue thanh cong' })
    },
    onError: (err) => {
      useToastStore.getState().add({ type: 'error', title: 'Cap nhat nguoi thue that bai', message: getErrorMessage(err) })
    },
  })
}
