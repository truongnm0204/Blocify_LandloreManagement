import { api } from '@/lib/axios'
import type { Vehicle, VehicleType, VehicleStatus, PaginatedApiResponse } from '@/types'

export interface VehicleQueryParams {
  page?: number
  limit?: number
  search?: string
  vehicleType?: VehicleType
  status?: VehicleStatus
  tenantId?: string
  motelId?: string
}

export interface CreateVehiclePayload {
  tenantId: string
  motelId?: string
  licensePlate: string
  vehicleType: VehicleType
  brand?: string
  color?: string
  monthlyFee?: number
  description?: string
  images?: string[]
}

export interface UpdateVehiclePayload {
  tenantId?: string
  motelId?: string
  licensePlate?: string
  vehicleType?: VehicleType
  brand?: string
  color?: string
  monthlyFee?: number
  description?: string
  status?: VehicleStatus
  images?: string[]
}

export const vehiclesApi = {
  getVehicles: (params: VehicleQueryParams = {}) =>
    api
      .get<PaginatedApiResponse<Vehicle>>('/vehicles', { params })
      .then((r) => r.data),

  getVehicle: (id: string) =>
    api.get<Vehicle>(`/vehicles/${id}`).then((r) => r.data),

  createVehicle: (data: CreateVehiclePayload) =>
    api.post<Vehicle>('/vehicles', data).then((r) => r.data),

  updateVehicle: (id: string, data: UpdateVehiclePayload) =>
    api.patch<Vehicle>(`/vehicles/${id}`, data).then((r) => r.data),
}
