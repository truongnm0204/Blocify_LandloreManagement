import { api } from '@/lib/axios'
import type { User, PaginatedResponse, UserRole, UserStatus } from '@/types'

export interface CreateUserPayload {
  email: string
  password: string
  fullName: string
  phoneNumber?: string
  role?: UserRole
}

export interface UpdateUserPayload {
  fullName?: string
  phoneNumber?: string
  role?: UserRole
}

export interface UsersQueryParams {
  page?: number
  limit?: number
  role?: UserRole
  status?: UserStatus
}

export const usersApi = {
  getUsers: (params: UsersQueryParams = {}) =>
    api
      .get<PaginatedResponse<User>>('/users', { params })
      .then((r) => r.data),

  getUser: (id: string) =>
    api.get<User>(`/users/${id}`).then((r) => r.data),

  createUser: (data: CreateUserPayload) =>
    api.post<User>('/users', data).then((r) => r.data),

  updateUser: (id: string, data: UpdateUserPayload) =>
    api.patch<User>(`/users/${id}`, data).then((r) => r.data),

  toggleStatus: (id: string) =>
    api.patch<User>(`/users/${id}/status`).then((r) => r.data),
}
