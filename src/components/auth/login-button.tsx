'use client'

import React from 'react'
import { useUser } from '@auth0/nextjs-auth0'
import { Button, ButtonProps } from '@/components/ui/button'
import { LogIn } from 'lucide-react'

interface LoginButtonProps extends Omit<ButtonProps, 'onClick' | 'disabled'> {
  readonly children?: React.ReactNode
}

export function LoginButton({ 
  children = 'Log In', 
  className,
  variant = 'default',
  size = 'default',
  ...props 
}: LoginButtonProps) {
  const { user, isLoading, error } = useUser()

  const handleLogin = () => {
    window.location.assign('/api/auth/login')
  }

  // Don't render if user is already authenticated
  if (user) {
    return null
  }

  const isDisabled = isLoading || !!error

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={handleLogin}
      disabled={isDisabled}
      aria-label={typeof children === 'string' ? children : 'Log In'}
      {...props}
    >
      {isLoading ? (
        <>
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Loading...
        </>
      ) : (
        <>
          <LogIn className="mr-2 h-4 w-4" />
          {children}
        </>
      )}
    </Button>
  )
}