import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  paymentsApi,
  type PaymentQueryParams,
  type CreatePaymentPayload,
  type UpdatePaymentPayload,
} from '@/api/payments.api'
import { useToastStore } from '@/stores/toast.store'
import { getErrorMessage } from '@/lib/error-utils'

export function usePayments(params: PaymentQueryParams = {}) {
  return useQuery({
    queryKey: ['payments', params],
    queryFn: () => paymentsApi.getPayments(params),
  })
}

export function usePayment(id: string) {
  return useQuery({
    queryKey: ['payments', id],
    queryFn: () => paymentsApi.getPayment(id),
    enabled: !!id,
  })
}

export function useCreatePayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreatePaymentPayload) => paymentsApi.createPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      useToastStore.getState().add({ type: 'success', title: 'Ghi nhan thanh toan thanh cong' })
    },
    onError: (err) => {
      useToastStore.getState().add({ type: 'error', title: 'Ghi nhan thanh toan that bai', message: getErrorMessage(err) })
    },
  })
}

export function useUpdatePayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePaymentPayload }) =>
      paymentsApi.updatePayment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      useToastStore.getState().add({ type: 'success', title: 'Cap nhat thanh toan thanh cong' })
    },
    onError: (err) => {
      useToastStore.getState().add({ type: 'error', title: 'Cap nhat thanh toan that bai', message: getErrorMessage(err) })
    },
  })
}
