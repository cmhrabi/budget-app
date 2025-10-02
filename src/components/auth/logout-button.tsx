'use client'

import React from 'react'
import { useUser } from '@auth0/nextjs-auth0/client'
import { Button, ButtonProps } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

interface LogoutButtonProps extends Omit<ButtonProps, 'onClick' | 'disabled'> {
  children?: React.ReactNode
  showConfirmation?: boolean
  confirmMessage?: string
}

export function LogoutButton({ 
  children = 'Log Out', 
  className,
  variant = 'ghost',
  size = 'default',
  showConfirmation = true,
  confirmMessage = 'Are you sure you want to log out?',
  ...props 
}: LogoutButtonProps) {
  const { user, isLoading, error } = useUser()

  const handleLogout = () => {
    if (showConfirmation) {
      const confirmed = window.confirm(confirmMessage)
      if (!confirmed) {
        return
      }
    }
    
    window.location.assign('/api/auth/logout')
  }

  // Don't render if user is not authenticated
  if (!user) {
    return null
  }

  const isDisabled = isLoading || !!error

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={handleLogout}
      disabled={isDisabled}
      aria-label={typeof children === 'string' ? children : 'Log Out'}
      {...props}
    >
      {isLoading ? (
        <>
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Loading...
        </>
      ) : (
        <>
          <LogOut className="mr-2 h-4 w-4" />
          {children}
        </>
      )}
    </Button>
  )
}