import { api } from '@/lib/axios'
import type { PaymentWithRelations, PaginatedApiResponse } from '@/types'

export interface PaymentQueryParams {
  page?: number
  limit?: number
  invoiceId?: string
  motelId?: string
  paymentMethod?: string
}

export interface CreatePaymentPayload {
  invoiceId: string
  amount: number
  paymentDate: string
  paymentMethod: string
  referenceNumber?: string
  note?: string
}

export interface UpdatePaymentPayload {
  referenceNumber?: string
  note?: string
}

export const paymentsApi = {
  getPayments: (params: PaymentQueryParams = {}) =>
    api
      .get<PaginatedApiResponse<PaymentWithRelations>>('/payments', { params })
      .then((r) => r.data),

  getPayment: (id: string) =>
    api.get<PaymentWithRelations>(`/payments/${id}`).then((r) => r.data),

  createPayment: (data: CreatePaymentPayload) =>
    api.post<PaymentWithRelations>('/payments', data).then((r) => r.data),

  updatePayment: (id: string, data: UpdatePaymentPayload) =>
    api.patch<PaymentWithRelations>(`/payments/${id}`, data).then((r) => r.data),
}
