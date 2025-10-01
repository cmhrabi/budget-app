import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PurchaseFilters, PurchaseSortOptions } from '@/types'
import { STORAGE_KEYS } from '@/lib/constants'

interface PurchaseFiltersState {
  // Filter state
  filters: PurchaseFilters
  sort: PurchaseSortOptions
  pagination: { page: number; limit: number }
  
  // Actions
  setFilters: (filters: Partial<PurchaseFilters>) => void
  clearFilters: () => void
  setSort: (sort: PurchaseSortOptions) => void
  setPagination: (pagination: Partial<{ page: number; limit: number }>) => void
  resetPagination: () => void
  
  // Computed values
  hasActiveFilters: () => boolean
  getFilterCount: () => number
}

const defaultFilters: PurchaseFilters = {}

const defaultSort: PurchaseSortOptions = {
  field: 'date',
  direction: 'desc',
}

const defaultPagination = {
  page: 1,
  limit: 20,
}

export const usePurchaseFilters = create<PurchaseFiltersState>()(
  persist(
    (set, get) => ({
      filters: defaultFilters,
      sort: defaultSort,
      pagination: defaultPagination,

      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
          pagination: { ...state.pagination, page: 1 }, // Reset to first page when filters change
        })),

      clearFilters: () =>
        set({
          filters: defaultFilters,
          pagination: { ...get().pagination, page: 1 },
        }),

      setSort: (sort) =>
        set((state) => ({
          sort,
          pagination: { ...state.pagination, page: 1 }, // Reset to first page when sort changes
        })),

      setPagination: (newPagination) =>
        set((state) => ({
          pagination: { ...state.pagination, ...newPagination },
        })),

      resetPagination: () =>
        set((state) => ({
          pagination: { ...state.pagination, page: 1 },
        })),

      hasActiveFilters: () => {
        const { filters } = get()
        return Object.keys(filters).length > 0 && Object.values(filters).some(value => {
          if (Array.isArray(value)) return value.length > 0
          if (typeof value === 'object' && value !== null) return Object.keys(value).length > 0
          return value !== undefined && value !== null && value !== ''
        })
      },

      getFilterCount: () => {
        const { filters } = get()
        let count = 0
        
        if (filters.dateRange) count++
        if (filters.categories && filters.categories.length > 0) count++
        if (filters.paymentMethods && filters.paymentMethods.length > 0) count++
        if (filters.amountRange) count++
        if (filters.currencies && filters.currencies.length > 0) count++
        if (filters.tags && filters.tags.length > 0) count++
        if (filters.searchTerm) count++
        if (filters.merchantName) count++
        
        return count
      },
    }),
    {
      name: STORAGE_KEYS.filters,
      partialize: (state) => ({
        filters: state.filters,
        sort: state.sort,
        // Don't persist pagination
      }),
    }
  )
)

// Selector hooks for better performance
export const usePurchaseFiltersValue = () => usePurchaseFilters((state) => state.filters)
export const usePurchaseSortValue = () => usePurchaseFilters((state) => state.sort)
export const usePurchasePaginationValue = () => usePurchaseFilters((state) => state.pagination)
export const useHasActiveFilters = () => usePurchaseFilters((state) => state.hasActiveFilters())
export const useFilterCount = () => usePurchaseFilters((state) => state.getFilterCount())

// Action hooks
export const usePurchaseFilterActions = () => {
  const setFilters = usePurchaseFilters((state) => state.setFilters)
  const clearFilters = usePurchaseFilters((state) => state.clearFilters)
  const setSort = usePurchaseFilters((state) => state.setSort)
  const setPagination = usePurchaseFilters((state) => state.setPagination)
  const resetPagination = usePurchaseFilters((state) => state.resetPagination)

  return {
    setFilters,
    clearFilters,
    setSort,
    setPagination,
    resetPagination,
  }
}