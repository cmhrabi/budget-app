import { generateMockPurchasesForUser, generateMockPurchases } from '../mock-data'

describe('Mock Data Generation', () => {
  describe('Deterministic Seeding', () => {
    it('should generate same purchases for same user ID', () => {
      const userId = 'auth0|test123'
      const purchases1 = generateMockPurchasesForUser(userId, 10)
      const purchases2 = generateMockPurchasesForUser(userId, 10)

      expect(purchases1).toHaveLength(10)
      expect(purchases2).toHaveLength(10)

      // Compare each purchase
      purchases1.forEach((purchase1, index) => {
        const purchase2 = purchases2[index]
        expect(purchase1.amount).toBe(purchase2.amount)
        expect(purchase1.merchantName).toBe(purchase2.merchantName)
        expect(purchase1.category.id).toBe(purchase2.category.id)
        expect(purchase1.currency).toBe(purchase2.currency)
        expect(purchase1.description).toBe(purchase2.description)
      })
    })

    it('should generate different purchases for different user IDs', () => {
      const user1Id = 'auth0|user1'
      const user2Id = 'auth0|user2'

      const purchases1 = generateMockPurchasesForUser(user1Id, 10)
      const purchases2 = generateMockPurchasesForUser(user2Id, 10)

      expect(purchases1).toHaveLength(10)
      expect(purchases2).toHaveLength(10)

      // Purchases should be different (at least some of them)
      const hasDifferences = purchases1.some((p1, index) => {
        const p2 = purchases2[index]
        return p1.amount !== p2.amount || p1.merchantName !== p2.merchantName
      })

      expect(hasDifferences).toBe(true)
    })

    it('should include userId in all generated purchases', () => {
      const userId = 'auth0|test123'
      const purchases = generateMockPurchasesForUser(userId, 5)

      purchases.forEach(purchase => {
        expect(purchase.userId).toBe(userId)
      })
    })

    it('should generate requested number of purchases', () => {
      const userId = 'auth0|test123'

      expect(generateMockPurchasesForUser(userId, 5)).toHaveLength(5)
      expect(generateMockPurchasesForUser(userId, 20)).toHaveLength(20)
      expect(generateMockPurchasesForUser(userId, 50)).toHaveLength(50)
    })

    it('should sort purchases by date (newest first)', () => {
      const userId = 'auth0|test123'
      const purchases = generateMockPurchasesForUser(userId, 10)

      for (let i = 0; i < purchases.length - 1; i++) {
        const current = purchases[i]
        const next = purchases[i + 1]
        expect(current.date.getTime()).toBeGreaterThanOrEqual(next.date.getTime())
      }
    })
  })

  describe('Purchase Data Quality', () => {
    const userId = 'auth0|test123'
    const purchases = generateMockPurchasesForUser(userId, 50)

    it('should generate valid purchase amounts', () => {
      purchases.forEach(purchase => {
        expect(purchase.amount).toBeGreaterThan(0)
        expect(purchase.amount).toBeLessThan(3000)
        // Check that amount is rounded to 2 decimal places
        expect(purchase.amount).toBe(Math.round(purchase.amount * 100) / 100)
      })
    })

    it('should use valid currencies', () => {
      purchases.forEach(purchase => {
        expect(['CAD', 'USD']).toContain(purchase.currency)
      })
    })

    it('should have valid dates within last 6 months', () => {
      const now = new Date()
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

      purchases.forEach(purchase => {
        expect(purchase.date).toBeInstanceOf(Date)
        expect(purchase.date.getTime()).toBeLessThanOrEqual(now.getTime())
        expect(purchase.date.getTime()).toBeGreaterThanOrEqual(sixMonthsAgo.getTime())
      })
    })

    it('should have valid category structure', () => {
      purchases.forEach(purchase => {
        expect(purchase.category).toBeDefined()
        expect(purchase.category.id).toBeTruthy()
        expect(purchase.category.name).toBeTruthy()
        expect(purchase.category.color).toBeTruthy()
        expect(purchase.category.icon).toBeTruthy()
      })
    })

    it('should have valid payment method structure', () => {
      purchases.forEach(purchase => {
        expect(purchase.paymentMethod).toBeDefined()
        expect(purchase.paymentMethod.id).toBeTruthy()
        expect(purchase.paymentMethod.type).toBeTruthy()
        expect(['credit', 'debit', 'cash', 'transfer', 'e_transfer']).toContain(
          purchase.paymentMethod.type
        )
      })
    })

    it('should have non-empty descriptions and merchant names', () => {
      purchases.forEach(purchase => {
        expect(purchase.description).toBeTruthy()
        expect(purchase.merchantName).toBeTruthy()
        expect(typeof purchase.description).toBe('string')
        expect(typeof purchase.merchantName).toBe('string')
      })
    })

    it('should have valid timestamps', () => {
      purchases.forEach(purchase => {
        expect(purchase.createdAt).toBeInstanceOf(Date)
        expect(purchase.updatedAt).toBeInstanceOf(Date)
        expect(purchase.createdAt.getTime()).toBeLessThanOrEqual(purchase.updatedAt.getTime())
      })
    })

    it('should generate tags array (may be empty)', () => {
      purchases.forEach(purchase => {
        expect(Array.isArray(purchase.tags)).toBe(true)
        expect(purchase.tags.length).toBeLessThanOrEqual(3)
      })
    })

    it('should generate metadata object', () => {
      purchases.forEach(purchase => {
        expect(purchase.metadata).toBeDefined()
        expect(typeof purchase.metadata).toBe('object')
      })
    })
  })

  describe('Category-based Amount Ranges', () => {
    it('should generate appropriate amounts for travel and insurance', () => {
      const userId = 'auth0|travel_user'
      const purchases = generateMockPurchasesForUser(userId, 100)

      const travelOrInsurance = purchases.filter(
        p => p.category.id === 'travel' || p.category.id === 'insurance'
      )

      if (travelOrInsurance.length > 0) {
        travelOrInsurance.forEach(purchase => {
          expect(purchase.amount).toBeGreaterThanOrEqual(100)
          expect(purchase.amount).toBeLessThanOrEqual(2100)
        })
      }
    })

    it('should generate appropriate amounts for food and transportation', () => {
      const userId = 'auth0|food_user'
      const purchases = generateMockPurchasesForUser(userId, 100)

      const foodOrTransport = purchases.filter(
        p => p.category.id === 'food-dining' || p.category.id === 'transportation'
      )

      if (foodOrTransport.length > 0) {
        foodOrTransport.forEach(purchase => {
          expect(purchase.amount).toBeGreaterThanOrEqual(5)
          expect(purchase.amount).toBeLessThanOrEqual(155)
        })
      }
    })
  })

  describe('Backward Compatibility', () => {
    it('should support legacy generateMockPurchases function', () => {
      const purchases = generateMockPurchases(10)
      expect(purchases).toHaveLength(10)
      purchases.forEach(purchase => {
        expect(purchase.userId).toBe('anonymous')
      })
    })
  })

  describe('Seed Consistency', () => {
    it('should generate consistent seed from user ID', () => {
      // This tests that the same user ID always generates the same sequence
      const userId = 'auth0|consistent_test'

      const run1 = generateMockPurchasesForUser(userId, 5)
      const run2 = generateMockPurchasesForUser(userId, 5)
      const run3 = generateMockPurchasesForUser(userId, 5)

      // All three runs should produce identical results
      expect(run1).toEqual(run2)
      expect(run2).toEqual(run3)
    })

    it('should handle user IDs with special characters', () => {
      const specialIds = [
        'auth0|user@example.com',
        'auth0|user_123-456',
        'google-oauth2|1234567890',
        'auth0|user.name+tag@example.com',
      ]

      specialIds.forEach(userId => {
        expect(() => generateMockPurchasesForUser(userId, 5)).not.toThrow()

        const purchases = generateMockPurchasesForUser(userId, 5)
        expect(purchases).toHaveLength(5)
        purchases.forEach(purchase => {
          expect(purchase.userId).toBe(userId)
        })
      })
    })
  })
})
