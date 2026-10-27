import { api } from '@/lib/axios'
import type { Expense, ExpenseCategory, ExpenseStatus, PaginatedApiResponse } from '@/types'

export interface ExpenseQueryParams {
  page?: number
  limit?: number
  motelId?: string
  category?: ExpenseCategory
  status?: ExpenseStatus
  dateFrom?: string
  dateTo?: string
  search?: string
}

export interface CreateExpensePayload {
  motelId: string
  category: ExpenseCategory
  amount: number
  description: string
  note?: string
  date: string
  images?: string[]
}

export interface UpdateExpensePayload {
  motelId?: string
  category?: ExpenseCategory
  amount?: number
  description?: string
  note?: string
  date?: string
  status?: ExpenseStatus
  images?: string[]
}

export const expensesApi = {
  getExpenses: (params: ExpenseQueryParams = {}) =>
    api
      .get<PaginatedApiResponse<Expense>>('/expenses', { params })
      .then((r) => r.data),

  getExpense: (id: string) =>
    api.get<Expense>(`/expenses/${id}`).then((r) => r.data),

  createExpense: (data: CreateExpensePayload) =>
    api.post<Expense>('/expenses', data).then((r) => r.data),

  updateExpense: (id: string, data: UpdateExpensePayload) =>
    api.patch<Expense>(`/expenses/${id}`, data).then((r) => r.data),
}
