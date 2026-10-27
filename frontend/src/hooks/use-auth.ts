import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/api/auth.api'
import { useAuthStore } from '@/stores/auth.store'
import type { LoginPayload } from '@/api/auth.api'

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)

  return useMutation({
    mutationFn: (data: LoginPayload) => authApi.login(data),
    onSuccess: (res) => {
      setAuth(res.access_token, res.user)
    },
  })
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth)

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      clearAuth()
    },
  })
}
