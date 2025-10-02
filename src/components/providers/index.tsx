'use client'

import { QueryProvider } from './query-provider'
import { AuthProvider } from '../auth/auth-provider'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <QueryProvider>
        {children}
      </QueryProvider>
    </AuthProvider>
  )
}