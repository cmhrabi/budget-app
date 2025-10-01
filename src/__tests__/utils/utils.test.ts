import { formatCurrency, formatDate, formatRelativeDate, cn } from '@/lib/utils'

describe('Utils', () => {
  describe('formatCurrency', () => {
    it('should format CAD currency correctly', () => {
      expect(formatCurrency(123.45, 'CAD')).toBe('$123.45')
      expect(formatCurrency(1000, 'CAD')).toBe('$1,000.00')
    })

    it('should format USD currency correctly', () => {
      expect(formatCurrency(123.45, 'USD')).toBe('US$123.45')
    })

    it('should default to CAD', () => {
      expect(formatCurrency(100)).toBe('$100.00')
    })
  })

  describe('formatDate', () => {
    it('should format date objects correctly', () => {
      const date = new Date('2023-12-25T12:00:00.000Z')
      const formatted = formatDate(date)
      expect(formatted).toMatch(/Dec 2[45], 2023/) // Account for timezone differences
    })

    it('should format date strings correctly', () => {
      const formatted = formatDate('2023-12-25T12:00:00.000Z')
      expect(formatted).toMatch(/Dec 2[45], 2023/) // Account for timezone differences
    })
  })

  describe('formatRelativeDate', () => {
    it('should return "Today" for current date', () => {
      const today = new Date()
      expect(formatRelativeDate(today)).toBe('Today')
    })

    it('should return "Yesterday" for previous day', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      expect(formatRelativeDate(yesterday)).toBe('Yesterday')
    })

    it('should return days ago for recent dates', () => {
      const threeDaysAgo = new Date()
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
      expect(formatRelativeDate(threeDaysAgo)).toBe('3 days ago')
    })
  })

  describe('cn', () => {
    it('should merge class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
    })

    it('should handle conditional classes', () => {
      expect(cn('class1', false && 'class2', 'class3')).toBe('class1 class3')
    })
  })
})