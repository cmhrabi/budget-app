import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/__tests__/utils/test-utils'
import { PurchaseFilters } from '../purchase-filters'
import * as filterHooks from '@/hooks/use-purchase-filters'

// Mock the hooks
jest.mock('@/hooks/use-purchase-filters')

const mockUsePurchaseFiltersSpy = jest.spyOn(filterHooks, 'usePurchaseFiltersValue')
const mockUsePurchaseFilterActionsSpy = jest.spyOn(filterHooks, 'usePurchaseFilterActions')
const mockUseHasActiveFiltersSpy = jest.spyOn(filterHooks, 'useHasActiveFilters')
const mockUseFilterCountSpy = jest.spyOn(filterHooks, 'useFilterCount')

const mockFilterActions = {
  setFilters: jest.fn(),
  clearFilters: jest.fn(),
  setSort: jest.fn(),
  setPagination: jest.fn(),
  resetPagination: jest.fn(),
}

describe('PurchaseFilters', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Default mock implementations
    mockUsePurchaseFiltersSpy.mockReturnValue({})
    mockUsePurchaseFilterActionsSpy.mockReturnValue(mockFilterActions)
    mockUseHasActiveFiltersSpy.mockReturnValue(false)
    mockUseFilterCountSpy.mockReturnValue(0)
  })

  it('should render search input', () => {
    render(<PurchaseFilters />)

    const searchInput = screen.getByPlaceholderText(/search purchases/i)
    expect(searchInput).toBeInTheDocument()
    expect(searchInput).toHaveAccessibleName(/search purchases/i)
  })

  it('should render category filter dropdown', () => {
    render(<PurchaseFilters />)

    const categoryButton = screen.getByRole('button', { name: /categories/i })
    expect(categoryButton).toBeInTheDocument()
  })

  it('should render date range picker', () => {
    render(<PurchaseFilters />)

    const dateRangeButton = screen.getByRole('button', { name: /date range/i })
    expect(dateRangeButton).toBeInTheDocument()
  })

  it('should render amount range filter', () => {
    render(<PurchaseFilters />)

    const amountButton = screen.getByRole('button', { name: /amount range/i })
    expect(amountButton).toBeInTheDocument()
  })

  it('should render payment method filter', () => {
    render(<PurchaseFilters />)

    const paymentMethodButton = screen.getByRole('button', { name: /payment methods/i })
    expect(paymentMethodButton).toBeInTheDocument()
  })

  it('should handle search input changes', async () => {
    const user = userEvent.setup()
    render(<PurchaseFilters />)

    const searchInput = screen.getByPlaceholderText(/search purchases/i)
    await user.type(searchInput, 'coffee')

    await waitFor(() => {
      expect(mockFilterActions.setFilters).toHaveBeenCalledWith({
        searchTerm: 'coffee',
      })
    })
  })

  it('should debounce search input to avoid excessive API calls', async () => {
    const user = userEvent.setup()
    render(<PurchaseFilters />)

    const searchInput = screen.getByPlaceholderText(/search purchases/i)

    // Clear any initial calls
    mockFilterActions.setFilters.mockClear()

    // Type quickly
    await user.type(searchInput, 'coffee shop')

    // Should call after debounce delay
    await waitFor(
      () => {
        expect(mockFilterActions.setFilters).toHaveBeenCalledWith({
          searchTerm: 'coffee shop',
        })
      },
      { timeout: 1000 }
    )

    // Should only have been called once for the final value, not for each keystroke
    expect(mockFilterActions.setFilters).toHaveBeenCalledTimes(1)
  })

  it('should open category dropdown when clicked', async () => {
    const user = userEvent.setup()
    render(<PurchaseFilters />)

    const categoryButton = screen.getByRole('button', { name: /categories/i })
    await user.click(categoryButton)

    // Should show category options
    expect(screen.getByText('Food & Dining')).toBeInTheDocument()
    expect(screen.getByText('Transportation')).toBeInTheDocument()
    expect(screen.getByText('Shopping')).toBeInTheDocument()
  })

  it('should handle category selection', async () => {
    const user = userEvent.setup()
    render(<PurchaseFilters />)

    const categoryButton = screen.getByRole('button', { name: /categories/i })
    await user.click(categoryButton)

    const foodCategory = screen.getByText('Food & Dining')
    await user.click(foodCategory)

    expect(mockFilterActions.setFilters).toHaveBeenCalledWith({
      categories: ['food-dining'],
    })
  })

  it('should handle multiple category selections', async () => {
    const user = userEvent.setup()
    mockUsePurchaseFiltersSpy.mockReturnValue({
      categories: ['food-dining'],
    })

    render(<PurchaseFilters />)

    const categoryButton = screen.getByRole('button', { name: /categories/i })
    await user.click(categoryButton)

    const transportationCategory = screen.getByText('Transportation')
    await user.click(transportationCategory)

    expect(mockFilterActions.setFilters).toHaveBeenCalledWith({
      categories: ['food-dining', 'transportation'],
    })
  })

  it('should open date range picker when clicked', async () => {
    const user = userEvent.setup()
    render(<PurchaseFilters />)

    const dateRangeButton = screen.getByRole('button', { name: /date range/i })
    await user.click(dateRangeButton)

    // Should show date picker interface
    expect(screen.getByText(/start date/i)).toBeInTheDocument()
    expect(screen.getByText(/end date/i)).toBeInTheDocument()
  })

  it('should handle date range selection', async () => {
    const user = userEvent.setup()
    render(<PurchaseFilters />)

    const dateRangeButton = screen.getByRole('button', { name: /date range/i })
    await user.click(dateRangeButton)

    // Mock date selection
    const startDateInput = screen.getByLabelText(/start date/i)
    const endDateInput = screen.getByLabelText(/end date/i)

    await user.type(startDateInput, '2023-01-01')
    await user.type(endDateInput, '2023-01-31')

    const applyButton = screen.getByRole('button', { name: /apply/i })
    await user.click(applyButton)

    expect(mockFilterActions.setFilters).toHaveBeenCalledWith({
      dateRange: {
        start: new Date('2023-01-01'),
        end: new Date('2023-01-31'),
      },
    })
  })

  it('should open amount range filter when clicked', async () => {
    const user = userEvent.setup()
    render(<PurchaseFilters />)

    const amountButton = screen.getByRole('button', { name: /amount range/i })
    await user.click(amountButton)

    // Should show amount range inputs
    expect(screen.getByLabelText(/minimum amount/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/maximum amount/i)).toBeInTheDocument()
  })

  it('should handle amount range selection', async () => {
    const user = userEvent.setup()
    render(<PurchaseFilters />)

    const amountButton = screen.getByRole('button', { name: /amount range/i })
    await user.click(amountButton)

    const minInput = screen.getByLabelText(/minimum amount/i)
    const maxInput = screen.getByLabelText(/maximum amount/i)

    await user.type(minInput, '10')
    await user.type(maxInput, '100')

    const applyButton = screen.getByRole('button', { name: /apply/i })
    await user.click(applyButton)

    expect(mockFilterActions.setFilters).toHaveBeenCalledWith({
      amountRange: {
        min: 10,
        max: 100,
      },
    })
  })

  it('should open payment method filter when clicked', async () => {
    const user = userEvent.setup()
    render(<PurchaseFilters />)

    const paymentMethodButton = screen.getByRole('button', { name: /payment methods/i })
    await user.click(paymentMethodButton)

    // Should show payment method options
    expect(screen.getByText('Cash')).toBeInTheDocument()
    expect(screen.getByText('Visa Credit')).toBeInTheDocument()
    expect(screen.getByText('Mastercard Credit')).toBeInTheDocument()
  })

  it('should handle payment method selection', async () => {
    const user = userEvent.setup()
    render(<PurchaseFilters />)

    const paymentMethodButton = screen.getByRole('button', { name: /payment methods/i })
    await user.click(paymentMethodButton)

    const cashOption = screen.getByText('Cash')
    await user.click(cashOption)

    expect(mockFilterActions.setFilters).toHaveBeenCalledWith({
      paymentMethods: ['cash'],
    })
  })

  it('should show clear filters button when filters are active', () => {
    mockUseHasActiveFiltersSpy.mockReturnValue(true)
    mockUseFilterCountSpy.mockReturnValue(3)

    render(<PurchaseFilters />)

    const clearButton = screen.getByRole('button', { name: /clear filters/i })
    expect(clearButton).toBeInTheDocument()

    // Should show filter count
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('should handle clear filters action', async () => {
    const user = userEvent.setup()
    mockUseHasActiveFiltersSpy.mockReturnValue(true)
    mockUseFilterCountSpy.mockReturnValue(2)

    render(<PurchaseFilters />)

    const clearButton = screen.getByRole('button', { name: /clear filters/i })
    await user.click(clearButton)

    expect(mockFilterActions.clearFilters).toHaveBeenCalled()
  })

  it('should not show clear filters button when no filters are active', () => {
    mockUseHasActiveFiltersSpy.mockReturnValue(false)
    mockUseFilterCountSpy.mockReturnValue(0)

    render(<PurchaseFilters />)

    const clearButton = screen.queryByRole('button', { name: /clear filters/i })
    expect(clearButton).not.toBeInTheDocument()
  })

  it('should display active filter indicators', () => {
    mockUsePurchaseFiltersSpy.mockReturnValue({
      searchTerm: 'coffee',
      categories: ['food-dining'],
      dateRange: {
        start: new Date('2023-01-01'),
        end: new Date('2023-01-31'),
      },
    })
    mockUseHasActiveFiltersSpy.mockReturnValue(true)
    mockUseFilterCountSpy.mockReturnValue(3)

    render(<PurchaseFilters />)

    // Should show filter indicators on buttons
    const categoryButton = screen.getByRole('button', { name: /categories/i })
    expect(categoryButton).toHaveClass('bg-primary/10') // or similar active state class
  })

  it('should be keyboard accessible', async () => {
    const user = userEvent.setup()
    render(<PurchaseFilters />)

    // Should be able to tab through filter buttons
    const searchInput = screen.getByPlaceholderText(/search purchases/i)
    const categoryButton = screen.getByRole('button', { name: /categories/i })

    await user.tab()
    expect(searchInput).toHaveFocus()

    await user.tab()
    expect(categoryButton).toHaveFocus()
  })

  it('should handle collapsible view on smaller screens', () => {
    render(<PurchaseFilters collapsible />)

    // Should have a toggle button for mobile view
    const toggleButton = screen.getByRole('button', { name: /filters/i })
    expect(toggleButton).toBeInTheDocument()
  })

  it('should validate amount range inputs', async () => {
    const user = userEvent.setup()
    render(<PurchaseFilters />)

    const amountButton = screen.getByRole('button', { name: /amount range/i })
    await user.click(amountButton)

    const minInput = screen.getByLabelText(/minimum amount/i)
    const maxInput = screen.getByLabelText(/maximum amount/i)

    // Enter invalid range (min > max)
    await user.type(minInput, '100')
    await user.type(maxInput, '50')

    const applyButton = screen.getByRole('button', { name: /apply/i })
    await user.click(applyButton)

    // Should show validation error
    expect(screen.getByText(/minimum amount cannot be greater than maximum/i)).toBeInTheDocument()
  })

  it('should preserve filter state when component re-renders', () => {
    mockUsePurchaseFiltersSpy.mockReturnValue({
      searchTerm: 'preserved search',
    })

    const { rerender } = render(<PurchaseFilters />)

    const searchInput = screen.getByPlaceholderText(/search purchases/i)
    expect(searchInput).toHaveValue('preserved search')

    // Re-render component
    rerender(<PurchaseFilters />)

    expect(searchInput).toHaveValue('preserved search')
  })
})
