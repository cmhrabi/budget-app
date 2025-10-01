export * from './categories'
export * from './payment-methods'

// Application constants
export const APP_CONFIG = {
  name: 'Budget App',
  description: 'Personal budget tracking application',
  version: '1.0.0',
  author: 'Budget App Team',
  contact: {
    email: 'support@budgetapp.com',
    website: 'https://budgetapp.com',
  },
} as const

export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
  maxLimit: 100,
} as const

export const DATE_FORMATS = {
  display: 'MMM d, yyyy',
  input: 'yyyy-MM-dd',
  short: 'MMM d',
  long: 'MMMM d, yyyy',
  iso: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
} as const

export const CURRENCY_SYMBOLS = {
  CAD: '$',
  USD: '$',
} as const

export const CURRENCIES = [
  { code: 'CAD', name: 'Canadian Dollar', symbol: '$' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
] as const

// Feature flags for development
export const FEATURE_FLAGS = {
  enableBankIntegration: false,
  enableExport: true,
  enableAnalytics: true,
  enableNotifications: false,
  enableDarkMode: true,
} as const

// API endpoints (for future backend integration)
export const API_ENDPOINTS = {
  purchases: '/api/purchases',
  categories: '/api/categories',
  paymentMethods: '/api/payment-methods',
  analytics: '/api/analytics',
  bankAccounts: '/api/bank-accounts',
  user: '/api/user',
} as const

// Local storage keys
export const STORAGE_KEYS = {
  purchases: 'budget_app_purchases',
  preferences: 'budget_app_preferences',
  filters: 'budget_app_filters',
  theme: 'budget_app_theme',
} as const