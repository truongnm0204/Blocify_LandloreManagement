import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  expensesApi,
  type ExpenseQueryParams,
  type CreateExpensePayload,
  type UpdateExpensePayload,
} from '@/api/expenses.api'
import { useToastStore } from '@/stores/toast.store'
import { getErrorMessage } from '@/lib/error-utils'

export function useExpenses(params: ExpenseQueryParams = {}) {
  return useQuery({
    queryKey: ['expenses', params],
    queryFn: () => expensesApi.getExpenses(params),
  })
}

export function useExpense(id: string) {
  return useQuery({
    queryKey: ['expenses', id],
    queryFn: () => expensesApi.getExpense(id),
    enabled: !!id,
  })
}

export function useCreateExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateExpensePayload) => expensesApi.createExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      useToastStore.getState().add({ type: 'success', title: 'Them chi phi thanh cong' })
    },
    onError: (err) => {
      useToastStore.getState().add({ type: 'error', title: 'Them chi phi that bai', message: getErrorMessage(err) })
    },
  })
}

export function useUpdateExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExpensePayload }) =>
      expensesApi.updateExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      useToastStore.getState().add({ type: 'success', title: 'Cap nhat chi phi thanh cong' })
    },
    onError: (err) => {
      useToastStore.getState().add({ type: 'error', title: 'Cap nhat chi phi that bai', message: getErrorMessage(err) })
    },
  })
}
