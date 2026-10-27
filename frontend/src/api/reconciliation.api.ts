import { api } from '@/lib/axios'

export interface ReconcileItem {
  invoiceId: string
  amount: number
  paymentDate: string
  paymentMethod: string
  rawText?: string
  referenceNumber?: string
}

export interface ReconcileBatchPayload {
  items: ReconcileItem[]
}

export interface ReconcileBatchResult {
  total: number
  success: number
  failed: number
  results: {
    success: boolean
    invoiceId: string
    paymentId?: string
    error?: string
  }[]
}

export const reconciliationApi = {
  reconcileBatch: (data: ReconcileBatchPayload) =>
    api.post<ReconcileBatchResult>('/reconciliation/batch', data).then((r) => r.data),

  getHistory: (page = 1, limit = 20) =>
    api.get('/reconciliation/history', { params: { page, limit } }).then((r) => r.data),
}
