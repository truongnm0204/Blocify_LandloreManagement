import { useToastStore } from '@/stores/toast.store'

/** Convenience hook for triggering toasts inside React components */
export function useToast() {
  const add = useToastStore((s) => s.add)
  return {
    success: (title: string, message?: string) => add({ type: 'success', title, message }),
    error: (title: string, message?: string) => add({ type: 'error', title, message }),
    info: (title: string, message?: string) => add({ type: 'info', title, message }),
  }
}
