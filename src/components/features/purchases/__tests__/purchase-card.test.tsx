import { screen, fireEvent } from '@testing-library/react'
import { render, mockPurchase, expectToBeVisible } from '@/__tests__/utils/test-utils'
import { PurchaseCard } from '../purchase-card'

describe('PurchaseCard', () => {
  it('should render purchase information correctly', () => {
    render(<PurchaseCard purchase={mockPurchase} />)

    // Check if merchant name is displayed
    expect(screen.getByText('The Keg')).toBeInTheDocument()

    // Check if description is displayed
    expect(screen.getByText('Lunch at The Keg')).toBeInTheDocument()

    // Check if amount is displayed with proper formatting
    expect(screen.getByText('$45.67')).toBeInTheDocument()

    // Check if category is displayed
    expect(screen.getByText('Food & Dining')).toBeInTheDocument()

    // Check if payment method is displayed
    expect(screen.getByText(/Visa •••• 1234/)).toBeInTheDocument()
  })

  it('should display the date in readable format', () => {
    render(<PurchaseCard purchase={mockPurchase} />)

    // Should show formatted date
    expect(screen.getByText(/Dec 15, 2023/)).toBeInTheDocument()
  })

  it('should display tags when present', () => {
    render(<PurchaseCard purchase={mockPurchase} />)

    // Check for tags
    expect(screen.getByText('lunch')).toBeInTheDocument()
    expect(screen.getByText('restaurant')).toBeInTheDocument()
  })

  it('should display location when available in metadata', () => {
    render(<PurchaseCard purchase={mockPurchase} />)

    // Should display location information
    expect(screen.getByText(/Toronto, ON/)).toBeInTheDocument()
  })

  it('should be clickable and call onClick when provided', () => {
    const handleClick = jest.fn()
    render(<PurchaseCard purchase={mockPurchase} onClick={handleClick} />)

    const card = screen.getByRole('button')
    fireEvent.click(card)

    expect(handleClick).toHaveBeenCalledWith(mockPurchase)
  })

  it('should have proper hover states when clickable', () => {
    const handleClick = jest.fn()
    render(<PurchaseCard purchase={mockPurchase} onClick={handleClick} />)

    const card = screen.getByRole('button')
    expect(card).toHaveClass('cursor-pointer')
  })

  it('should not be clickable when onClick is not provided', () => {
    render(<PurchaseCard purchase={mockPurchase} />)

    // Should not have button role when not clickable
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('should display category color indicator', () => {
    render(<PurchaseCard purchase={mockPurchase} />)

    // Should have an element with the category color
    const categoryIndicator = screen.getByTestId('category-indicator')
    expectToBeVisible(categoryIndicator)
  })

  it('should be accessible with proper ARIA labels', () => {
    render(<PurchaseCard purchase={mockPurchase} />)

    // Should have accessible description
    const card = screen.getByLabelText(/Purchase at The Keg for \$45\.67/)
    expectToBeVisible(card)
  })

  it('should handle purchases without optional metadata gracefully', () => {
    const purchaseWithoutMetadata = {
      ...mockPurchase,
      metadata: {},
      tags: [],
    }

    render(<PurchaseCard purchase={purchaseWithoutMetadata} />)

    // Should still render basic information
    expect(screen.getByText('The Keg')).toBeInTheDocument()
    expect(screen.getByText('$45.67')).toBeInTheDocument()
  })

  it('should display notes when available', () => {
    render(<PurchaseCard purchase={mockPurchase} />)

    // Should show notes from metadata
    expect(screen.getByText('Business lunch meeting')).toBeInTheDocument()
  })

  it('should handle different currencies correctly', () => {
    const usdPurchase = {
      ...mockPurchase,
      currency: 'USD' as const,
      amount: 35.5,
    }

    render(<PurchaseCard purchase={usdPurchase} />)

    // Should show USD formatting
    expect(screen.getByText('US$35.50')).toBeInTheDocument()
  })

  it('should be keyboard accessible when clickable', () => {
    const handleClick = jest.fn()
    render(<PurchaseCard purchase={mockPurchase} onClick={handleClick} />)

    const card = screen.getByRole('button')

    // Should be focusable
    card.focus()
    expect(card).toHaveFocus()

    // Should trigger click on Enter
    fireEvent.keyDown(card, { key: 'Enter', code: 'Enter' })
    expect(handleClick).toHaveBeenCalledWith(mockPurchase)

    // Should trigger click on Space
    fireEvent.keyDown(card, { key: ' ', code: 'Space' })
    expect(handleClick).toHaveBeenCalledTimes(2)
  })

  it('should display payment method without last four digits when not available', () => {
    const purchaseWithoutDigits = {
      ...mockPurchase,
      paymentMethod: {
        ...mockPurchase.paymentMethod,
        lastFourDigits: undefined,
      },
    }

    render(<PurchaseCard purchase={purchaseWithoutDigits} />)

    // Should show just the provider
    expect(screen.getByText('Visa')).toBeInTheDocument()
  })

  it('should handle cash payments correctly', () => {
    const cashPurchase = {
      ...mockPurchase,
      paymentMethod: {
        id: 'cash-1',
        type: 'cash' as const,
        nickname: 'Cash',
      },
    }

    render(<PurchaseCard purchase={cashPurchase} />)

    // Should show cash payment
    expect(screen.getByText('Cash')).toBeInTheDocument()
  })
})
