import type { Purchase } from '@/types'
import { DEFAULT_CATEGORIES, DEFAULT_PAYMENT_METHODS } from '@/lib/constants'

/**
 * Seeded Random Number Generator
 * Uses a simple Linear Congruential Generator (LCG) algorithm
 * to generate deterministic pseudo-random numbers based on a seed
 */
class SeededRandom {
  private seed: number

  constructor(seed: number) {
    this.seed = seed % 2147483647
    if (this.seed <= 0) this.seed += 2147483646
  }

  next(): number {
    this.seed = (this.seed * 16807) % 2147483647
    return (this.seed - 1) / 2147483646
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min
  }

  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min
  }

  choice<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)]
  }
}

/**
 * Generate a seed from a user ID string
 */
function generateSeedFromUserId(userId: string): number {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

// Sample merchant names for different categories
const MERCHANTS_BY_CATEGORY = {
  'food-dining': [
    'Tim Hortons', 'Starbucks', 'McDonalds', 'Subway', 'Pizza Pizza',
    'Loblaws', 'Metro', 'Sobeys', 'Farm Boy', 'Swiss Chalet',
    'The Keg', 'Boston Pizza', 'Earls', 'Jack Astors', 'Moxies'
  ],
  'transportation': [
    'Shell', 'Esso', 'Petro-Canada', 'Costco Gas', 'GO Transit',
    'TTC', 'Uber', 'Lyft', 'Green P Parking', 'Impark'
  ],
  'shopping': [
    'Amazon.ca', 'Walmart', 'Canadian Tire', 'Best Buy', 'The Bay',
    'Winners', 'Costco', 'IKEA', 'Home Depot', 'Indigo'
  ],
  'entertainment': [
    'Netflix', 'Spotify', 'Cineplex', 'Steam', 'PlayStation Store',
    'Apple App Store', 'YouTube Premium', 'Disney+', 'Amazon Prime Video'
  ],
  'health-fitness': [
    'Shoppers Drug Mart', 'Rexall', 'GoodLife Fitness', 'Fit4Less',
    'Walk-in Clinic', 'Dental Office', 'Physiotherapy Clinic'
  ],
  'home-garden': [
    'Hydro One', 'Enbridge Gas', 'Rogers', 'Bell', 'Home Depot',
    'Rona', 'Canadian Tire', 'Walmart', 'Leon\'s'
  ],
  'education': [
    'University of Toronto', 'Chapters Indigo', 'Amazon.ca Books',
    'Coursera', 'Udemy', 'LinkedIn Learning'
  ],
  'travel': [
    'Air Canada', 'WestJet', 'Expedia.ca', 'Booking.com', 'Hilton',
    'Marriott', 'Holiday Inn', 'Budget Car Rental'
  ],
  'insurance': [
    'Intact Insurance', 'Aviva', 'TD Insurance', 'RBC Insurance',
    'State Farm', 'Allstate'
  ],
  'personal-care': [
    'Great Clips', 'Chatters', 'Sephora', 'Bath & Body Works',
    'The Body Shop', 'Salon', 'Spa'
  ],
  'gifts-donations': [
    'Toys R Us', 'Amazon.ca', 'The Bay', 'United Way',
    'Canadian Red Cross', 'Local Food Bank'
  ],
  'business': [
    'Staples', 'Best Buy Business', 'Office Depot', 'Amazon Business',
    'FedEx', 'UPS', 'Canada Post'
  ],
  'taxes': [
    'Canada Revenue Agency', 'H&R Block', 'TurboTax', 'Local Accountant'
  ],
  'other': [
    'Miscellaneous', 'Cash Withdrawal', 'ATM Fee', 'Bank Fee'
  ]
}

// Sample descriptions for purchases
const SAMPLE_DESCRIPTIONS = [
  'Coffee and pastry',
  'Groceries for the week',
  'Gas fill-up',
  'Monthly subscription',
  'Lunch with colleagues',
  'Online shopping',
  'Dinner out',
  'Movie tickets',
  'Parking downtown',
  'Public transit',
  'Pharmacy items',
  'Home supplies',
  'Book purchase',
  'Gift for friend',
  'Utility bill payment',
  'Insurance premium',
  'Car maintenance',
  'Clothing purchase',
  'Electronics',
  'Personal care items'
]

// Sample tags
const SAMPLE_TAGS = [
  'recurring', 'work-related', 'family', 'emergency', 'planned',
  'impulse', 'necessary', 'luxury', 'health', 'education',
  'business', 'personal', 'gift', 'travel', 'home'
]

/**
 * Generate deterministic mock purchases for a user
 * @param userId - Auth0 user ID for seeding random generation
 * @param count - Number of purchases to generate
 */
export function generateMockPurchasesForUser(userId: string, count: number = 50): Purchase[] {
  const seed = generateSeedFromUserId(userId)
  const rng = new SeededRandom(seed)
  const purchases: Purchase[] = []
  const now = new Date()

  for (let i = 0; i < count; i++) {
    // Generate random date within the last 6 months
    const daysAgo = rng.nextInt(0, 180)
    const date = new Date(now)
    date.setDate(date.getDate() - daysAgo)

    // Pick random category
    const category = rng.choice(DEFAULT_CATEGORIES)

    // Pick merchant based on category
    const categoryMerchants = MERCHANTS_BY_CATEGORY[category.id as keyof typeof MERCHANTS_BY_CATEGORY] || MERCHANTS_BY_CATEGORY.other
    const merchantName = rng.choice(categoryMerchants)

    // Pick random payment method
    const paymentMethod = rng.choice(DEFAULT_PAYMENT_METHODS)

    // Generate amount based on category (some categories tend to have higher amounts)
    let amount: number
    switch (category.id) {
      case 'travel':
      case 'insurance':
        amount = rng.nextFloat(100, 2100) // $100 - $2100
        break
      case 'home-garden':
      case 'education':
        amount = rng.nextFloat(50, 550) // $50 - $550
        break
      case 'food-dining':
      case 'transportation':
        amount = rng.nextFloat(5, 155) // $5 - $155
        break
      default:
        amount = rng.nextFloat(10, 310) // $10 - $310
    }
    amount = Math.round(amount * 100) / 100 // Round to 2 decimals

    // Pick random description
    const description = rng.choice(SAMPLE_DESCRIPTIONS)

    // Generate random tags (0-3 tags)
    const tagCount = rng.nextInt(0, 3)
    const tags: string[] = []
    for (let j = 0; j < tagCount; j++) {
      const tag = rng.choice(SAMPLE_TAGS)
      if (!tags.includes(tag)) {
        tags.push(tag)
      }
    }

    // Generate metadata based on category
    const metadata: any = {}
    if (category.id === 'food-dining' && rng.next() > 0.7) {
      metadata.location = {
        city: 'Toronto',
        province: 'ON',
        country: 'Canada'
      }
    }
    if (rng.next() > 0.8) {
      metadata.isRecurring = true
      metadata.recurringFrequency = rng.choice(['monthly', 'weekly', 'bi-weekly'])
    }

    const purchase: Purchase = {
      id: `mock_${userId}_${i}_${Date.now()}`,
      userId, // Link purchase to user
      amount,
      currency: rng.next() > 0.9 ? 'USD' : 'CAD', // 90% CAD, 10% USD
      description,
      merchantName,
      category,
      date,
      paymentMethod,
      tags,
      metadata,
      createdAt: date,
      updatedAt: date,
    }

    purchases.push(purchase)
  }

  // Sort by date (newest first)
  return purchases.sort((a, b) => b.date.getTime() - a.date.getTime())
}

/**
 * Generate mock purchases without user scoping (legacy function for backward compatibility)
 * @deprecated Use generateMockPurchasesForUser instead
 */
export function generateMockPurchases(count: number = 50): Purchase[] {
  // Use a default user ID for non-authenticated scenarios
  return generateMockPurchasesForUser('anonymous', count)
}

export function generateRandomPurchase(): Purchase {
  return generateMockPurchases(1)[0]
}

// Generate sample data for specific scenarios (useful for testing)
export function generateLargePurchase(): Purchase {
  const purchase = generateRandomPurchase()
  return {
    ...purchase,
    amount: Math.random() * 5000 + 1000, // $1000 - $6000
    description: 'Large purchase',
    category: DEFAULT_CATEGORIES.find(c => c.id === 'travel') || DEFAULT_CATEGORIES[0],
  }
}

export function generateRecurringPurchase(): Purchase {
  const purchase = generateRandomPurchase()
  return {
    ...purchase,
    description: 'Monthly subscription',
    metadata: {
      ...purchase.metadata,
      isRecurring: true,
      recurringFrequency: 'monthly',
    },
  }
}

export function generateRecentPurchases(count: number = 10): Purchase[] {
  const purchases = generateMockPurchases(count)
  const now = new Date()
  
  return purchases.map((purchase, index) => ({
    ...purchase,
    date: new Date(now.getTime() - (index * 24 * 60 * 60 * 1000)), // One per day, going back
    createdAt: new Date(now.getTime() - (index * 24 * 60 * 60 * 1000)),
    updatedAt: new Date(now.getTime() - (index * 24 * 60 * 60 * 1000)),
  }))
}