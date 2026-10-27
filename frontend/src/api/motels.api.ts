import { api } from '@/lib/axios'
import type { Motel, MotelDetail, PaginatedResponse } from '@/types'

export interface CreateMotelPayload {
  name: string
  address: string
  description?: string
  defaultElectricityPrice: number
  defaultWaterPrice: number
  defaultServiceFee?: number
  paymentDueDay?: number
  images?: string[]
}

export interface UpdateMotelPayload {
  name?: string
  address?: string
  description?: string
  defaultElectricityPrice?: number
  defaultWaterPrice?: number
  defaultServiceFee?: number
  paymentDueDay?: number
  status?: 'ACTIVE' | 'INACTIVE'
  autoInvoice?: boolean
  images?: string[]
}

export const motelsApi = {
  getMotels: (page = 1, limit = 20) =>
    api
      .get<PaginatedResponse<Motel>>('/motels', { params: { page, limit } })
      .then((r) => r.data),

  getMotel: (id: string) =>
    api.get<MotelDetail>(`/motels/${id}`).then((r) => r.data),

  createMotel: (data: CreateMotelPayload) =>
    api.post<Motel>('/motels', data).then((r) => r.data),

  updateMotel: (id: string, data: UpdateMotelPayload) =>
    api.patch<Motel>(`/motels/${id}`, data).then((r) => r.data),

  deleteMotel: (id: string) =>
    api.delete(`/motels/${id}`).then((r) => r.data),
}
