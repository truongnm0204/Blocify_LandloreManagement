import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/api/dashboard.api'

export function useDashboard(motelId?: string) {
  return useQuery({
    queryKey: ['dashboard', motelId],
    queryFn: () => dashboardApi.getOverview(motelId),
  })
}

export function useRevenueTrend(months = 6, motelId?: string) {
  return useQuery({
    queryKey: ['dashboard', 'revenue-trend', months, motelId],
    queryFn: () => dashboardApi.getRevenueTrend(months, motelId),
  })
}

export function useExpenseBreakdown(motelId?: string) {
  return useQuery({
    queryKey: ['dashboard', 'expense-breakdown', motelId],
    queryFn: () => dashboardApi.getExpenseBreakdown(motelId),
  })
}

export function useMotelOccupancy() {
  return useQuery({
    queryKey: ['dashboard', 'motel-occupancy'],
    queryFn: () => dashboardApi.getMotelOccupancy(),
  })
}

export function useRecentTransactions(limit = 10, motelId?: string) {
  return useQuery({
    queryKey: ['dashboard', 'recent-transactions', limit, motelId],
    queryFn: () => dashboardApi.getRecentTransactions(limit, motelId),
  })
}
