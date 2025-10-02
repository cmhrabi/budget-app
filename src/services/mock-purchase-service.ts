import {
  PurchaseService,
  PurchaseNotFoundError,
  PurchaseValidationError,
} from './purchase-service'
import { generateMockPurchasesForUser } from '@/lib/mock-data'
import { getUserStorageKey, UserNotAuthenticatedError } from './user-data-service'
import type {
  Purchase,
  CreatePurchaseRequest,
  UpdatePurchaseRequest,
  PurchaseFilters,
  PurchaseSortOptions,
  PaginatedPurchases,
  PurchaseAnalytics,
} from '@/types'

export class MockPurchaseService implements PurchaseService {
  private purchases: Purchase[] = []
  private userId: string | null = null

  constructor(userId?: string) {
    if (userId) {
      this.setUserId(userId)
    }
  }

  /**
   * Set the user ID for scoping all data operations
   */
  setUserId(userId: string): void {
    this.userId = userId
    this.loadPurchases()
  }

  /**
   * Get the current user ID
   */
  private ensureUserId(): string {
    if (!this.userId) {
      throw new UserNotAuthenticatedError()
    }
    return this.userId
  }

  private loadPurchases(): void {
    const userId = this.ensureUserId()

    if (typeof window !== 'undefined') {
      const key = getUserStorageKey(userId, 'purchases')
      const stored = localStorage.getItem(key)
      if (stored) {
        try {
          this.purchases = JSON.parse(stored).map((p: any) => ({
            ...p,
            date: new Date(p.date),
            createdAt: new Date(p.createdAt),
            updatedAt: new Date(p.updatedAt),
          }))
          // Filter by userId for extra security
          this.purchases = this.purchases.filter(p => p.userId === userId)
        } catch (error) {
          console.warn('Failed to load purchases from localStorage:', error)
          this.purchases = generateMockPurchasesForUser(userId)
        }
      } else {
        this.purchases = generateMockPurchasesForUser(userId)
      }
    } else {
      this.purchases = generateMockPurchasesForUser(userId)
    }
  }

  private savePurchases(): void {
    const userId = this.ensureUserId()

    if (typeof window !== 'undefined') {
      const key = getUserStorageKey(userId, 'purchases')
      localStorage.setItem(key, JSON.stringify(this.purchases))
    }
  }

  async getPurchases(
    filters?: PurchaseFilters,
    sort?: PurchaseSortOptions,
    pagination?: { page: number; limit: number }
  ): Promise<PaginatedPurchases> {
    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 100))

    let filteredPurchases = [...this.purchases]

    // Apply filters
    if (filters) {
      filteredPurchases = this.applyFilters(filteredPurchases, filters)
    }

    // Apply sorting
    if (sort) {
      filteredPurchases = this.applySorting(filteredPurchases, sort)
    }

    // Apply pagination
    const page = pagination?.page || 1
    const limit = pagination?.limit || 20
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedData = filteredPurchases.slice(startIndex, endIndex)

    return {
      purchases: paginatedData,
      pagination: {
        page,
        limit,
        total: filteredPurchases.length,
        totalPages: Math.ceil(filteredPurchases.length / limit),
        hasNext: endIndex < filteredPurchases.length,
        hasPrev: page > 1,
      },
    }
  }

  async getPurchase(id: string): Promise<Purchase> {
    await new Promise((resolve) => setTimeout(resolve, 50))
    
    const purchase = this.purchases.find((p) => p.id === id)
    if (!purchase) {
      throw new PurchaseNotFoundError(id)
    }
    return purchase
  }

  async createPurchase(request: CreatePurchaseRequest): Promise<Purchase> {
    await new Promise((resolve) => setTimeout(resolve, 200))

    const userId = this.ensureUserId()

    // Validate request
    if (!request.description || !request.merchantName || !request.categoryId) {
      throw new PurchaseValidationError('Missing required fields')
    }

    const now = new Date()
    const purchase: Purchase = {
      id: this.generateId(),
      userId, // Link purchase to authenticated user
      amount: request.amount,
      currency: request.currency,
      description: request.description,
      merchantName: request.merchantName,
      category: {
        id: request.categoryId,
        name: 'Unknown Category', // Would be resolved from category service
        color: '#D3D3D3',
        icon: 'more-horizontal',
      },
      date: typeof request.date === 'string' ? new Date(request.date) : request.date,
      paymentMethod: {
        id: request.paymentMethodId,
        type: 'credit', // Would be resolved from payment method service
        nickname: 'Unknown Payment Method',
      },
      tags: request.tags || [],
      metadata: request.metadata || {},
      createdAt: now,
      updatedAt: now,
    }

    this.purchases.unshift(purchase)
    this.savePurchases()
    return purchase
  }

  async updatePurchase(id: string, updates: UpdatePurchaseRequest): Promise<Purchase> {
    await new Promise((resolve) => setTimeout(resolve, 150))

    const index = this.purchases.findIndex((p) => p.id === id)
    if (index === -1) {
      throw new PurchaseNotFoundError(id)
    }

    const existingPurchase = this.purchases[index]
    const updatedPurchase: Purchase = {
      ...existingPurchase,
      ...updates,
      id: existingPurchase.id, // Ensure ID cannot be changed
      date: updates.date ? (typeof updates.date === 'string' ? new Date(updates.date) : updates.date) : existingPurchase.date,
      updatedAt: new Date(),
    }

    this.purchases[index] = updatedPurchase
    this.savePurchases()
    return updatedPurchase
  }

  async deletePurchase(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 100))

    const index = this.purchases.findIndex((p) => p.id === id)
    if (index === -1) {
      throw new PurchaseNotFoundError(id)
    }

    this.purchases.splice(index, 1)
    this.savePurchases()
  }

  async getAnalytics(filters?: PurchaseFilters): Promise<PurchaseAnalytics> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    let purchases = [...this.purchases]
    if (filters) {
      purchases = this.applyFilters(purchases, filters)
    }

    const totalSpent = purchases.reduce((sum, p) => sum + p.amount, 0)
    const totalTransactions = purchases.length
    const averageTransaction = totalTransactions > 0 ? totalSpent / totalTransactions : 0

    // Calculate top categories
    const categoryMap = new Map<string, { category: any; amount: number; count: number }>()
    purchases.forEach((p) => {
      const existing = categoryMap.get(p.category.id)
      if (existing) {
        existing.amount += p.amount
        existing.count += 1
      } else {
        categoryMap.set(p.category.id, {
          category: p.category,
          amount: p.amount,
          count: 1,
        })
      }
    })

    const topCategories = Array.from(categoryMap.values())
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
      .map((item) => ({
        ...item,
        percentage: totalSpent > 0 ? (item.amount / totalSpent) * 100 : 0,
      }))

    // Calculate top merchants
    const merchantMap = new Map<string, { amount: number; count: number }>()
    purchases.forEach((p) => {
      const existing = merchantMap.get(p.merchantName)
      if (existing) {
        existing.amount += p.amount
        existing.count += 1
      } else {
        merchantMap.set(p.merchantName, { amount: p.amount, count: 1 })
      }
    })

    const topMerchants = Array.from(merchantMap.entries())
      .map(([merchantName, data]) => ({ merchantName, ...data }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)

    // Calculate monthly trends (last 12 months)
    const monthlyTrends: Array<{ month: string; amount: number; count: number }> = []
    const now = new Date()
    for (let i = 11; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = month.toISOString().substring(0, 7) // YYYY-MM
      const monthPurchases = purchases.filter((p) => {
        const purchaseMonth = p.date.toISOString().substring(0, 7)
        return purchaseMonth === monthKey
      })
      
      monthlyTrends.push({
        month: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        amount: monthPurchases.reduce((sum, p) => sum + p.amount, 0),
        count: monthPurchases.length,
      })
    }

    return {
      totalSpent,
      totalTransactions,
      averageTransaction,
      topCategories,
      topMerchants,
      monthlyTrends,
    }
  }

  private applyFilters(purchases: Purchase[], filters: PurchaseFilters): Purchase[] {
    return purchases.filter((purchase) => {
      // Date range filter
      if (filters.dateRange) {
        const purchaseDate = purchase.date
        if (purchaseDate < filters.dateRange.start || purchaseDate > filters.dateRange.end) {
          return false
        }
      }

      // Categories filter
      if (filters.categories && filters.categories.length > 0) {
        if (!filters.categories.includes(purchase.category.id)) {
          return false
        }
      }

      // Payment methods filter
      if (filters.paymentMethods && filters.paymentMethods.length > 0) {
        if (!filters.paymentMethods.includes(purchase.paymentMethod.id)) {
          return false
        }
      }

      // Amount range filter
      if (filters.amountRange) {
        const { min, max } = filters.amountRange
        if ((min !== undefined && purchase.amount < min) || 
            (max !== undefined && purchase.amount > max)) {
          return false
        }
      }

      // Currencies filter
      if (filters.currencies && filters.currencies.length > 0) {
        if (!filters.currencies.includes(purchase.currency)) {
          return false
        }
      }

      // Tags filter
      if (filters.tags && filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some((tag) => purchase.tags.includes(tag))
        if (!hasMatchingTag) {
          return false
        }
      }

      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase()
        const searchableText = [
          purchase.description,
          purchase.merchantName,
          purchase.category.name,
          ...purchase.tags,
        ].join(' ').toLowerCase()
        
        if (!searchableText.includes(searchLower)) {
          return false
        }
      }

      // Merchant name filter
      if (filters.merchantName) {
        const merchantLower = filters.merchantName.toLowerCase()
        if (!purchase.merchantName.toLowerCase().includes(merchantLower)) {
          return false
        }
      }

      return true
    })
  }

  private applySorting(purchases: Purchase[], sort: PurchaseSortOptions): Purchase[] {
    return purchases.sort((a, b) => {
      let comparison = 0

      switch (sort.field) {
        case 'date':
          comparison = a.date.getTime() - b.date.getTime()
          break
        case 'amount':
          comparison = a.amount - b.amount
          break
        case 'merchantName':
          comparison = a.merchantName.localeCompare(b.merchantName)
          break
        case 'category':
          comparison = a.category.name.localeCompare(b.category.name)
          break
        default:
          return 0
      }

      return sort.direction === 'desc' ? -comparison : comparison
    })
  }

  private generateId(): string {
    return `purchase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Utility methods for testing and development
  clearAllPurchases(): void {
    this.purchases = []
    this.savePurchases()
  }

  seedWithMockData(): void {
    const userId = this.ensureUserId()
    this.purchases = generateMockPurchasesForUser(userId)
    this.savePurchases()
  }
}