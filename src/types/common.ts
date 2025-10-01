// Common types used across the application

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
  errors?: string[]
}

export interface PaginationParams {
  page?: number
  limit?: number
}

export interface SortParams<T extends string = string> {
  sortBy?: T
  sortOrder?: 'asc' | 'desc'
}

export interface DateRange {
  start: Date
  end: Date
}

export type Currency = 'CAD' | 'USD'

export interface ErrorState {
  message: string
  code?: string
  details?: Record<string, any>
}

export interface LoadingState {
  isLoading: boolean
  operation?: string
}

// Bank integration types (for future use)
export interface BankAccount {
  id: string
  bankName: string
  accountType: 'checking' | 'savings' | 'credit'
  accountNumber: string
  institutionNumber?: string
  transitNumber?: string
  balance?: number
  currency: Currency
  isActive: boolean
  lastSyncAt?: Date
  metadata?: {
    openBankingId?: string
    provider?: string
    connectionStatus?: 'connected' | 'disconnected' | 'error'
  }
}

export interface BankTransaction {
  id: string
  accountId: string
  amount: number
  currency: Currency
  description: string
  date: Date
  type: 'debit' | 'credit'
  balance?: number
  categoryCode?: string
  merchantName?: string
  originalDescription: string
  isProcessed: boolean
  purchaseId?: string // Link to our Purchase entity
  metadata?: Record<string, any>
}

// Canadian banking specific types
export interface CanadianBankInstitution {
  id: string
  name: string
  institutionNumber: string
  swiftCode?: string
  website?: string
  supportedFeatures: {
    openBanking: boolean
    instantTransfer: boolean
    e_transfer: boolean
  }
}

// User preferences and settings
export interface UserPreferences {
  defaultCurrency: Currency
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'
  theme: 'light' | 'dark' | 'system'
  language: 'en' | 'fr'
  notifications: {
    email: boolean
    push: boolean
    weeklyReport: boolean
    monthlyReport: boolean
    largeTransactionAlert: boolean
    largeTransactionThreshold: number
  }
  privacy: {
    shareAnalytics: boolean
    rememberFilters: boolean
  }
}