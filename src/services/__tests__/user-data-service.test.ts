import {
  getUserStorageKey,
  getUserProfile,
  saveUserProfile,
  getUserPreferences,
  saveUserPreferences,
  initializeUserData,
  hasCompletedOnboarding,
  completeOnboarding,
  clearUserData,
  UserDataError,
  UserNotAuthenticatedError,
  UserDataNotFoundError,
} from '../user-data-service'
import type { UserProfile, UserPreferences } from '@/types'

describe('User Data Service', () => {
  const testUserId = 'auth0|test123'
  const testEmail = 'test@example.com'
  const testName = 'Test User'

  beforeEach(() => {
    localStorage.clear()
  })

  describe('getUserStorageKey', () => {
    it('should generate namespaced storage key', () => {
      const key = getUserStorageKey(testUserId, 'profile')
      expect(key).toBe(`${testUserId}:profile`)
    })

    it('should throw error if userId is empty', () => {
      expect(() => getUserStorageKey('', 'profile')).toThrow(UserDataError)
    })
  })

  describe('User Profile Operations', () => {
    it('should return null for non-existent profile', () => {
      const profile = getUserProfile(testUserId)
      expect(profile).toBeNull()
    })

    it('should save and retrieve user profile', () => {
      const profile: UserProfile = {
        userId: testUserId,
        email: testEmail,
        name: testName,
        createdAt: new Date(),
        lastUpdatedAt: new Date(),
      }

      saveUserProfile(profile)
      const retrieved = getUserProfile(testUserId)

      expect(retrieved).toBeTruthy()
      expect(retrieved?.userId).toBe(testUserId)
      expect(retrieved?.email).toBe(testEmail)
      expect(retrieved?.name).toBe(testName)
    })

    it('should parse dates correctly when retrieving profile', () => {
      const now = new Date()
      const profile: UserProfile = {
        userId: testUserId,
        email: testEmail,
        createdAt: now,
        lastUpdatedAt: now,
        metadata: {
          lastLoginAt: now,
        },
      }

      saveUserProfile(profile)
      const retrieved = getUserProfile(testUserId)

      expect(retrieved?.createdAt).toBeInstanceOf(Date)
      expect(retrieved?.lastUpdatedAt).toBeInstanceOf(Date)
      expect(retrieved?.metadata?.lastLoginAt).toBeInstanceOf(Date)
    })

    it('should throw error when saving profile without userId', () => {
      const profile = {
        userId: '',
        email: testEmail,
        createdAt: new Date(),
        lastUpdatedAt: new Date(),
      } as UserProfile

      expect(() => saveUserProfile(profile)).toThrow(UserNotAuthenticatedError)
    })
  })

  describe('User Preferences Operations', () => {
    const testPreferences: UserPreferences = {
      defaultCurrency: 'CAD',
      dateFormat: 'MM/DD/YYYY',
      theme: 'dark',
      language: 'en',
      notifications: {
        email: true,
        push: false,
        weeklyReport: true,
        monthlyReport: true,
        largeTransactionAlert: true,
        largeTransactionThreshold: 500,
      },
      privacy: {
        shareAnalytics: false,
        rememberFilters: true,
      },
    }

    it('should return null for non-existent preferences', () => {
      const prefs = getUserPreferences(testUserId)
      expect(prefs).toBeNull()
    })

    it('should save and retrieve user preferences', () => {
      saveUserPreferences(testUserId, testPreferences)
      const retrieved = getUserPreferences(testUserId)

      expect(retrieved).toEqual(testPreferences)
    })

    it('should isolate preferences by user', () => {
      const user1Id = 'auth0|user1'
      const user2Id = 'auth0|user2'

      const prefs1: UserPreferences = { ...testPreferences, theme: 'light' }
      const prefs2: UserPreferences = { ...testPreferences, theme: 'dark' }

      saveUserPreferences(user1Id, prefs1)
      saveUserPreferences(user2Id, prefs2)

      expect(getUserPreferences(user1Id)?.theme).toBe('light')
      expect(getUserPreferences(user2Id)?.theme).toBe('dark')
    })
  })

  describe('User Initialization', () => {
    it('should create new user profile on first initialization', () => {
      const isNew = initializeUserData(testUserId, testEmail, testName)

      expect(isNew).toBe(true)
      const profile = getUserProfile(testUserId)
      expect(profile?.userId).toBe(testUserId)
      expect(profile?.email).toBe(testEmail)
      expect(profile?.name).toBe(testName)
      expect(profile?.metadata?.onboardingCompleted).toBe(false)
    })

    it('should update last login for returning user', () => {
      // First initialization
      initializeUserData(testUserId, testEmail, testName)
      const firstProfile = getUserProfile(testUserId)
      const firstLoginTime = firstProfile?.metadata?.lastLoginAt

      // Wait a bit
      const waitTime = 10
      const start = Date.now()
      while (Date.now() - start < waitTime) {
        // busy wait
      }

      // Second initialization
      const isNew = initializeUserData(testUserId, testEmail, testName)
      const secondProfile = getUserProfile(testUserId)
      const secondLoginTime = secondProfile?.metadata?.lastLoginAt

      expect(isNew).toBe(false)
      expect(secondLoginTime).not.toEqual(firstLoginTime)
      if (firstLoginTime && secondLoginTime) {
        expect(secondLoginTime.getTime()).toBeGreaterThan(firstLoginTime.getTime())
      }
    })
  })

  describe('Onboarding', () => {
    it('should track onboarding status', () => {
      initializeUserData(testUserId, testEmail)

      expect(hasCompletedOnboarding(testUserId)).toBe(false)

      completeOnboarding(testUserId)

      expect(hasCompletedOnboarding(testUserId)).toBe(true)
    })

    it('should throw error when completing onboarding for non-existent user', () => {
      expect(() => completeOnboarding(testUserId)).toThrow(UserDataNotFoundError)
    })
  })

  describe('Data Isolation', () => {
    it('should isolate data between different users', () => {
      const user1Id = 'auth0|user1'
      const user2Id = 'auth0|user2'

      initializeUserData(user1Id, 'user1@example.com', 'User 1')
      initializeUserData(user2Id, 'user2@example.com', 'User 2')

      const user1Profile = getUserProfile(user1Id)
      const user2Profile = getUserProfile(user2Id)

      expect(user1Profile?.email).toBe('user1@example.com')
      expect(user2Profile?.email).toBe('user2@example.com')
      expect(user1Profile).not.toEqual(user2Profile)
    })

    it('should use namespace-based storage keys', () => {
      const user1Id = 'auth0|user1'
      const user2Id = 'auth0|user2'

      const profile1: UserProfile = {
        userId: user1Id,
        email: 'user1@example.com',
        createdAt: new Date(),
        lastUpdatedAt: new Date(),
      }

      const profile2: UserProfile = {
        userId: user2Id,
        email: 'user2@example.com',
        createdAt: new Date(),
        lastUpdatedAt: new Date(),
      }

      saveUserProfile(profile1)
      saveUserProfile(profile2)

      // Check that different keys exist in localStorage
      const key1 = getUserStorageKey(user1Id, 'profile')
      const key2 = getUserStorageKey(user2Id, 'profile')

      expect(localStorage.getItem(key1)).toBeTruthy()
      expect(localStorage.getItem(key2)).toBeTruthy()
      expect(localStorage.getItem(key1)).not.toBe(localStorage.getItem(key2))
    })
  })

  describe('Clear User Data', () => {
    it('should clear all user data', () => {
      initializeUserData(testUserId, testEmail)
      saveUserPreferences(testUserId, {
        defaultCurrency: 'CAD',
        dateFormat: 'MM/DD/YYYY',
        theme: 'dark',
        language: 'en',
        notifications: {
          email: true,
          push: false,
          weeklyReport: true,
          monthlyReport: true,
          largeTransactionAlert: true,
          largeTransactionThreshold: 500,
        },
        privacy: {
          shareAnalytics: false,
          rememberFilters: true,
        },
      })

      clearUserData(testUserId)

      expect(getUserProfile(testUserId)).toBeNull()
      expect(getUserPreferences(testUserId)).toBeNull()
    })

    it('should only clear data for specified user', () => {
      const user1Id = 'auth0|user1'
      const user2Id = 'auth0|user2'

      initializeUserData(user1Id, 'user1@example.com')
      initializeUserData(user2Id, 'user2@example.com')

      clearUserData(user1Id)

      expect(getUserProfile(user1Id)).toBeNull()
      expect(getUserProfile(user2Id)).toBeTruthy()
    })
  })

  describe('Error Handling', () => {
    it('should handle corrupt data gracefully', () => {
      const key = getUserStorageKey(testUserId, 'profile')
      localStorage.setItem(key, 'invalid json {{{')

      const profile = getUserProfile(testUserId)
      expect(profile).toBeNull()
    })

    it('should throw UserNotAuthenticatedError for missing userId', () => {
      expect(() => getUserProfile('')).toThrow(UserNotAuthenticatedError)
      expect(() => saveUserPreferences('', {} as UserPreferences)).toThrow(
        UserNotAuthenticatedError
      )
    })
  })
})
