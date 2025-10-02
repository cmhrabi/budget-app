import type { UserProfile, UserPreferences } from '@/types'

/**
 * User Data Service
 *
 * Provides user-scoped data access with namespace-based isolation.
 * All data operations are filtered by authenticated user ID.
 */

// Storage key generators with user namespace
export const getUserStorageKey = (userId: string, key: string): string => {
  if (!userId) {
    throw new UserDataError('User ID is required for data operations')
  }
  return `${userId}:${key}`
}

// Custom errors for user data operations
export class UserDataError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'UserDataError'
  }
}

export class UserNotAuthenticatedError extends UserDataError {
  constructor() {
    super('User must be authenticated to access data', 'NOT_AUTHENTICATED')
    this.name = 'UserNotAuthenticatedError'
  }
}

export class UserDataNotFoundError extends UserDataError {
  constructor(userId: string) {
    super(`User data not found for user: ${userId}`, 'USER_DATA_NOT_FOUND')
    this.name = 'UserDataNotFoundError'
  }
}

export class StorageQuotaExceededError extends UserDataError {
  constructor() {
    super('Storage quota exceeded. Please free up space.', 'QUOTA_EXCEEDED')
    this.name = 'StorageQuotaExceededError'
  }
}

/**
 * Get user profile from localStorage
 */
export function getUserProfile(userId: string): UserProfile | null {
  if (!userId) {
    throw new UserNotAuthenticatedError()
  }

  try {
    const key = getUserStorageKey(userId, 'profile')
    const stored = localStorage.getItem(key)

    if (!stored) {
      return null
    }

    const profile = JSON.parse(stored)
    return {
      ...profile,
      createdAt: new Date(profile.createdAt),
      lastUpdatedAt: new Date(profile.lastUpdatedAt),
      metadata: {
        ...profile.metadata,
        lastLoginAt: profile.metadata?.lastLoginAt
          ? new Date(profile.metadata.lastLoginAt)
          : undefined,
      },
    }
  } catch (error) {
    if (error instanceof UserDataError) {
      throw error
    }
    console.warn('Failed to parse user profile from localStorage:', error)
    return null
  }
}

/**
 * Save user profile to localStorage
 */
export function saveUserProfile(profile: UserProfile): void {
  if (!profile.userId) {
    throw new UserNotAuthenticatedError()
  }

  try {
    const key = getUserStorageKey(profile.userId, 'profile')
    localStorage.setItem(key, JSON.stringify(profile))
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      throw new StorageQuotaExceededError()
    }
    throw new UserDataError('Failed to save user profile')
  }
}

/**
 * Get user preferences from localStorage
 */
export function getUserPreferences(userId: string): UserPreferences | null {
  if (!userId) {
    throw new UserNotAuthenticatedError()
  }

  try {
    const key = getUserStorageKey(userId, 'preferences')
    const stored = localStorage.getItem(key)

    if (!stored) {
      return null
    }

    return JSON.parse(stored)
  } catch (error) {
    if (error instanceof UserDataError) {
      throw error
    }
    console.warn('Failed to parse user preferences from localStorage:', error)
    return null
  }
}

/**
 * Save user preferences to localStorage
 */
export function saveUserPreferences(userId: string, preferences: UserPreferences): void {
  if (!userId) {
    throw new UserNotAuthenticatedError()
  }

  try {
    const key = getUserStorageKey(userId, 'preferences')
    localStorage.setItem(key, JSON.stringify(preferences))
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      throw new StorageQuotaExceededError()
    }
    throw new UserDataError('Failed to save user preferences')
  }
}

/**
 * Initialize user data for a new user
 * Returns true if this is a new user, false if data already exists
 */
export function initializeUserData(
  userId: string,
  email: string,
  name?: string,
  picture?: string
): boolean {
  if (!userId) {
    throw new UserNotAuthenticatedError()
  }

  // Check if user profile already exists
  const existingProfile = getUserProfile(userId)
  if (existingProfile) {
    // Update last login time
    saveUserProfile({
      ...existingProfile,
      lastUpdatedAt: new Date(),
      metadata: {
        ...existingProfile.metadata,
        lastLoginAt: new Date(),
      },
    })
    return false // Returning user
  }

  // Create new user profile
  const now = new Date()
  const newProfile: UserProfile = {
    userId,
    email,
    name,
    picture,
    createdAt: now,
    lastUpdatedAt: now,
    metadata: {
      onboardingCompleted: false,
      lastLoginAt: now,
    },
  }

  saveUserProfile(newProfile)
  return true // New user
}

/**
 * Check if user has completed onboarding
 */
export function hasCompletedOnboarding(userId: string): boolean {
  const profile = getUserProfile(userId)
  return profile?.metadata?.onboardingCompleted ?? false
}

/**
 * Mark user onboarding as complete
 */
export function completeOnboarding(userId: string): void {
  const profile = getUserProfile(userId)
  if (!profile) {
    throw new UserDataNotFoundError(userId)
  }

  saveUserProfile({
    ...profile,
    lastUpdatedAt: new Date(),
    metadata: {
      ...profile.metadata,
      onboardingCompleted: true,
    },
  })
}

/**
 * Clear all user data (use with caution - typically for logout or account deletion)
 */
export function clearUserData(userId: string): void {
  if (!userId) {
    throw new UserNotAuthenticatedError()
  }

  const keysToRemove = [
    getUserStorageKey(userId, 'profile'),
    getUserStorageKey(userId, 'preferences'),
    getUserStorageKey(userId, 'transactions'),
    getUserStorageKey(userId, 'purchases'),
  ]

  keysToRemove.forEach(key => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.warn(`Failed to remove key ${key}:`, error)
    }
  })
}
