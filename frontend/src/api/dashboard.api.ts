import { api } from '@/lib/axios'
import type {
  DashboardData,
  RevenueTrend,
  ExpenseBreakdown,
  MotelOccupancy,
  RecentTransaction,
} from '@/types'

export const dashboardApi = {
  getOverview: (motelId?: string) =>
    api
      .get<DashboardData>('/dashboard', { params: motelId ? { motelId } : {} })
      .then((r) => r.data),

  getRevenueTrend: (months = 6, motelId?: string) =>
    api
      .get<RevenueTrend[]>('/dashboard/revenue-trend', {
        params: { months, ...(motelId ? { motelId } : {}) },
      })
      .then((r) => r.data),

  getExpenseBreakdown: (motelId?: string) =>
    api
      .get<ExpenseBreakdown[]>('/dashboard/expense-breakdown', {
        params: motelId ? { motelId } : {},
      })
      .then((r) => r.data),

  getMotelOccupancy: () =>
    api.get<MotelOccupancy[]>('/dashboard/motel-occupancy').then((r) => r.data),

  getRecentTransactions: (limit = 10, motelId?: string) =>
    api
      .get<RecentTransaction[]>('/dashboard/recent-transactions', {
        params: { limit, ...(motelId ? { motelId } : {}) },
      })
      .then((r) => r.data),
}
