import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserPreferences, Currency } from '@/types'
import { getUserStorageKey } from '@/services/user-data-service'

interface AppPreferencesState extends UserPreferences {
  // Current user ID for scoping
  userId: string | null

  // Actions
  setUserId: (userId: string | null) => void
  setDefaultCurrency: (currency: Currency) => void
  setDateFormat: (format: UserPreferences['dateFormat']) => void
  setTheme: (theme: UserPreferences['theme']) => void
  setLanguage: (language: UserPreferences['language']) => void
  updateNotifications: (notifications: Partial<UserPreferences['notifications']>) => void
  updatePrivacy: (privacy: Partial<UserPreferences['privacy']>) => void
  resetToDefaults: () => void
  loadUserPreferences: (userId: string) => void
}

export const defaultPreferences: UserPreferences = {
  defaultCurrency: 'CAD',
  dateFormat: 'MM/DD/YYYY',
  theme: 'system',
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

export const useAppPreferences = create<AppPreferencesState>()(
  persist(
    (set, get) => ({
      ...defaultPreferences,
      userId: null,

      setUserId: (userId) => {
        set({ userId })
        if (userId) {
          get().loadUserPreferences(userId)
        }
      },

      loadUserPreferences: (userId) => {
        try {
          const key = getUserStorageKey(userId, 'preferences')
          const stored = localStorage.getItem(key)

          if (stored) {
            const preferences = JSON.parse(stored)
            set({ ...preferences, userId })
          } else {
            // New user - use defaults
            set({ ...defaultPreferences, userId })
          }
        } catch (error) {
          console.warn('Failed to load user preferences:', error)
          set({ ...defaultPreferences, userId })
        }
      },

      setDefaultCurrency: (currency) => {
        const { userId } = get()
        set({ defaultCurrency: currency })
        if (userId) {
          savePreferencesToStorage(userId, { ...get() })
        }
      },

      setDateFormat: (dateFormat) => {
        const { userId } = get()
        set({ dateFormat })
        if (userId) {
          savePreferencesToStorage(userId, { ...get() })
        }
      },

      setTheme: (theme) => {
        const { userId } = get()
        set({ theme })
        if (userId) {
          savePreferencesToStorage(userId, { ...get() })
        }
      },

      setLanguage: (language) => {
        const { userId } = get()
        set({ language })
        if (userId) {
          savePreferencesToStorage(userId, { ...get() })
        }
      },

      updateNotifications: (newNotifications) => {
        const { userId } = get()
        set((state) => ({
          notifications: { ...state.notifications, ...newNotifications },
        }))
        if (userId) {
          savePreferencesToStorage(userId, { ...get() })
        }
      },

      updatePrivacy: (newPrivacy) => {
        const { userId } = get()
        set((state) => ({
          privacy: { ...state.privacy, ...newPrivacy },
        }))
        if (userId) {
          savePreferencesToStorage(userId, { ...get() })
        }
      },

      resetToDefaults: () => {
        const { userId } = get()
        set({ ...defaultPreferences, userId })
        if (userId) {
          savePreferencesToStorage(userId, { ...get() })
        }
      },
    }),
    {
      name: 'app-preferences-store',
      partialize: (state) => ({
        // Only persist the current userId, not the preferences
        // Preferences are stored per-user in localStorage
        userId: state.userId,
      }),
    }
  )
)

// Helper function to save preferences to user-scoped storage
function savePreferencesToStorage(userId: string, state: AppPreferencesState) {
  try {
    const key = getUserStorageKey(userId, 'preferences')
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const {
      userId: _userId,
      setUserId: _setUserId,
      setDefaultCurrency: _setDefaultCurrency,
      setDateFormat: _setDateFormat,
      setTheme: _setTheme,
      setLanguage: _setLanguage,
      updateNotifications: _updateNotifications,
      updatePrivacy: _updatePrivacy,
      resetToDefaults: _resetToDefaults,
      loadUserPreferences: _loadUserPreferences,
      ...preferences
    } = state
    /* eslint-enable @typescript-eslint/no-unused-vars */
    localStorage.setItem(key, JSON.stringify(preferences))
  } catch (error) {
    console.error('Failed to save user preferences:', error)
  }
}

// Selector hooks for better performance
export const useDefaultCurrency = () => useAppPreferences((state) => state.defaultCurrency)
export const useDateFormat = () => useAppPreferences((state) => state.dateFormat)
export const useTheme = () => useAppPreferences((state) => state.theme)
export const useLanguage = () => useAppPreferences((state) => state.language)
export const useNotifications = () => useAppPreferences((state) => state.notifications)
export const usePrivacy = () => useAppPreferences((state) => state.privacy)

// Action hooks
export const useAppPreferenceActions = () => {
  const setDefaultCurrency = useAppPreferences((state) => state.setDefaultCurrency)
  const setDateFormat = useAppPreferences((state) => state.setDateFormat)
  const setTheme = useAppPreferences((state) => state.setTheme)
  const setLanguage = useAppPreferences((state) => state.setLanguage)
  const updateNotifications = useAppPreferences((state) => state.updateNotifications)
  const updatePrivacy = useAppPreferences((state) => state.updatePrivacy)
  const resetToDefaults = useAppPreferences((state) => state.resetToDefaults)

  return {
    setDefaultCurrency,
    setDateFormat,
    setTheme,
    setLanguage,
    updateNotifications,
    updatePrivacy,
    resetToDefaults,
  }
}
