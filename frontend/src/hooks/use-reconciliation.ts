import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { reconciliationApi, type ReconcileBatchPayload } from '@/api/reconciliation.api'
import { useToastStore } from '@/stores/toast.store'
import { getErrorMessage } from '@/lib/error-utils'

export function useReconcileBatch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ReconcileBatchPayload) => reconciliationApi.reconcileBatch(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['reconciliation-history'] })

      if (result.success > 0) {
        useToastStore.getState().add({
          type: 'success',
          title: `Ghi nhan thanh cong ${result.success}/${result.total} thanh toan`,
        })
      }
      if (result.failed > 0) {
        useToastStore.getState().add({
          type: 'error',
          title: `${result.failed} giao dich ghi nhan that bai`,
        })
      }
    },
    onError: (err) => {
      useToastStore.getState().add({
        type: 'error',
        title: 'Doi soat that bai',
        message: getErrorMessage(err),
      })
    },
  })
}

export function useReconciliationHistory(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['reconciliation-history', page, limit],
    queryFn: () => reconciliationApi.getHistory(page, limit),
  })
}
