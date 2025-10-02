'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@auth0/nextjs-auth0'
import {
  initializeUserData,
  getUserProfile,
  hasCompletedOnboarding,
} from '@/services/user-data-service'
import { generateMockPurchasesForUser } from '@/lib/mock-data'
import { getUserStorageKey } from '@/services/user-data-service'
import { useAppPreferences } from './use-app-preferences'
import { defaultPreferences } from './use-app-preferences'
import type { UserProfile } from '@/types'

interface UseUserDataReturn {
  userProfile: UserProfile | null
  isNewUser: boolean
  hasCompletedOnboarding: boolean
  isInitializing: boolean
  error: Error | null
}

/**
 * Hook to manage user data initialization and state
 * This hook:
 * 1. Initializes user profile on first login
 * 2. Seeds mock data for new users
 * 3. Loads user preferences
 * 4. Tracks onboarding status
 */
export function useUserData(): UseUserDataReturn {
  const { user, isLoading: isAuthLoading } = useUser()
  const { setUserId } = useAppPreferences()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isNewUser, setIsNewUser] = useState(false)
  const [hasCompletedOnboardingFlag, setHasCompletedOnboardingFlag] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (isAuthLoading || !user || !user.sub) {
      return
    }

    const initializeUser = async () => {
      setIsInitializing(true)
      setError(null)

      try {
        const userId = user.sub!
        const email = user.email || ''
        const name = user.name
        const picture = user.picture

        // Initialize user data (creates profile if new user)
        const isNew = initializeUserData(userId, email, name, picture)
        setIsNewUser(isNew)

        // Load user profile
        const profile = getUserProfile(userId)
        setUserProfile(profile)

        // Set user ID in preferences store to load user-scoped preferences
        setUserId(userId)

        // Check onboarding status
        const onboardingComplete = hasCompletedOnboarding(userId)
        setHasCompletedOnboardingFlag(onboardingComplete)

        // For new users, seed mock data
        if (isNew) {
          seedUserData(userId)
        }
      } catch (err) {
        console.error('Failed to initialize user data:', err)
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setIsInitializing(false)
      }
    }

    initializeUser()
  }, [user, isAuthLoading, setUserId])

  // Cleanup on logout
  useEffect(() => {
    if (!isAuthLoading && !user) {
      setUserProfile(null)
      setIsNewUser(false)
      setHasCompletedOnboardingFlag(false)
      setUserId(null)
    }
  }, [user, isAuthLoading, setUserId])

  return {
    userProfile,
    isNewUser,
    hasCompletedOnboarding: hasCompletedOnboardingFlag,
    isInitializing,
    error,
  }
}

/**
 * Seed initial mock data for a new user
 */
function seedUserData(userId: string): void {
  try {
    // Generate deterministic mock purchases for this user
    const mockPurchases = generateMockPurchasesForUser(userId, 50)

    // Save to user-scoped localStorage
    const purchasesKey = getUserStorageKey(userId, 'purchases')
    localStorage.setItem(purchasesKey, JSON.stringify(mockPurchases))

    // Initialize user preferences with defaults
    const preferencesKey = getUserStorageKey(userId, 'preferences')
    localStorage.setItem(preferencesKey, JSON.stringify(defaultPreferences))

    console.log(`Seeded ${mockPurchases.length} mock purchases for user ${userId}`)
  } catch (error) {
    console.error('Failed to seed user data:', error)
  }
}
