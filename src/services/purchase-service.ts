import type {
  Purchase,
  CreatePurchaseRequest,
  UpdatePurchaseRequest,
  PurchaseFilters,
  PurchaseSortOptions,
  PaginatedPurchases,
  PurchaseAnalytics,
} from '@/types'

// Abstract interface for purchase service
export interface PurchaseService {
  getPurchases(
    filters?: PurchaseFilters,
    sort?: PurchaseSortOptions,
    pagination?: { page: number; limit: number }
  ): Promise<PaginatedPurchases>
  getPurchase(id: string): Promise<Purchase>
  createPurchase(purchase: CreatePurchaseRequest): Promise<Purchase>
  updatePurchase(id: string, updates: UpdatePurchaseRequest): Promise<Purchase>
  deletePurchase(id: string): Promise<void>
  getAnalytics(filters?: PurchaseFilters): Promise<PurchaseAnalytics>
}

// Error classes for purchase service
export class PurchaseNotFoundError extends Error {
  constructor(id: string) {
    super(`Purchase with id ${id} not found`)
    this.name = 'PurchaseNotFoundError'
  }
}

export class PurchaseValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PurchaseValidationError'
  }
}

export class PurchaseServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PurchaseServiceError'
  }
}