import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Purchase } from '@/types'
import { formatCurrency, formatDate, cn } from '@/lib/utils'

export interface PurchaseCardProps {
  purchase: Purchase
  onClick?: (purchase: Purchase) => void
  className?: string
}

export function PurchaseCard({ purchase, onClick, className }: PurchaseCardProps) {
  const {
    merchantName,
    description,
    amount,
    currency,
    date,
    category,
    paymentMethod,
    tags = [],
    metadata = {}
  } = purchase

  const isClickable = !!onClick

  const handleClick = () => {
    if (onClick) {
      onClick(purchase)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault()
      onClick(purchase)
    }
  }

  const formatPaymentMethod = () => {
    if (paymentMethod.type === 'cash') {
      return paymentMethod.nickname || 'Cash'
    }
    
    const provider = paymentMethod.provider || paymentMethod.bankName || ''
    const lastFour = paymentMethod.lastFourDigits ? ` •••• ${paymentMethod.lastFourDigits}` : ''
    
    return `${provider}${lastFour}`.trim()
  }

  const cardContent = (
    <CardContent className="p-4">
      {/* Category indicator */}
      <div
        data-testid="category-indicator"
        className="absolute top-0 left-0 w-1 h-full rounded-l-lg"
        style={{ backgroundColor: category.color }}
        aria-hidden="true"
      />

      {/* Header with merchant and amount */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-foreground truncate">
            {merchantName}
          </h3>
          <p className="text-sm text-muted-foreground truncate">
            {description}
          </p>
        </div>
        <div className="ml-4 text-right">
          <p className="font-bold text-lg text-foreground">
            {formatCurrency(amount, currency)}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDate(date)}
          </p>
        </div>
      </div>

      {/* Category and payment method */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm" aria-hidden="true">
            {category.icon}
          </span>
          <span className="text-sm text-muted-foreground">
            {category.name}
          </span>
        </div>
        <span className="text-sm text-muted-foreground">
          {formatPaymentMethod()}
        </span>
      </div>

      {/* Location if available */}
      {metadata.location?.city && metadata.location?.province && (
        <div className="mb-3">
          <p className="text-xs text-muted-foreground">
            {metadata.location.city}, {metadata.location.province}
          </p>
        </div>
      )}

      {/* Notes if available */}
      {metadata.notes && (
        <div className="mb-3">
          <p className="text-sm text-muted-foreground italic">
            {metadata.notes}
          </p>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-xs"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </CardContent>
  )

  if (isClickable) {
    return (
      <Card
        className={cn(
          'relative transition-all duration-200 hover:shadow-md hover:bg-accent/5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          className
        )}
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={`Purchase at ${merchantName} for ${formatCurrency(amount, currency)} on ${formatDate(date)}`}
      >
        {cardContent}
      </Card>
    )
  }

  return (
    <Card
      className={cn('relative', className)}
      aria-label={`Purchase at ${merchantName} for ${formatCurrency(amount, currency)} on ${formatDate(date)}`}
    >
      {cardContent}
    </Card>
  )
}