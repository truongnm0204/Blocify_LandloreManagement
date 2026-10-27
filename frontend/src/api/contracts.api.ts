import { api } from '@/lib/axios'
import type { Contract, PaginatedResponse } from '@/types'

export interface ContractTenantPayload {
  tenantId: string
  isRepresentative: boolean
}

export interface CreateContractPayload {
  roomId: string
  startDate: string
  endDate?: string
  signedDate?: string
  rentAmount: number
  depositAmount: number
  serviceFee?: number
  occupantCount?: number
  note?: string
  tenants: ContractTenantPayload[]
}

export interface UpdateContractPayload extends Partial<CreateContractPayload> {
  status?: 'DRAFT' | 'ACTIVE' | 'ENDED' | 'CANCELLED'
}

export interface ContractQueryParams {
  page?: number
  limit?: number
  motelId?: string
  roomId?: string
  status?: string
  startDateFrom?: string
  startDateTo?: string
}

export const contractsApi = {
  getContracts: (params: ContractQueryParams = {}) => {
    const { page = 1, limit = 10, motelId, roomId, status, startDateFrom, startDateTo } = params
    return api
      .get<{ data: Contract[]; meta: { total: number; page: number; limit: number; totalPages: number } }>('/contracts', {
        params: {
          page,
          limit,
          ...(motelId ? { motelId } : {}),
          ...(roomId ? { roomId } : {}),
          ...(status ? { status } : {}),
          ...(startDateFrom ? { startDateFrom } : {}),
          ...(startDateTo ? { startDateTo } : {}),
        },
      })
      .then((r) => {
        const { data, meta } = r.data
        return { data, total: meta.total, page: meta.page, limit: meta.limit } as PaginatedResponse<Contract>
      })
  },

  getContract: (id: string) =>
    api.get<Contract>(`/contracts/${id}`).then((r) => r.data),

  createContract: (data: CreateContractPayload) =>
    api.post<Contract>('/contracts', data).then((r) => r.data),

  updateContract: (id: string, data: UpdateContractPayload) =>
    api.patch<Contract>(`/contracts/${id}`, data).then((r) => r.data),

  deleteContract: (id: string) =>
    api.delete(`/contracts/${id}`).then((r) => r.data),

  activateContract: (id: string) =>
    api.post<Contract>(`/contracts/${id}/activate`).then((r) => r.data),

  terminateContract: (id: string, data: { terminationDate: string; reason?: string }) =>
    api.post<Contract>(`/contracts/${id}/terminate`, data).then((r) => r.data),

  cancelContract: (id: string) =>
    api.post<Contract>(`/contracts/${id}/cancel`).then((r) => r.data),

  // Add a secondary (non-representative) tenant to an ACTIVE contract
  addTenant: (contractId: string, tenantId: string) =>
    api.post(`/contracts/${contractId}/tenants`, { tenantId }).then((r) => r.data),

  // Remove a secondary tenant from an ACTIVE contract (sets leftAt)
  removeTenant: (contractId: string, tenantId: string) =>
    api.delete(`/contracts/${contractId}/tenants/${tenantId}`).then((r) => r.data),
}
