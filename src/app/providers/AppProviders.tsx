import type { PropsWithChildren } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './query-client'
import { AuthProvider } from '@/modules/auth/context/AuthProvider'
import { Toaster } from '@/components/ui/sonner'

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <Toaster position="top-right" richColors theme="dark" />
      </AuthProvider>
    </QueryClientProvider>
  )
}
