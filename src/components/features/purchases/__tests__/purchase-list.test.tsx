import { screen, fireEvent } from '@testing-library/react'
import { render, mockPurchases, mockUsePurchases } from '@/__tests__/utils/test-utils'
import { PurchaseList } from '../purchase-list'
import * as purchaseHooks from '@/hooks/use-purchases'
import * as filterHooks from '@/hooks/use-purchase-filters'

// Mock the hooks
jest.mock('@/hooks/use-purchases')
jest.mock('@/hooks/use-purchase-filters')

const mockUsePurchasesSpy = jest.spyOn(purchaseHooks, 'usePurchases')
const mockUsePurchaseFiltersSpy = jest.spyOn(filterHooks, 'usePurchaseFiltersValue')
const mockUsePurchasePaginationSpy = jest.spyOn(filterHooks, 'usePurchasePaginationValue')
const mockUsePurchaseSortSpy = jest.spyOn(filterHooks, 'usePurchaseSortValue')
const mockUsePurchaseFilterActionsSpy = jest.spyOn(filterHooks, 'usePurchaseFilterActions')
const mockUseHasActiveFiltersSpy = jest.spyOn(filterHooks, 'useHasActiveFilters')

describe('PurchaseList', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()

    // Default mock implementations
    mockUsePurchaseFiltersSpy.mockReturnValue({})
    mockUsePurchasePaginationSpy.mockReturnValue({ page: 1, limit: 20 })
    mockUsePurchaseSortSpy.mockReturnValue({ field: 'date', direction: 'desc' })
    mockUsePurchaseFilterActionsSpy.mockReturnValue({
      setFilters: jest.fn(),
      clearFilters: jest.fn(),
      setSort: jest.fn(),
      setPagination: jest.fn(),
      resetPagination: jest.fn(),
    })
    mockUseHasActiveFiltersSpy.mockReturnValue(false)
  })

  it('should render list of purchases when data is available', () => {
    mockUsePurchasesSpy.mockReturnValue(mockUsePurchases)

    render(<PurchaseList />)

    // Should render all mock purchases
    expect(screen.getByText('The Keg')).toBeInTheDocument()
    expect(screen.getByText('Metro')).toBeInTheDocument()
    expect(screen.getByText('Starbucks')).toBeInTheDocument()
  })

  it('should show loading state when data is loading', () => {
    mockUsePurchasesSpy.mockReturnValue({
      ...mockUsePurchases,
      isLoading: true,
      data: undefined,
    })

    render(<PurchaseList />)

    // Should show loading indicators
    const loadingElements = screen.getAllByTestId('purchase-skeleton')
    expect(loadingElements).toHaveLength(5) // Default skeleton count
  })

  it('should show error state when there is an error', () => {
    mockUsePurchasesSpy.mockReturnValue({
      ...mockUsePurchases,
      isError: true,
      error: new Error('Failed to fetch purchases'),
    })

    render(<PurchaseList />)

    // Should show error message
    expect(screen.getByText(/error loading purchases/i)).toBeInTheDocument()
    expect(screen.getByText(/failed to fetch purchases/i)).toBeInTheDocument()

    // Should show retry button
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })

  it('should show empty state when no purchases are available', () => {
    mockUsePurchasesSpy.mockReturnValue({
      ...mockUsePurchases,
      data: {
        purchases: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      },
    })

    render(<PurchaseList />)

    // Should show empty state
    expect(screen.getByText(/no purchases found/i)).toBeInTheDocument()
    expect(screen.getByText(/start tracking your expenses/i)).toBeInTheDocument()
  })

  it('should show filtered empty state when filters are applied but no results', () => {
    mockUsePurchaseFiltersSpy.mockReturnValue({
      searchTerm: 'nonexistent',
    })
    mockUseHasActiveFiltersSpy.mockReturnValue(true)

    mockUsePurchasesSpy.mockReturnValue({
      ...mockUsePurchases,
      data: {
        purchases: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      },
    })

    render(<PurchaseList />)

    // Should show filtered empty state
    expect(screen.getByText(/no purchases match your filters/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /clear filters/i })).toBeInTheDocument()
  })

  it('should handle purchase card clicks when onPurchaseClick is provided', () => {
    mockUsePurchasesSpy.mockReturnValue(mockUsePurchases)
    const handlePurchaseClick = jest.fn()

    render(<PurchaseList onPurchaseClick={handlePurchaseClick} />)

    // Click on the first purchase
    const firstPurchaseCard = screen.getByLabelText(/Purchase at The Keg/)
    fireEvent.click(firstPurchaseCard)

    expect(handlePurchaseClick).toHaveBeenCalledWith(mockPurchases[0])
  })

  it('should render pagination when there are multiple pages', () => {
    mockUsePurchasesSpy.mockReturnValue({
      ...mockUsePurchases,
      data: {
        ...mockUsePurchases.data!,
        pagination: {
          page: 1,
          limit: 20,
          total: 50,
          totalPages: 3,
          hasNext: true,
          hasPrev: false,
        },
      },
    })

    render(<PurchaseList />)

    // Should show pagination controls
    expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument()
    expect(screen.getByText(/page 1 of 3/i)).toBeInTheDocument()
  })

  it('should handle pagination navigation', () => {
    const mockSetPagination = jest.fn()
    mockUsePurchaseFilterActionsSpy.mockReturnValue({
      setFilters: jest.fn(),
      clearFilters: jest.fn(),
      setSort: jest.fn(),
      setPagination: mockSetPagination,
      resetPagination: jest.fn(),
    })

    mockUsePurchasesSpy.mockReturnValue({
      ...mockUsePurchases,
      data: {
        ...mockUsePurchases.data!,
        pagination: {
          page: 1,
          limit: 20,
          total: 50,
          totalPages: 3,
          hasNext: true,
          hasPrev: false,
        },
      },
    })

    render(<PurchaseList />)

    // Click next page
    const nextButton = screen.getByRole('button', { name: /next page/i })
    fireEvent.click(nextButton)

    expect(mockSetPagination).toHaveBeenCalledWith({ page: 2 })
  })

  it('should retry loading when retry button is clicked', async () => {
    const mockRefetch = jest.fn().mockResolvedValue({})

    mockUsePurchasesSpy.mockReturnValue({
      ...mockUsePurchases,
      isError: true,
      error: new Error('Network error'),
      refetch: mockRefetch,
    })

    render(<PurchaseList />)

    // Click retry button
    const retryButton = screen.getByRole('button', { name: /try again/i })
    fireEvent.click(retryButton)

    expect(mockRefetch).toHaveBeenCalled()
  })

  it('should use virtual scrolling for performance with large datasets', () => {
    const largePurchaseList = Array.from({ length: 100 }, (_, index) => ({
      ...mockPurchases[0],
      id: `purchase-${index}`,
      merchantName: `Merchant ${index}`,
    }))

    mockUsePurchasesSpy.mockReturnValue({
      ...mockUsePurchases,
      data: {
        purchases: largePurchaseList,
        pagination: {
          page: 1,
          limit: 100,
          total: 100,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      },
    })

    render(<PurchaseList enableVirtualization />)

    // Should render virtual list container
    expect(screen.getByTestId('virtual-list')).toBeInTheDocument()

    // Should not render all items at once (virtualization)
    expect(screen.queryByText('Merchant 50')).not.toBeInTheDocument()
  })

  it('should apply custom className', () => {
    mockUsePurchasesSpy.mockReturnValue(mockUsePurchases)

    render(<PurchaseList className="custom-class" />)

    const listContainer = screen.getByTestId('purchase-list')
    expect(listContainer).toHaveClass('custom-class')
  })

  it('should show purchase count when available', () => {
    mockUsePurchasesSpy.mockReturnValue({
      ...mockUsePurchases,
      data: {
        ...mockUsePurchases.data!,
        pagination: {
          ...mockUsePurchases.data!.pagination,
          total: 42,
        },
      },
    })

    render(<PurchaseList showCount />)

    expect(screen.getByText(/42 purchases/i)).toBeInTheDocument()
  })

  it('should handle refresh functionality', async () => {
    const mockRefetch = jest.fn().mockResolvedValue({})

    mockUsePurchasesSpy.mockReturnValue({
      ...mockUsePurchases,
      refetch: mockRefetch,
    })

    render(<PurchaseList enableRefresh />)

    // Should show refresh button
    const refreshButton = screen.getByRole('button', { name: /refresh/i })
    fireEvent.click(refreshButton)

    expect(mockRefetch).toHaveBeenCalled()
  })

  it('should be accessible with proper ARIA labels', () => {
    mockUsePurchasesSpy.mockReturnValue(mockUsePurchases)

    render(<PurchaseList />)

    const listContainer = screen.getByTestId('purchase-list')
    expect(listContainer).toHaveAttribute('aria-label', 'List of purchases')
  })
})
