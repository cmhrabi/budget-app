'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useUserData } from '@/hooks/use-user-data'
import type { UserProfile } from '@/types'

interface UserDataContextValue {
  userProfile: UserProfile | null
  isNewUser: boolean
  hasCompletedOnboarding: boolean
  isInitializing: boolean
  error: Error | null
}

const UserDataContext = createContext<UserDataContextValue | undefined>(undefined)

interface UserDataProviderProps {
  children: ReactNode
}

/**
 * Provider that initializes and manages user-scoped data
 * Wraps the app to provide user data context to all components
 */
export function UserDataProvider({ children }: UserDataProviderProps) {
  const userData = useUserData()

  return (
    <UserDataContext.Provider value={userData}>
      {children}
    </UserDataContext.Provider>
  )
}

/**
 * Hook to access user data context
 * @throws Error if used outside of UserDataProvider
 */
export function useUserDataContext(): UserDataContextValue {
  const context = useContext(UserDataContext)

  if (context === undefined) {
    throw new Error('useUserDataContext must be used within a UserDataProvider')
  }

  return context
}
