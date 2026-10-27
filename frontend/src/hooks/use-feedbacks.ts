import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  feedbacksApi,
  type FeedbackQueryParams,
  type FeedbackStatsParams,
  type CreateFeedbackPayload,
  type UpdateFeedbackPayload,
} from '@/api/feedbacks.api'
import { useToastStore } from '@/stores/toast.store'
import { getErrorMessage } from '@/lib/error-utils'

export function useFeedbacks(params: FeedbackQueryParams = {}) {
  return useQuery({
    queryKey: ['feedbacks', params],
    queryFn: () => feedbacksApi.getFeedbacks(params),
  })
}

export function useFeedback(id: string) {
  return useQuery({
    queryKey: ['feedbacks', id],
    queryFn: () => feedbacksApi.getFeedback(id),
    enabled: !!id,
  })
}

export function useFeedbackStats(params: FeedbackStatsParams = {}) {
  return useQuery({
    queryKey: ['feedback-stats', params],
    queryFn: () => feedbacksApi.getFeedbackStats(params),
  })
}

export function useCreateFeedback() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateFeedbackPayload) => feedbacksApi.createFeedback(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] })
      queryClient.invalidateQueries({ queryKey: ['feedback-stats'] })
      useToastStore.getState().add({ type: 'success', title: 'Gui y kien thanh cong' })
    },
    onError: (err) => {
      useToastStore.getState().add({ type: 'error', title: 'Gui y kien that bai', message: getErrorMessage(err) })
    },
  })
}

export function useUpdateFeedback() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFeedbackPayload }) =>
      feedbacksApi.updateFeedback(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] })
      queryClient.invalidateQueries({ queryKey: ['feedback-stats'] })
      useToastStore.getState().add({ type: 'success', title: 'Cap nhat y kien thanh cong' })
    },
    onError: (err) => {
      useToastStore.getState().add({ type: 'error', title: 'Cap nhat y kien that bai', message: getErrorMessage(err) })
    },
  })
}
