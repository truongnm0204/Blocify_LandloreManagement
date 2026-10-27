import { api } from '@/lib/axios'
import type { Invoice, PaginatedApiResponse } from '@/types'

export interface InvoiceQueryParams {
  page?: number
  limit?: number
  motelId?: string
  roomId?: string
  contractId?: string
  status?: string
  invoiceMonth?: number
  invoiceYear?: number
  dateFrom?: string
  dateTo?: string
}

export interface GenerateInvoicePayload {
  contractId: string
  invoiceMonth: number
  invoiceYear: number
  billingDate?: string
  dueDate?: string
  surchargeAmount?: number
  discountAmount?: number
  note?: string
}

export interface UpdateInvoicePayload {
  surchargeAmount?: number
  discountAmount?: number
  dueDate?: string
  note?: string
}

export const invoicesApi = {
  getInvoices: (params: InvoiceQueryParams = {}) =>
    api
      .get<PaginatedApiResponse<Invoice>>('/invoices', { params })
      .then((r) => r.data),

  getInvoice: (id: string) =>
    api.get<Invoice>(`/invoices/${id}`).then((r) => r.data),

  generateInvoice: (data: GenerateInvoicePayload) =>
    api.post<Invoice>('/invoices/generate', data).then((r) => r.data),

  updateInvoice: (id: string, data: UpdateInvoicePayload) =>
    api.patch<Invoice>(`/invoices/${id}`, data).then((r) => r.data),

  issueInvoice: (id: string) =>
    api.post<Invoice>(`/invoices/${id}/issue`).then((r) => r.data),
}
