'use client'

import { Auth0Provider } from '@auth0/nextjs-auth0'
import { ErrorBoundary } from '../common/error-boundary'

interface AuthProviderProps {
  readonly children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <ErrorBoundary fallback={<div>Authentication service is temporarily unavailable. Please try again later.</div>}>
      <Auth0Provider>
        {children}
      </Auth0Provider>
    </ErrorBoundary>
  )
}