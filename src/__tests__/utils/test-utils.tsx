import React, { ReactElement, ReactNode } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Purchase, PurchaseCategory, PaymentMethod } from '@/types'

// Mock purchase data for testing
export const mockCategory: PurchaseCategory = {
  id: 'food',
  name: 'Food & Dining',
  color: '#ff6b6b',
  icon: '🍽️',
  description: 'Restaurants, groceries, and food delivery'
}

export const mockPaymentMethod: PaymentMethod = {
  id: 'credit-card-1',
  type: 'credit',
  lastFourDigits: '1234',
  bankName: 'TD Bank',
  provider: 'Visa',
  nickname: 'Main Credit Card'
}

export const mockPurchase: Purchase = {
  id: 'purchase-1',
  userId: 'auth0|test-user', // Added userId field
  amount: 45.67,
  currency: 'CAD',
  description: 'Lunch at The Keg',
  merchantName: 'The Keg',
  category: mockCategory,
  date: new Date('2023-12-15T12:30:00.000Z'),
  paymentMethod: mockPaymentMethod,
  tags: ['lunch', 'restaurant'],
  metadata: {
    location: {
      address: '123 Main St',
      city: 'Toronto',
      province: 'ON',
      postalCode: 'M5V 3A8',
      country: 'Canada'
    },
    merchantCategory: 'restaurant',
    notes: 'Business lunch meeting'
  },
  createdAt: new Date('2023-12-15T12:35:00.000Z'),
  updatedAt: new Date('2023-12-15T12:35:00.000Z')
}

export const mockPurchases: Purchase[] = [
  mockPurchase,
  {
    ...mockPurchase,
    id: 'purchase-2',
    amount: 89.99,
    description: 'Grocery shopping',
    merchantName: 'Metro',
    date: new Date('2023-12-14T10:15:00.000Z'),
    tags: ['groceries'],
    metadata: {
      ...mockPurchase.metadata,
      merchantCategory: 'grocery'
    }
  },
  {
    ...mockPurchase,
    id: 'purchase-3',
    amount: 12.50,
    description: 'Coffee',
    merchantName: 'Starbucks',
    date: new Date('2023-12-13T08:45:00.000Z'),
    tags: ['coffee', 'morning'],
    metadata: {
      ...mockPurchase.metadata,
      merchantCategory: 'cafe'
    }
  }
]

// Create a test query client
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity
      },
      mutations: {
        retry: false
      }
    }
  })

// Custom render function with providers
interface AllTheProvidersProps {
  children: ReactNode
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  const queryClient = createTestQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Mock implementations for hooks
export const mockUsePurchases = {
  data: {
    purchases: mockPurchases,
    pagination: {
      page: 1,
      limit: 20,
      total: 3,
      totalPages: 1,
      hasNext: false,
      hasPrev: false
    }
  },
  isLoading: false,
  isError: false,
  error: null
}

export const mockUsePurchaseFilters = {
  filters: {},
  sort: { field: 'date' as const, direction: 'desc' as const },
  pagination: { page: 1, limit: 20 }
}

export const mockUsePurchaseFilterActions = {
  setFilters: jest.fn(),
  clearFilters: jest.fn(),
  setSort: jest.fn(),
  setPagination: jest.fn(),
  resetPagination: jest.fn()
}

// Helper functions for assertions
export const expectToHaveAccessibleName = (element: Element, name: string) => {
  expect(element).toHaveAccessibleName(name)
}

export const expectToBeVisible = (element: Element) => {
  expect(element).toBeVisible()
}

export const expectToHaveClass = (element: Element, className: string) => {
  expect(element).toHaveClass(className)
}

// This is a test utilities file - adding a simple test to satisfy Jest
describe('test-utils', () => {
  it('exports mock data correctly', () => {
    expect(mockPurchase).toBeDefined()
    expect(mockPurchases).toBeDefined()
    expect(mockCategory).toBeDefined()
    expect(mockPaymentMethod).toBeDefined()
  })
})