import type { PaymentMethod } from '@/types'

export const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'cash',
    type: 'cash',
    nickname: 'Cash',
  },
  {
    id: 'visa-debit',
    type: 'debit',
    provider: 'Visa',
    nickname: 'Visa Debit',
  },
  {
    id: 'mastercard-debit',
    type: 'debit',
    provider: 'Mastercard',
    nickname: 'Mastercard Debit',
  },
  {
    id: 'interac-debit',
    type: 'debit',
    provider: 'Interac',
    nickname: 'Interac Debit',
  },
  {
    id: 'visa-credit',
    type: 'credit',
    provider: 'Visa',
    nickname: 'Visa Credit',
  },
  {
    id: 'mastercard-credit',
    type: 'credit',
    provider: 'Mastercard',
    nickname: 'Mastercard Credit',
  },
  {
    id: 'amex-credit',
    type: 'credit',
    provider: 'American Express',
    nickname: 'American Express',
  },
  {
    id: 'e-transfer',
    type: 'e_transfer',
    provider: 'Interac',
    nickname: 'E-Transfer',
  },
  {
    id: 'bank-transfer',
    type: 'transfer',
    nickname: 'Bank Transfer',
  },
]

export const CANADIAN_BANKS = [
  'Royal Bank of Canada (RBC)',
  'Toronto-Dominion Bank (TD)',
  'Bank of Nova Scotia (Scotiabank)',
  'Bank of Montreal (BMO)',
  'Canadian Imperial Bank of Commerce (CIBC)',
  'National Bank of Canada',
  'Desjardins Group',
  'Credit Union Central of Canada',
  'Tangerine Bank',
  'PC Financial',
  'Simplii Financial',
  'Koodo Mobile',
  'ATB Financial',
  'Vancity',
  'Coast Capital Savings',
  'Other'
]

export const PAYMENT_METHOD_TYPES = [
  { value: 'credit', label: 'Credit Card' },
  { value: 'debit', label: 'Debit Card' },
  { value: 'cash', label: 'Cash' },
  { value: 'transfer', label: 'Bank Transfer' },
  { value: 'e_transfer', label: 'E-Transfer' },
] as const

export function getPaymentMethodById(id: string): PaymentMethod | undefined {
  return DEFAULT_PAYMENT_METHODS.find(method => method.id === id)
}

export function getPaymentMethodsByType(type: PaymentMethod['type']): PaymentMethod[] {
  return DEFAULT_PAYMENT_METHODS.filter(method => method.type === type)
}

export function formatPaymentMethodDisplay(method: PaymentMethod): string {
  if (method.type === 'cash') {
    return 'Cash'
  }
  
  let display = method.nickname || method.provider || method.type
  
  if (method.lastFourDigits) {
    display += ` •••• ${method.lastFourDigits}`
  }
  
  if (method.bankName) {
    display += ` (${method.bankName})`
  }
  
  return display
}