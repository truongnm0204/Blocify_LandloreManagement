import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  invoicesApi,
  type InvoiceQueryParams,
  type GenerateInvoicePayload,
  type UpdateInvoicePayload,
} from '@/api/invoices.api'
import { useToastStore } from '@/stores/toast.store'
import { getErrorMessage } from '@/lib/error-utils'

export function useInvoices(params: InvoiceQueryParams = {}) {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: () => invoicesApi.getInvoices(params),
  })
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: ['invoices', id],
    queryFn: () => invoicesApi.getInvoice(id),
    enabled: !!id,
  })
}

export function useGenerateInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: GenerateInvoicePayload) => invoicesApi.generateInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['meter-readings'] })
      useToastStore.getState().add({ type: 'success', title: 'Tao hoa don thanh cong' })
    },
    onError: (err) => {
      useToastStore.getState().add({ type: 'error', title: 'Tao hoa don that bai', message: getErrorMessage(err) })
    },
  })
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInvoicePayload }) =>
      invoicesApi.updateInvoice(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      useToastStore.getState().add({ type: 'success', title: 'Cap nhat hoa don thanh cong' })
    },
    onError: (err) => {
      useToastStore.getState().add({ type: 'error', title: 'Cap nhat hoa don that bai', message: getErrorMessage(err) })
    },
  })
}

export function useIssueInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => invoicesApi.issueInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['meter-readings'] })
      useToastStore.getState().add({ type: 'success', title: 'Phat hanh hoa don thanh cong' })
    },
    onError: (err) => {
      useToastStore.getState().add({ type: 'error', title: 'Phat hanh hoa don that bai', message: getErrorMessage(err) })
    },
  })
}
