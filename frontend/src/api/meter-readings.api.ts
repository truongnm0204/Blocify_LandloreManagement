import { api } from '@/lib/axios'
import type { MeterReading, MeterReadingStats, PaginatedApiResponse } from '@/types'

export interface MeterReadingQueryParams {
  page?: number
  limit?: number
  motelId?: string
  roomId?: string
  readingMonth?: number
  readingYear?: number
  isLocked?: boolean
}

export interface CreateMeterReadingPayload {
  roomId: string
  readingMonth: number
  readingYear: number
  electricityPrevious: number
  electricityCurrent: number
  waterPrevious: number
  waterCurrent: number
  electricityUnitPrice?: number
  waterUnitPrice?: number
  recordedDate?: string
  note?: string
}

export interface UpdateMeterReadingPayload {
  electricityPrevious?: number
  electricityCurrent?: number
  waterPrevious?: number
  waterCurrent?: number
  electricityUnitPrice?: number
  waterUnitPrice?: number
  recordedDate?: string
  note?: string
}

export interface MeterReadingStatsParams {
  motelId?: string
  readingMonth?: number
  readingYear?: number
}

export const meterReadingsApi = {
  getMeterReadings: (params: MeterReadingQueryParams = {}) =>
    api
      .get<PaginatedApiResponse<MeterReading>>('/meter-readings', { params })
      .then((r) => r.data),

  getMeterReading: (id: string) =>
    api.get<MeterReading>(`/meter-readings/${id}`).then((r) => r.data),

  createMeterReading: (data: CreateMeterReadingPayload) =>
    api.post<MeterReading>('/meter-readings', data).then((r) => r.data),

  updateMeterReading: (id: string, data: UpdateMeterReadingPayload) =>
    api.patch<MeterReading>(`/meter-readings/${id}`, data).then((r) => r.data),

  lockMeterReading: (id: string) =>
    api.post<MeterReading>(`/meter-readings/${id}/lock`).then((r) => r.data),

  getStats: (params: MeterReadingStatsParams = {}) =>
    api.get<MeterReadingStats>('/meter-readings/stats', { params }).then((r) => r.data),
}
