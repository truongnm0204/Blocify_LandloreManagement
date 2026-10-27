import { api } from '@/lib/axios'
import type { User } from '@/types'

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  user: Pick<User, 'id' | 'email' | 'fullName' | 'role'>
}

export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<LoginResponse>('/auth/login', payload).then((r) => r.data),

  logout: () =>
    api.post('/auth/logout').then((r) => r.data),

  me: () =>
    api.get<User>('/auth/me').then((r) => r.data),
}
