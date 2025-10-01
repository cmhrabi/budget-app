import React, { useState, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent } from '@/components/ui/dropdown-menu'
import {
  usePurchaseFiltersValue,
  usePurchaseFilterActions,
  useHasActiveFilters,
  useFilterCount
} from '@/hooks/use-purchase-filters'
import { DEFAULT_CATEGORIES } from '@/lib/constants/categories'
import { DEFAULT_PAYMENT_METHODS } from '@/lib/constants/payment-methods'
import { cn } from '@/lib/utils'
import { 
  Search, 
  Calendar, 
  DollarSign, 
  CreditCard, 
  Filter, 
  X, 
  ChevronDown,
  SlidersHorizontal
} from 'lucide-react'

export interface PurchaseFiltersProps {
  className?: string
  collapsible?: boolean
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Search Filter Component
function SearchFilter() {
  const filters = usePurchaseFiltersValue()
  const { setFilters } = usePurchaseFilterActions()
  const [searchTerm, setSearchTerm] = useState(filters.searchTerm || '')
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  React.useEffect(() => {
    setFilters({ searchTerm: debouncedSearchTerm || undefined })
  }, [debouncedSearchTerm, setFilters])

  React.useEffect(() => {
    setSearchTerm(filters.searchTerm || '')
  }, [filters.searchTerm])

  return (
    <div className="relative flex-1 max-w-sm">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search purchases..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10"
        aria-label="Search purchases"
      />
    </div>
  )
}

// Category Filter Component
function CategoryFilter() {
  const filters = usePurchaseFiltersValue()
  const { setFilters } = usePurchaseFilterActions()
  const [open, setOpen] = useState(false)
  
  const selectedCategories = filters.categories || []
  const hasActiveFilter = selectedCategories.length > 0

  const handleCategoryToggle = useCallback((categoryId: string) => {
    const updatedCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId]
    
    setFilters({ 
      categories: updatedCategories.length > 0 ? updatedCategories : undefined 
    })
  }, [selectedCategories, setFilters])

  return (
    <DropdownMenu 
      open={open} 
      onOpenChange={setOpen}
      trigger={
        <Button
          variant="outline"
          className={cn(
            "justify-between",
            hasActiveFilter && "bg-primary/10 border-primary/20"
          )}
          aria-label="Categories"
        >
          <span className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Categories
          </span>
          {hasActiveFilter && (
            <Badge variant="secondary" className="ml-2">
              {selectedCategories.length}
            </Badge>
          )}
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      }
      className="w-80 max-h-64 overflow-y-auto"
    >
      <DropdownMenuContent>
        <div className="space-y-2">
          {DEFAULT_CATEGORIES.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category.id}`}
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={() => handleCategoryToggle(category.id)}
              />
              <label
                htmlFor={`category-${category.id}`}
                className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                {category.name}
              </label>
            </div>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Date Range Filter Component
function DateRangeFilter() {
  const filters = usePurchaseFiltersValue()
  const { setFilters } = usePurchaseFilterActions()
  const [open, setOpen] = useState(false)
  const [startDate, setStartDate] = useState(
    filters.dateRange?.start ? filters.dateRange.start.toISOString().split('T')[0] : ''
  )
  const [endDate, setEndDate] = useState(
    filters.dateRange?.end ? filters.dateRange.end.toISOString().split('T')[0] : ''
  )

  const hasActiveFilter = !!filters.dateRange

  const handleApply = () => {
    if (startDate && endDate) {
      setFilters({
        dateRange: {
          start: new Date(startDate),
          end: new Date(endDate)
        }
      })
      setOpen(false)
    }
  }

  const handleClear = () => {
    setStartDate('')
    setEndDate('')
    setFilters({ dateRange: undefined })
    setOpen(false)
  }

  React.useEffect(() => {
    if (filters.dateRange) {
      setStartDate(filters.dateRange.start.toISOString().split('T')[0])
      setEndDate(filters.dateRange.end.toISOString().split('T')[0])
    } else {
      setStartDate('')
      setEndDate('')
    }
  }, [filters.dateRange])

  return (
    <DropdownMenu 
      open={open} 
      onOpenChange={setOpen}
      trigger={
        <Button
          variant="outline"
          className={cn(
            "justify-between",
            hasActiveFilter && "bg-primary/10 border-primary/20"
          )}
          aria-label="Date Range"
        >
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Date Range
          </span>
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      }
      className="w-80"
    >
      <DropdownMenuContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="start-date" className="text-sm font-medium">
              Start Date
            </label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              aria-label="Start date"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="end-date" className="text-sm font-medium">
              End Date
            </label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              aria-label="End date"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleApply} disabled={!startDate || !endDate}>
              Apply
            </Button>
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Amount Range Filter Component
function AmountRangeFilter() {
  const filters = usePurchaseFiltersValue()
  const { setFilters } = usePurchaseFilterActions()
  const [open, setOpen] = useState(false)
  const [minAmount, setMinAmount] = useState(
    filters.amountRange?.min?.toString() || ''
  )
  const [maxAmount, setMaxAmount] = useState(
    filters.amountRange?.max?.toString() || ''
  )
  const [error, setError] = useState('')

  const hasActiveFilter = !!filters.amountRange

  const handleApply = () => {
    const min = parseFloat(minAmount)
    const max = parseFloat(maxAmount)

    if (minAmount && maxAmount && min > max) {
      setError('Minimum amount cannot be greater than maximum amount')
      return
    }

    setError('')
    setFilters({
      amountRange: minAmount || maxAmount ? {
        min: minAmount ? min : undefined,
        max: maxAmount ? max : undefined
      } : undefined
    })
    setOpen(false)
  }

  const handleClear = () => {
    setMinAmount('')
    setMaxAmount('')
    setError('')
    setFilters({ amountRange: undefined })
    setOpen(false)
  }

  React.useEffect(() => {
    if (filters.amountRange) {
      setMinAmount(filters.amountRange.min?.toString() || '')
      setMaxAmount(filters.amountRange.max?.toString() || '')
    } else {
      setMinAmount('')
      setMaxAmount('')
    }
    setError('')
  }, [filters.amountRange])

  return (
    <DropdownMenu 
      open={open} 
      onOpenChange={setOpen}
      trigger={
        <Button
          variant="outline"
          className={cn(
            "justify-between",
            hasActiveFilter && "bg-primary/10 border-primary/20"
          )}
          aria-label="Amount Range"
        >
          <span className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Amount Range
          </span>
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      }
      className="w-80"
    >
      <DropdownMenuContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="min-amount" className="text-sm font-medium">
              Minimum Amount
            </label>
            <Input
              id="min-amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              aria-label="Minimum amount"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="max-amount" className="text-sm font-medium">
              Maximum Amount
            </label>
            <Input
              id="max-amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              aria-label="Maximum amount"
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <div className="flex gap-2">
            <Button onClick={handleApply}>
              Apply
            </Button>
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Payment Method Filter Component
function PaymentMethodFilter() {
  const filters = usePurchaseFiltersValue()
  const { setFilters } = usePurchaseFilterActions()
  const [open, setOpen] = useState(false)
  
  const selectedPaymentMethods = filters.paymentMethods || []
  const hasActiveFilter = selectedPaymentMethods.length > 0

  const handlePaymentMethodToggle = useCallback((methodId: string) => {
    const updatedMethods = selectedPaymentMethods.includes(methodId)
      ? selectedPaymentMethods.filter(id => id !== methodId)
      : [...selectedPaymentMethods, methodId]
    
    setFilters({ 
      paymentMethods: updatedMethods.length > 0 ? updatedMethods : undefined 
    })
  }, [selectedPaymentMethods, setFilters])

  return (
    <DropdownMenu 
      open={open} 
      onOpenChange={setOpen}
      trigger={
        <Button
          variant="outline"
          className={cn(
            "justify-between",
            hasActiveFilter && "bg-primary/10 border-primary/20"
          )}
          aria-label="Payment Methods"
        >
          <span className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payment Methods
          </span>
          {hasActiveFilter && (
            <Badge variant="secondary" className="ml-2">
              {selectedPaymentMethods.length}
            </Badge>
          )}
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      }
      className="w-80 max-h-64 overflow-y-auto"
    >
      <DropdownMenuContent>
        <div className="space-y-2">
          {DEFAULT_PAYMENT_METHODS.map((method) => (
            <div key={method.id} className="flex items-center space-x-2">
              <Checkbox
                id={`payment-method-${method.id}`}
                checked={selectedPaymentMethods.includes(method.id)}
                onCheckedChange={() => handlePaymentMethodToggle(method.id)}
              />
              <label
                htmlFor={`payment-method-${method.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
              >
                {method.nickname || method.provider || method.type}
              </label>
            </div>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Main PurchaseFilters Component
export function PurchaseFilters({ className, collapsible = false }: PurchaseFiltersProps) {
  const hasActiveFilters = useHasActiveFilters()
  const filterCount = useFilterCount()
  const { clearFilters } = usePurchaseFilterActions()
  const [isExpanded, setIsExpanded] = useState(false)

  const filterComponents = useMemo(() => [
    <CategoryFilter key="category" />,
    <DateRangeFilter key="date" />,
    <AmountRangeFilter key="amount" />,
    <PaymentMethodFilter key="payment" />
  ], [])

  if (collapsible) {
    return (
      <div className={cn("space-y-4", className)}>
        {/* Mobile filter toggle */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className="lg:hidden"
            aria-label="Filters"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {filterCount}
              </Badge>
            )}
          </Button>
          
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="lg:hidden"
              aria-label="Clear filters"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Search is always visible */}
        <SearchFilter />

        {/* Filter buttons - hidden on mobile unless expanded */}
        <div className={cn(
          "flex flex-wrap gap-2",
          collapsible && !isExpanded && "hidden lg:flex"
        )}>
          {filterComponents}
          
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="hidden lg:flex"
              aria-label="Clear filters"
            >
              <X className="h-4 w-4 mr-1" />
              Clear Filters
              <Badge variant="secondary" className="ml-2">
                {filterCount}
              </Badge>
            </Button>
          )}
        </div>

        {/* Mobile expanded filters */}
        {collapsible && isExpanded && (
          <div className="lg:hidden space-y-2">
            {filterComponents}
            
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="w-full"
                aria-label="Clear filters"
              >
                <X className="h-4 w-4 mr-1" />
                Clear Filters
                <Badge variant="secondary" className="ml-2">
                  {filterCount}
                </Badge>
              </Button>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      <SearchFilter />
      
      <div className="flex flex-wrap gap-2 items-center">
        {filterComponents}
        
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            aria-label="Clear filters"
          >
            <X className="h-4 w-4 mr-1" />
            Clear Filters
            <Badge variant="secondary" className="ml-2">
              {filterCount}
            </Badge>
          </Button>
        )}
      </div>
    </div>
  )
}