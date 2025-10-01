import type { PurchaseCategory } from '@/types'

export const DEFAULT_CATEGORIES: PurchaseCategory[] = [
  {
    id: 'food-dining',
    name: 'Food & Dining',
    color: '#FF6B6B',
    icon: 'utensils',
    description: 'Restaurants, groceries, and food delivery'
  },
  {
    id: 'transportation',
    name: 'Transportation',
    color: '#4ECDC4',
    icon: 'car',
    description: 'Gas, public transit, rideshare, parking'
  },
  {
    id: 'shopping',
    name: 'Shopping',
    color: '#45B7D1',
    icon: 'shopping-bag',
    description: 'Clothing, electronics, general retail'
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    color: '#96CEB4',
    icon: 'film',
    description: 'Movies, games, subscriptions, events'
  },
  {
    id: 'health-fitness',
    name: 'Health & Fitness',
    color: '#FFEAA7',
    icon: 'heart',
    description: 'Medical, pharmacy, gym, wellness'
  },
  {
    id: 'home-garden',
    name: 'Home & Garden',
    color: '#DDA0DD',
    icon: 'home',
    description: 'Utilities, maintenance, home improvement'
  },
  {
    id: 'education',
    name: 'Education',
    color: '#98D8C8',
    icon: 'book',
    description: 'Tuition, books, courses, training'
  },
  {
    id: 'travel',
    name: 'Travel',
    color: '#F7DC6F',
    icon: 'plane',
    description: 'Hotels, flights, vacation expenses'
  },
  {
    id: 'insurance',
    name: 'Insurance',
    color: '#BB8FCE',
    icon: 'shield',
    description: 'Auto, health, home, life insurance'
  },
  {
    id: 'personal-care',
    name: 'Personal Care',
    color: '#F8C471',
    icon: 'user',
    description: 'Haircuts, beauty, personal items'
  },
  {
    id: 'gifts-donations',
    name: 'Gifts & Donations',
    color: '#85C1E9',
    icon: 'gift',
    description: 'Presents, charity, donations'
  },
  {
    id: 'business',
    name: 'Business',
    color: '#A2D2FF',
    icon: 'briefcase',
    description: 'Office supplies, business meals, equipment'
  },
  {
    id: 'taxes',
    name: 'Taxes',
    color: '#FFB3BA',
    icon: 'calculator',
    description: 'Income tax, property tax, tax preparation'
  },
  {
    id: 'other',
    name: 'Other',
    color: '#D3D3D3',
    icon: 'more-horizontal',
    description: 'Miscellaneous expenses'
  }
]

export const CATEGORY_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', 
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#F8C471',
  '#85C1E9', '#A2D2FF', '#FFB3BA', '#D3D3D3', '#FFA07A',
  '#20B2AA', '#87CEEB', '#DEB887', '#F0E68C', '#DA70D6'
]

export const CATEGORY_ICONS = [
  'utensils', 'car', 'shopping-bag', 'film', 'heart', 'home',
  'book', 'plane', 'shield', 'user', 'gift', 'briefcase',
  'calculator', 'more-horizontal', 'coffee', 'music', 'camera',
  'gamepad', 'dumbbell', 'stethoscope', 'wrench', 'palette'
]

export function getCategoryById(id: string): PurchaseCategory | undefined {
  return DEFAULT_CATEGORIES.find(category => category.id === id)
}

export function getCategoryByName(name: string): PurchaseCategory | undefined {
  return DEFAULT_CATEGORIES.find(category => 
    category.name.toLowerCase() === name.toLowerCase()
  )
}