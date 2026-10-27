import { api } from '@/lib/axios'
import type { Tenant, TenantWithContracts, TenantStatus, PaginatedApiResponse } from '@/types'

export interface TenantQueryParams {
  page?: number
  limit?: number
  search?: string
  status?: TenantStatus
  motelId?: string
}

export interface CreateTenantPayload {
  fullName: string
  phoneNumber: string
  email?: string
  citizenId?: string
  dateOfBirth?: string
  gender?: string
  permanentAddress?: string
  vehicleNumber?: string
  note?: string
}

export interface UpdateTenantPayload {
  fullName?: string
  phoneNumber?: string
  email?: string
  citizenId?: string
  dateOfBirth?: string
  gender?: string
  permanentAddress?: string
  vehicleNumber?: string
  note?: string
  status?: TenantStatus
}

export const tenantsApi = {
  getTenants: (params: TenantQueryParams = {}) =>
    api
      .get<PaginatedApiResponse<Tenant>>('/tenants', { params })
      .then((r) => r.data),

  getTenant: (id: string) =>
    api.get<TenantWithContracts>(`/tenants/${id}`).then((r) => r.data),

  createTenant: (data: CreateTenantPayload) =>
    api.post<Tenant>('/tenants', data).then((r) => r.data),

  updateTenant: (id: string, data: UpdateTenantPayload) =>
    api.patch<Tenant>(`/tenants/${id}`, data).then((r) => r.data),
}
