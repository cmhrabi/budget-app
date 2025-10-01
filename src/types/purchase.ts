export interface Purchase {
  id: string
  amount: number
  currency: 'CAD' | 'USD'
  description: string
  merchantName: string
  category: PurchaseCategory
  date: Date
  paymentMethod: PaymentMethod
  tags: string[]
  metadata: PurchaseMetadata
  createdAt: Date
  updatedAt: Date
}

export interface PurchaseCategory {
  id: string
  name: string
  color: string
  icon: string
  description?: string
}

export interface PaymentMethod {
  id: string
  type: 'credit' | 'debit' | 'cash' | 'transfer' | 'e_transfer'
  lastFourDigits?: string
  bankName?: string
  provider?: string
  nickname?: string
}

export interface PurchaseMetadata {
  location?: {
    address?: string
    city?: string
    province?: string
    postalCode?: string
    country?: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  merchantCategory?: string
  isRecurring?: boolean
  recurringFrequency?: 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'yearly'
  bankTransactionId?: string
  originalCurrency?: string
  originalAmount?: number
  exchangeRate?: number
  notes?: string
}

// Request/Response types for API integration
export interface CreatePurchaseRequest {
  amount: number
  currency: 'CAD' | 'USD'
  description: string
  merchantName: string
  categoryId: string
  date: string | Date
  paymentMethodId: string
  tags?: string[]
  metadata?: Partial<PurchaseMetadata>
}

export interface UpdatePurchaseRequest {
  amount?: number
  currency?: 'CAD' | 'USD'
  description?: string
  merchantName?: string
  categoryId?: string
  date?: string | Date
  paymentMethodId?: string
  tags?: string[]
  metadata?: Partial<PurchaseMetadata>
}

// Filter and search types
export interface PurchaseFilters {
  dateRange?: {
    start: Date
    end: Date
  }
  categories?: string[]
  paymentMethods?: string[]
  amountRange?: {
    min?: number
    max?: number
  }
  currencies?: ('CAD' | 'USD')[]
  tags?: string[]
  searchTerm?: string
  merchantName?: string
}

export interface PurchaseSortOptions {
  field: 'date' | 'amount' | 'merchantName' | 'category'
  direction: 'asc' | 'desc'
}

// Pagination types
export interface PaginatedPurchases {
  purchases: Purchase[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Analytics types
export interface PurchaseAnalytics {
  totalSpent: number
  totalTransactions: number
  averageTransaction: number
  topCategories: Array<{
    category: PurchaseCategory
    amount: number
    count: number
    percentage: number
  }>
  topMerchants: Array<{
    merchantName: string
    amount: number
    count: number
  }>
  monthlyTrends: Array<{
    month: string
    amount: number
    count: number
  }>
}