'use client'

import React, { useState } from 'react'
import { useUser } from '@auth0/nextjs-auth0/client'
import { cn } from '@/lib/utils'
import { DropdownMenu } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { UserProfile } from './user-profile'
import { User, Settings, LogOut, ChevronDown } from 'lucide-react'

interface UserMenuProps {
  className?: string
  compact?: boolean
  showOptions?: Array<'profile' | 'settings'>
  onProfileClick?: () => void
  onSettingsClick?: () => void
}

export function UserMenu({ 
  className,
  compact = false,
  showOptions = ['profile', 'settings'],
  onProfileClick,
  onSettingsClick
}: UserMenuProps) {
  const { user, isLoading, error } = useUser()
  const [isOpen, setIsOpen] = useState(false)

  if (isLoading) {
    return (
      <div 
        className={cn("flex items-center gap-2", className)}
        data-testid="user-menu-skeleton"
      >
        <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
        {!compact && (
          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
        )}
      </div>
    )
  }

  // Don't render if not authenticated or error
  if (!user || error) {
    return null
  }

  const handleLogout = () => {
    const confirmed = window.confirm('Are you sure you want to log out?')
    if (confirmed) {
      window.location.assign('/api/auth/logout')
    }
  }

  const handleProfileClick = () => {
    setIsOpen(false)
    onProfileClick?.()
  }

  const handleSettingsClick = () => {
    setIsOpen(false)
    onSettingsClick?.()
  }

  const handleLogoutClick = () => {
    setIsOpen(false)
    handleLogout()
  }

  const displayName = user.name || user.email || 'User'
  const initials = getInitials(displayName)

  const trigger = (
    <Button
      variant="ghost"
      className={cn(
        "flex items-center gap-2 p-2",
        compact ? "h-auto" : "h-auto px-3 py-2"
      )}
      data-testid="user-menu-trigger"
      aria-haspopup="true"
      aria-expanded={isOpen}
    >
      {user.picture ? (
        <img
          src={user.picture}
          alt={`${displayName}'s profile picture`}
          className="h-8 w-8 rounded-full object-cover"
        />
      ) : (
        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
          {initials}
        </div>
      )}
      
      {!compact && (
        <>
          <span className="text-sm font-medium truncate max-w-32">
            {displayName}
          </span>
          <ChevronDown className="h-4 w-4" />
        </>
      )}
    </Button>
  )

  return (
    <div 
      className={cn("relative", className)}
      data-testid="user-menu"
    >
      <DropdownMenu
        trigger={trigger}
        open={isOpen}
        onOpenChange={setIsOpen}
        align="end"
        className="min-w-56"
      >
        {/* User Profile Header */}
        <div className="px-3 py-2 border-b">
          <UserProfile compact showEmail />
        </div>

        {/* Menu Items */}
        <div className="p-1">
          {showOptions.includes('profile') && (
            <button
              className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm"
              onClick={handleProfileClick}
            >
              <User className="h-4 w-4" />
              Profile
            </button>
          )}
          
          {showOptions.includes('settings') && (
            <button
              className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm"
              onClick={handleSettingsClick}
            >
              <Settings className="h-4 w-4" />
              Settings
            </button>
          )}
          
          <hr className="my-1" />
          
          <button
            className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm text-red-600 hover:text-red-700"
            onClick={handleLogoutClick}
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </button>
        </div>
      </DropdownMenu>
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
      .map(part => part.charAt(0).toUpperCase())
      .join('')
  }
  
  // Handle regular names
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase()
  }
  
  return parts
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('')
}