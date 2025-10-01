import React, { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PurchaseCard } from './purchase-card'
import { usePurchases } from '@/hooks/use-purchases'
import {
  usePurchaseFiltersValue,
  usePurchasePaginationValue,
  usePurchaseSortValue,
  usePurchaseFilterActions,
  useHasActiveFilters
} from '@/hooks/use-purchase-filters'
import { Purchase } from '@/types'
import { cn } from '@/lib/utils'
import { RefreshCw, AlertCircle, Package2 } from 'lucide-react'

export interface PurchaseListProps {
  className?: string
  onPurchaseClick?: (purchase: Purchase) => void
  showCount?: boolean
  enableRefresh?: boolean
  enableVirtualization?: boolean
}

// Loading skeleton component
function PurchaseSkeleton() {
  return (
    <Card className="relative">
      <CardContent className="p-4">
        {/* Category indicator */}
        <div className="absolute top-0 left-0 w-1 h-full bg-gray-200 rounded-l-lg animate-pulse" />
        
        {/* Header skeleton */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 min-w-0">
            <div className="h-5 bg-gray-200 rounded animate-pulse mb-1 w-32" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-48" />
          </div>
          <div className="ml-4 text-right">
            <div className="h-5 bg-gray-200 rounded animate-pulse mb-1 w-20" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-24" />
          </div>
        </div>

        {/* Category and payment method skeleton */}
        <div className="flex justify-between items-center mb-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
        </div>

        {/* Tags skeleton */}
        <div className="flex gap-1">
          <div className="h-6 bg-gray-200 rounded-full animate-pulse w-12" />
          <div className="h-6 bg-gray-200 rounded-full animate-pulse w-16" />
        </div>
      </CardContent>
    </Card>
  )
}

// Error state component
function ErrorState({ 
  error, 
  onRetry 
}: { 
  error: Error | null
  onRetry: () => void 
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h3 className="text-lg font-semibold mb-2">Error Loading Purchases</h3>
      <p className="text-muted-foreground mb-4 max-w-md">
        {error?.message || 'Something went wrong while loading your purchases.'}
      </p>
      <Button onClick={onRetry} variant="outline">
        Try Again
      </Button>
    </div>
  )
}

// Empty state component
function EmptyState({ 
  hasFilters, 
  onClearFilters 
}: { 
  hasFilters: boolean
  onClearFilters?: () => void 
}) {
  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <Package2 className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Purchases Match Your Filters</h3>
        <p className="text-muted-foreground mb-4 max-w-md">
          Try adjusting your search criteria or clear the filters to see all purchases.
        </p>
        {onClearFilters && (
          <Button onClick={onClearFilters} variant="outline">
            Clear Filters
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <Package2 className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">No Purchases Found</h3>
      <p className="text-muted-foreground mb-4 max-w-md">
        Start tracking your expenses by adding your first purchase.
      </p>
    </div>
  )
}

// Pagination component
function Pagination({ 
  currentPage, 
  totalPages, 
  hasNext, 
  hasPrev, 
  onPageChange 
}: {
  currentPage: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
  onPageChange: (page: number) => void
}) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between py-4">
      <div className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrev}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNext}
          aria-label="Next page"
        >
          Next
        </Button>
      </div>
    </div>
  )
}

// Virtual list component for large datasets
function VirtualList({ 
  purchases, 
  onPurchaseClick 
}: {
  purchases: Purchase[]
  onPurchaseClick?: (purchase: Purchase) => void
}) {
  // Simple virtual list implementation
  // In a real app, you might use react-window or react-virtualized
  const [visibleStart, setVisibleStart] = React.useState(0)
  const [visibleEnd, setVisibleEnd] = React.useState(20)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const visiblePurchases = useMemo(() => {
    return purchases.slice(visibleStart, visibleEnd)
  }, [purchases, visibleStart, visibleEnd])

  React.useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      const scrollTop = container.scrollTop
      const itemHeight = 140 // Approximate height of a purchase card
      const containerHeight = container.clientHeight
      
      const newVisibleStart = Math.floor(scrollTop / itemHeight)
      const newVisibleEnd = Math.min(
        newVisibleStart + Math.ceil(containerHeight / itemHeight) + 5,
        purchases.length
      )
      
      setVisibleStart(newVisibleStart)
      setVisibleEnd(newVisibleEnd)
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [purchases.length])

  return (
    <div 
      ref={containerRef}
      className="max-h-[600px] overflow-y-auto"
      data-testid="virtual-list"
    >
      <div style={{ height: visibleStart * 140 }} />
      <div className="space-y-4">
        {visiblePurchases.map((purchase) => (
          <PurchaseCard
            key={purchase.id}
            purchase={purchase}
            onClick={onPurchaseClick}
          />
        ))}
      </div>
      <div style={{ height: (purchases.length - visibleEnd) * 140 }} />
    </div>
  )
}

export function PurchaseList({
  className,
  onPurchaseClick,
  showCount = false,
  enableRefresh = false,
  enableVirtualization = false
}: PurchaseListProps) {
  const filters = usePurchaseFiltersValue()
  const pagination = usePurchasePaginationValue()
  const sort = usePurchaseSortValue()
  const hasActiveFilters = useHasActiveFilters()
  const { clearFilters, setPagination } = usePurchaseFilterActions()

  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = usePurchases(filters, sort, pagination)

  const purchases = data?.purchases || []
  const paginationData = data?.pagination

  const handlePageChange = (page: number) => {
    setPagination({ page })
  }

  const handleRetry = () => {
    refetch()
  }

  const handleRefresh = () => {
    refetch()
  }

  // Loading state
  if (isLoading) {
    return (
      <div 
        className={cn('space-y-4', className)}
        data-testid="purchase-list"
        aria-label="List of purchases"
      >
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} data-testid="purchase-skeleton">
            <PurchaseSkeleton />
          </div>
        ))}
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div 
        className={cn(className)}
        data-testid="purchase-list"
        aria-label="List of purchases"
      >
        <ErrorState error={error} onRetry={handleRetry} />
      </div>
    )
  }

  // Empty state
  if (purchases.length === 0) {
    return (
      <div 
        className={cn(className)}
        data-testid="purchase-list"
        aria-label="List of purchases"
      >
        <EmptyState 
          hasFilters={hasActiveFilters} 
          onClearFilters={hasActiveFilters ? clearFilters : undefined}
        />
      </div>
    )
  }

  return (
    <div 
      className={cn('space-y-4', className)}
      data-testid="purchase-list"
      aria-label="List of purchases"
    >
      {/* Header with count and refresh */}
      {(showCount || enableRefresh) && (
        <div className="flex items-center justify-between">
          {showCount && paginationData && (
            <div className="text-sm text-muted-foreground">
              {paginationData.total} purchases
            </div>
          )}
          {enableRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              aria-label="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {/* Purchase list */}
      {enableVirtualization && purchases.length > 50 ? (
        <VirtualList 
          purchases={purchases} 
          onPurchaseClick={onPurchaseClick}
        />
      ) : (
        <div className="space-y-4">
          {purchases.map((purchase) => (
            <PurchaseCard
              key={purchase.id}
              purchase={purchase}
              onClick={onPurchaseClick}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {paginationData && (
        <Pagination
          currentPage={paginationData.page}
          totalPages={paginationData.totalPages}
          hasNext={paginationData.hasNext}
          hasPrev={paginationData.hasPrev}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  )
}