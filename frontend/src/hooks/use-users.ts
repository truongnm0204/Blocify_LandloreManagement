import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '@/api/users.api'
import type { UsersQueryParams, CreateUserPayload, UpdateUserPayload } from '@/api/users.api'
import { useToastStore } from '@/stores/toast.store'
import { getErrorMessage } from '@/lib/error-utils'

export function useUsers(params: UsersQueryParams = {}) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => usersApi.getUsers(params),
  })
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => usersApi.getUser(id),
    enabled: !!id,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateUserPayload) => usersApi.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      useToastStore.getState().add({ type: 'success', title: 'Tao nguoi dung thanh cong' })
    },
    onError: (err) => {
      useToastStore.getState().add({ type: 'error', title: 'Tao nguoi dung that bai', message: getErrorMessage(err) })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserPayload }) =>
      usersApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      useToastStore.getState().add({ type: 'success', title: 'Cap nhat nguoi dung thanh cong' })
    },
    onError: (err) => {
      useToastStore.getState().add({ type: 'error', title: 'Cap nhat nguoi dung that bai', message: getErrorMessage(err) })
    },
  })
}

export function useToggleUserStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => usersApi.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      useToastStore.getState().add({ type: 'success', title: 'Cap nhat trang thai nguoi dung thanh cong' })
    },
    onError: (err) => {
      useToastStore.getState().add({ type: 'error', title: 'Cap nhat trang thai that bai', message: getErrorMessage(err) })
    },
  })
}
