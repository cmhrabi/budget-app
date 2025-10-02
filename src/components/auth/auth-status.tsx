'use client'

import React from 'react'
import { useUser } from '@auth0/nextjs-auth0'
import { cn } from '@/lib/utils'
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'

interface AuthStatusProps {
  readonly className?: string
  readonly compact?: boolean
  readonly showEmail?: boolean
  readonly showErrorDetails?: boolean
}

export function AuthStatus({ 
  className,
  compact = false,
  showEmail = false,
  showErrorDetails = false
}: AuthStatusProps) {
  const { user, isLoading, error } = useUser()

  if (isLoading) {
    return (
      <div 
        className={cn(
          "flex items-center gap-2 p-3 rounded-lg border bg-background",
          className
        )}
        role="status"
        aria-live="polite"
        aria-label="Loading authentication status"
      >
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          <div className="flex flex-col">
            <span className="font-medium text-sm">
              {compact ? 'Loading...' : 'Checking Authentication...'}
            </span>
            {!compact && (
              <span className="text-xs text-muted-foreground">
                Please wait while we verify your login status
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div 
        className={cn(
          "flex items-center gap-2 p-3 rounded-lg border bg-background",
          className
        )}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-2">
          <div 
            className="h-2 w-2 rounded-full bg-red-500" 
            data-testid="auth-status-indicator"
            aria-hidden="true"
          />
          <XCircle className="h-4 w-4 text-red-500" />
          <div className="flex flex-col">
            <span className="font-medium text-sm">
              {compact ? 'Auth Error' : 'Authentication Error'}
            </span>
            {!compact && (
              <span className="text-xs text-muted-foreground">
                There was a problem with authentication. Please try again.
              </span>
            )}
            {showErrorDetails && error.message && (
              <span className="text-xs text-red-600 mt-1">
                {error.message}
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (user) {
    const displayName = user.name || user.email || 'User'
    
    return (
      <div 
        className={cn(
          "flex items-center gap-2 p-3 rounded-lg border bg-background",
          className
        )}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-2">
          <div 
            className="h-2 w-2 rounded-full bg-green-500" 
            data-testid="auth-status-indicator"
            aria-hidden="true"
          />
          <CheckCircle className="h-4 w-4 text-green-500" />
          <div className="flex flex-col">
            <span className="font-medium text-sm">
              {compact ? 'Logged in' : 'Authenticated'}
            </span>
            {!compact && (
              <span className="text-xs text-muted-foreground">
                You are logged in as {displayName}
              </span>
            )}
            {showEmail && user.email && (
              <span className="text-xs text-muted-foreground">
                {user.email}
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={cn(
        "flex items-center gap-2 p-3 rounded-lg border bg-background",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        <div 
          className="h-2 w-2 rounded-full bg-yellow-500" 
          data-testid="auth-status-indicator"
          aria-hidden="true"
        />
        <AlertCircle className="h-4 w-4 text-yellow-500" />
        <div className="flex flex-col">
          <span className="font-medium text-sm">
            {compact ? 'Not logged in' : 'Not Authenticated'}
          </span>
          {!compact && (
            <span className="text-xs text-muted-foreground">
              Please log in to access your account
            </span>
          )}
        </div>
      </div>
    </div>
  )
}