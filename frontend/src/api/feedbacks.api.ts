import { api } from '@/lib/axios'
import type {
  Feedback,
  FeedbackStats,
  FeedbackStatus,
  FeedbackCategory,
  FeedbackPriority,
  PaginatedApiResponse,
} from '@/types'

export interface FeedbackQueryParams {
  page?: number
  limit?: number
  search?: string
  status?: FeedbackStatus
  category?: FeedbackCategory
  priority?: FeedbackPriority
  motelId?: string
  roomId?: string
  tenantId?: string
}

export interface CreateFeedbackPayload {
  title: string
  description: string
  category: FeedbackCategory
  priority?: FeedbackPriority
  tenantId: string
  motelId: string
  roomId?: string
  images?: string[]
}

export interface UpdateFeedbackPayload {
  title?: string
  description?: string
  category?: FeedbackCategory
  priority?: FeedbackPriority
  status?: FeedbackStatus
  resolution?: string
  assignedToId?: string
  tenantId?: string
  motelId?: string
  roomId?: string
  images?: string[]
}

export interface FeedbackStatsParams {
  motelId?: string
}

export const feedbacksApi = {
  getFeedbacks: (params: FeedbackQueryParams = {}) =>
    api
      .get<PaginatedApiResponse<Feedback>>('/feedbacks', { params })
      .then((r) => r.data),

  getFeedback: (id: string) =>
    api.get<Feedback>(`/feedbacks/${id}`).then((r) => r.data),

  getFeedbackStats: (params: FeedbackStatsParams = {}) =>
    api.get<FeedbackStats>('/feedbacks/stats', { params }).then((r) => r.data),

  createFeedback: (data: CreateFeedbackPayload) =>
    api.post<Feedback>('/feedbacks', data).then((r) => r.data),

  updateFeedback: (id: string, data: UpdateFeedbackPayload) =>
    api.patch<Feedback>(`/feedbacks/${id}`, data).then((r) => r.data),
}
