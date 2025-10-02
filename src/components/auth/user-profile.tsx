'use client'

import React, { useState } from 'react'
import { useUser } from '@auth0/nextjs-auth0'
import { cn } from '@/lib/utils'

interface UserProfileProps {
  className?: string
  compact?: boolean
  showAvatar?: boolean
  showEmail?: boolean
}

export function UserProfile({
  className,
  compact = false,
  showAvatar = true,
  showEmail = true,
}: UserProfileProps) {
  const { user, isLoading, error } = useUser()
  const [imageError, setImageError] = useState(false)

  if (isLoading) {
    return (
      <div
        className={cn('flex items-center gap-3 p-3', compact ? 'flex-row' : 'flex-col', className)}
        data-testid="user-profile-skeleton"
      >
        <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
        <div className="flex flex-col gap-1">
          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
          <div className="h-3 w-32 bg-muted animate-pulse rounded" />
        </div>
        <span className="sr-only">Loading user profile...</span>
      </div>
    )
  }

  // Don't render if not authenticated or error
  if (!user || error) {
    return null
  }

  const displayName = user.name || user.email || 'User'
  const initials = getInitials(displayName)

  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3',
        compact ? 'flex-row' : 'flex-col text-center',
        className
      )}
      data-testid="user-profile"
    >
      {showAvatar && (
        <div className="relative">
          {user.picture && !imageError ? (
            <img
              src={user.picture}
              alt={`${displayName}'s profile picture`}
              className="h-10 w-10 rounded-full object-cover"
              onError={handleImageError}
            />
          ) : (
            <div
              className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium"
              data-testid="fallback-avatar"
            >
              {initials}
            </div>
          )}
        </div>
      )}

      {!showAvatar && (
        <div
          className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary"
          data-testid="user-initials"
          aria-label={`User initials: ${initials}`}
        >
          {initials}
        </div>
      )}

      <div
        className={cn(
          'flex flex-col',
          compact ? 'text-left' : 'text-center',
          'min-w-0' // Allows text to truncate
        )}
      >
        <span className="font-medium text-sm text-foreground truncate">{displayName}</span>
        {showEmail && user.email && (
          <span className="text-xs text-muted-foreground truncate">{user.email}</span>
        )}
      </div>
    </div>
  )
}

function getInitials(name: string): string {
  if (!name) return 'U'

  // Handle email addresses
  if (name.includes('@')) {
    const [localPart] = name.split('@')
    const parts = localPart.split(/[._-]/)
    return parts
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('')
  }

  // Handle regular names
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase()
  }

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}
