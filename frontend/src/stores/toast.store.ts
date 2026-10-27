import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
}

interface ToastStore {
  toasts: Toast[]
  add: (toast: Omit<Toast, 'id'>) => void
  remove: (id: string) => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  // Prepend new toast, cap at 5 visible toasts
  add: (toast) =>
    set((s) => ({
      toasts: [{ ...toast, id: crypto.randomUUID() }, ...s.toasts].slice(0, 5),
    })),
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))
