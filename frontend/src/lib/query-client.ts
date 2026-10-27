import { QueryClient } from '@tanstack/react-query'

// Global QueryClient — stale time 1 min, retry once on failure
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
