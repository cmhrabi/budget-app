import { z } from 'zod'

// Base schemas
export const currencySchema = z.enum(['CAD', 'USD'])

export const purchaseCategorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
  icon: z.string().min(1),
  description: z.string().optional(),
})

export const paymentMethodSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['credit', 'debit', 'cash', 'transfer', 'e_transfer']),
  lastFourDigits: z.string().regex(/^\d{4}$/).optional(),
  bankName: z.string().optional(),
  provider: z.string().optional(),
  nickname: z.string().optional(),
})

export const purchaseMetadataSchema = z.object({
  location: z.object({
    address: z.string().optional(),
    city: z.string().optional(),
    province: z.string().optional(),
    postalCode: z.string().regex(/^[A-Z]\d[A-Z] \d[A-Z]\d$/).optional(),
    country: z.string().optional(),
    coordinates: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    }).optional(),
  }).optional(),
  merchantCategory: z.string().optional(),
  isRecurring: z.boolean().optional(),
  recurringFrequency: z.enum(['weekly', 'bi-weekly', 'monthly', 'quarterly', 'yearly']).optional(),
  bankTransactionId: z.string().optional(),
  originalCurrency: z.string().optional(),
  originalAmount: z.number().positive().optional(),
  exchangeRate: z.number().positive().optional(),
  notes: z.string().max(1000).optional(),
})

export const purchaseSchema = z.object({
  id: z.string().min(1),
  amount: z.number().positive('Amount must be positive'),
  currency: currencySchema,
  description: z.string().min(1).max(255),
  merchantName: z.string().min(1).max(255),
  category: purchaseCategorySchema,
  date: z.date(),
  paymentMethod: paymentMethodSchema,
  tags: z.array(z.string()).default([]),
  metadata: purchaseMetadataSchema.default({}),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Request validation schemas
export const createPurchaseSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: currencySchema.default('CAD'),
  description: z.string().min(1, 'Description is required').max(255),
  merchantName: z.string().min(1, 'Merchant name is required').max(255),
  categoryId: z.string().min(1, 'Category is required'),
  date: z.union([z.string(), z.date()]).transform((val) => 
    typeof val === 'string' ? new Date(val) : val
  ),
  paymentMethodId: z.string().min(1, 'Payment method is required'),
  tags: z.array(z.string()).default([]),
  metadata: purchaseMetadataSchema.partial().default({}),
})

export const updatePurchaseSchema = createPurchaseSchema.partial().extend({
  id: z.string().min(1),
})

// Filter validation schemas
export const purchaseFiltersSchema = z.object({
  dateRange: z.object({
    start: z.date(),
    end: z.date(),
  }).optional(),
  categories: z.array(z.string()).optional(),
  paymentMethods: z.array(z.string()).optional(),
  amountRange: z.object({
    min: z.number().min(0),
    max: z.number().positive(),
  }).optional(),
  currencies: z.array(currencySchema).optional(),
  tags: z.array(z.string()).optional(),
  searchTerm: z.string().max(255).optional(),
  merchantName: z.string().max(255).optional(),
}).refine((data) => {
  if (data.dateRange) {
    return data.dateRange.start <= data.dateRange.end
  }
  return true
}, {
  message: 'Start date must be before or equal to end date',
  path: ['dateRange']
}).refine((data) => {
  if (data.amountRange) {
    return data.amountRange.min <= data.amountRange.max
  }
  return true
}, {
  message: 'Minimum amount must be less than or equal to maximum amount',
  path: ['amountRange']
})

export const purchaseSortSchema = z.object({
  field: z.enum(['date', 'amount', 'merchantName', 'category']),
  direction: z.enum(['asc', 'desc']).default('desc'),
})

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
})

// Combined search schema
export const purchaseSearchSchema = z.object({
  filters: purchaseFiltersSchema.optional(),
  sort: purchaseSortSchema.optional(),
  pagination: paginationSchema.optional(),
})

// Type exports
export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>
export type UpdatePurchaseInput = z.infer<typeof updatePurchaseSchema>
export type PurchaseFiltersInput = z.infer<typeof purchaseFiltersSchema>
export type PurchaseSortInput = z.infer<typeof purchaseSortSchema>
export type PaginationInput = z.infer<typeof paginationSchema>
export type PurchaseSearchInput = z.infer<typeof purchaseSearchSchema>