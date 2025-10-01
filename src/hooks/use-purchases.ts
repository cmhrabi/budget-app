import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MockPurchaseService } from '@/services/mock-purchase-service'
import type {
  Purchase,
  CreatePurchaseRequest,
  UpdatePurchaseRequest,
  PurchaseFilters,
  PurchaseSortOptions,
  PaginatedPurchases,
  PurchaseAnalytics,
} from '@/types'

// Create a singleton instance of the mock service
const purchaseService = new MockPurchaseService()

// Query keys
export const purchaseKeys = {
  all: ['purchases'] as const,
  lists: () => [...purchaseKeys.all, 'list'] as const,
  list: (filters?: PurchaseFilters, sort?: PurchaseSortOptions, pagination?: { page: number; limit: number }) =>
    [...purchaseKeys.lists(), { filters, sort, pagination }] as const,
  details: () => [...purchaseKeys.all, 'detail'] as const,
  detail: (id: string) => [...purchaseKeys.details(), id] as const,
  analytics: (filters?: PurchaseFilters) => [...purchaseKeys.all, 'analytics', { filters }] as const,
}

// Hook for fetching purchases list
export function usePurchases(
  filters?: PurchaseFilters,
  sort?: PurchaseSortOptions,
  pagination?: { page: number; limit: number }
) {
  return useQuery({
    queryKey: purchaseKeys.list(filters, sort, pagination),
    queryFn: () => purchaseService.getPurchases(filters, sort, pagination),
    placeholderData: (previousData) => previousData,
  })
}

// Hook for fetching a single purchase
export function usePurchase(id: string) {
  return useQuery({
    queryKey: purchaseKeys.detail(id),
    queryFn: () => purchaseService.getPurchase(id),
    enabled: !!id,
  })
}

// Hook for fetching analytics
export function usePurchaseAnalytics(filters?: PurchaseFilters) {
  return useQuery({
    queryKey: purchaseKeys.analytics(filters),
    queryFn: () => purchaseService.getAnalytics(filters),
  })
}

// Hook for creating a purchase
export function useCreatePurchase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (purchase: CreatePurchaseRequest) => 
      purchaseService.createPurchase(purchase),
    onSuccess: (newPurchase) => {
      // Invalidate and refetch purchases list
      queryClient.invalidateQueries({ queryKey: purchaseKeys.lists() })
      
      // Optionally update the cache with the new purchase
      queryClient.setQueryData(
        purchaseKeys.detail(newPurchase.id),
        newPurchase
      )
      
      // Invalidate analytics
      queryClient.invalidateQueries({ queryKey: purchaseKeys.analytics() })
    },
  })
}

// Hook for updating a purchase
export function useUpdatePurchase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdatePurchaseRequest }) =>
      purchaseService.updatePurchase(id, updates),
    onSuccess: (updatedPurchase, { id }) => {
      // Update the specific purchase in cache
      queryClient.setQueryData(
        purchaseKeys.detail(id),
        updatedPurchase
      )
      
      // Invalidate purchases list to refetch
      queryClient.invalidateQueries({ queryKey: purchaseKeys.lists() })
      
      // Invalidate analytics
      queryClient.invalidateQueries({ queryKey: purchaseKeys.analytics() })
    },
  })
}

// Hook for deleting a purchase
export function useDeletePurchase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => purchaseService.deletePurchase(id),
    onSuccess: (_, id) => {
      // Remove the purchase from cache
      queryClient.removeQueries({ queryKey: purchaseKeys.detail(id) })
      
      // Invalidate purchases list to refetch
      queryClient.invalidateQueries({ queryKey: purchaseKeys.lists() })
      
      // Invalidate analytics
      queryClient.invalidateQueries({ queryKey: purchaseKeys.analytics() })
    },
  })
}

// Utility hook for optimistic updates
export function useOptimisticPurchaseUpdate() {
  const queryClient = useQueryClient()

  const optimisticallyUpdatePurchase = (id: string, updates: Partial<Purchase>) => {
    queryClient.setQueryData(
      purchaseKeys.detail(id),
      (old: Purchase | undefined) => old ? { ...old, ...updates } : undefined
    )
  }

  return { optimisticallyUpdatePurchase }
}

// Hook for prefetching purchases
export function usePrefetchPurchases() {
  const queryClient = useQueryClient()

  const prefetchPurchases = (
    filters?: PurchaseFilters,
    sort?: PurchaseSortOptions,
    pagination?: { page: number; limit: number }
  ) => {
    queryClient.prefetchQuery({
      queryKey: purchaseKeys.list(filters, sort, pagination),
      queryFn: () => purchaseService.getPurchases(filters, sort, pagination),
      staleTime: 1000 * 60 * 5, // 5 minutes
    })
  }

  const prefetchPurchase = (id: string) => {
    queryClient.prefetchQuery({
      queryKey: purchaseKeys.detail(id),
      queryFn: () => purchaseService.getPurchase(id),
      staleTime: 1000 * 60 * 10, // 10 minutes
    })
  }

  return { prefetchPurchases, prefetchPurchase }
}