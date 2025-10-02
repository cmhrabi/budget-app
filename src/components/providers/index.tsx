'use client'

import { QueryProvider } from './query-provider'
import { AuthProvider } from '../auth/auth-provider'
import { UserDataProvider } from './user-data-provider'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <UserDataProvider>
        <QueryProvider>
          {children}
        </QueryProvider>
      </UserDataProvider>
    </AuthProvider>
  )
}

// Re-export hooks for easy importing
export { useUserDataContext } from './user-data-provider'