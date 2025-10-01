import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserPreferences, Currency } from '@/types'
import { STORAGE_KEYS } from '@/lib/constants'

interface AppPreferencesState extends UserPreferences {
  // Actions
  setDefaultCurrency: (currency: Currency) => void
  setDateFormat: (format: UserPreferences['dateFormat']) => void
  setTheme: (theme: UserPreferences['theme']) => void
  setLanguage: (language: UserPreferences['language']) => void
  updateNotifications: (notifications: Partial<UserPreferences['notifications']>) => void
  updatePrivacy: (privacy: Partial<UserPreferences['privacy']>) => void
  resetToDefaults: () => void
}

const defaultPreferences: UserPreferences = {
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

      setDefaultCurrency: (currency) =>
        set({ defaultCurrency: currency }),

      setDateFormat: (dateFormat) =>
        set({ dateFormat }),

      setTheme: (theme) =>
        set({ theme }),

      setLanguage: (language) =>
        set({ language }),

      updateNotifications: (newNotifications) =>
        set((state) => ({
          notifications: { ...state.notifications, ...newNotifications },
        })),

      updatePrivacy: (newPrivacy) =>
        set((state) => ({
          privacy: { ...state.privacy, ...newPrivacy },
        })),

      resetToDefaults: () =>
        set(defaultPreferences),
    }),
    {
      name: STORAGE_KEYS.preferences,
    }
  )
)

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