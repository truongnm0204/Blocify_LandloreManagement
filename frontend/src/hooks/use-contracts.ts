import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  contractsApi,
  type CreateContractPayload,
  type UpdateContractPayload,
  type ContractQueryParams,
} from '@/api/contracts.api'
import { useToastStore } from '@/stores/toast.store'
import { getErrorMessage } from '@/lib/error-utils'

export function useContracts(params: ContractQueryParams = {}) {
  const { page = 1, limit = 10, motelId, roomId, status, startDateFrom, startDateTo } = params
  return useQuery({
    queryKey: ['contracts', page, limit, motelId, roomId, status, startDateFrom, startDateTo],
    queryFn: () => contractsApi.getContracts(params),
  })
}

export function useContract(id: string) {
  return useQuery({
    queryKey: ['contracts', id],
    queryFn: () => contractsApi.getContract(id),
    enabled: !!id,
  })
}

export function useCreateContract() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateContractPayload) => contractsApi.createContract(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
      useToastStore.getState().add({ type: 'success', title: 'Tao hop dong thanh cong' })
    },
    onError: (err) => {
      useToastStore.getState().add({ type: 'error', title: 'Tao hop dong that bai', message: getErrorMessage(err) })
    },
  })
}

export function useUpdateContract() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateContractPayload }) =>
      contractsApi.updateContract(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
      useToastStore.getState().add({ type: 'success', title: 'Cap nhat hop dong thanh cong' })
    },
    onError: (err) => {
      useToastStore.getState().add({ type: 'error', title: 'Cap nhat hop dong that bai', message: getErrorMessage(err) })
    },
  })
}

export function useDeleteContract() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => contractsApi.deleteContract(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
      useToastStore.getState().add({ type: 'success', title: 'Xoa hop dong thanh cong' })
    },
    onError: (err) => {
      useToastStore.getState().add({ type: 'error', title: 'Xoa hop dong that bai', message: getErrorMessage(err) })
    },
  })
}

export function useActivateContract() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => contractsApi.activateContract(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
      queryClient.invalidateQueries({ queryKey: ['contracts', id] })
      useToastStore.getState().add({ type: 'success', title: 'Kich hoat hop dong thanh cong' })
    },
    onError: (err) => {
      useToastStore.getState().add({ type: 'error', title: 'Kich hoat that bai', message: getErrorMessage(err) })
    },
  })
}

export function useTerminateContract() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { terminationDate: string; reason?: string } }) =>
      contractsApi.terminateContract(id, data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
      queryClient.invalidateQueries({ queryKey: ['contracts', id] })
      useToastStore.getState().add({ type: 'success', title: 'Cham dut hop dong thanh cong' })
    },
    onError: (err) => {
      useToastStore.getState().add({ type: 'error', title: 'Cham dut hop dong that bai', message: getErrorMessage(err) })
    },
  })
}

/** Add a secondary (non-representative) tenant to an ACTIVE contract */
export function useAddContractTenant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ contractId, tenantId }: { contractId: string; tenantId: string }) =>
      contractsApi.addTenant(contractId, tenantId),
    onSuccess: (_data, { contractId }) => {
      queryClient.invalidateQueries({ queryKey: ['contracts', contractId] })
      useToastStore.getState().add({ type: 'success', title: 'Them nguoi thue thanh cong' })
    },
    onError: (err) => {
      useToastStore.getState().add({ type: 'error', title: 'Them nguoi thue that bai', message: getErrorMessage(err) })
    },
  })
}

/** Remove a secondary tenant from an ACTIVE contract (sets leftAt) */
export function useRemoveContractTenant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ contractId, tenantId }: { contractId: string; tenantId: string }) =>
      contractsApi.removeTenant(contractId, tenantId),
    onSuccess: (_data, { contractId }) => {
      queryClient.invalidateQueries({ queryKey: ['contracts', contractId] })
      useToastStore.getState().add({ type: 'success', title: 'Xoa nguoi thue khoi hop dong thanh cong' })
    },
    onError: (err) => {
      useToastStore.getState().add({ type: 'error', title: 'Xoa nguoi thue that bai', message: getErrorMessage(err) })
    },
  })
}
