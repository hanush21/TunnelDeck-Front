import { QueryClient } from '@tanstack/react-query'
import { ApiError } from '@/shared/lib/http-client'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof ApiError && ['FORBIDDEN', 'UNAUTHORIZED'].includes(error.code)) {
          return false
        }

        return failureCount < 2
      },
      refetchOnWindowFocus: false,
    },
  },
})
