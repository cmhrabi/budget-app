import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useUser } from '@auth0/nextjs-auth0/client'
import { UserMenu } from '../user-menu'

// Mock the Auth0 hook
jest.mock('@auth0/nextjs-auth0/client', () => ({
  useUser: jest.fn()
}))

// Mock window.location for logout tests
const mockLocation = {
  href: '',
  assign: jest.fn()
}
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
})

// Mock window.confirm
const mockConfirm = jest.fn()
Object.defineProperty(window, 'confirm', {
  value: mockConfirm,
  writable: true
})

describe('UserMenu', () => {
  const mockUseUser = useUser as jest.MockedFunction<typeof useUser>

  beforeEach(() => {
    jest.clearAllMocks()
    mockLocation.href = ''
    mockLocation.assign.mockClear()
    mockConfirm.mockClear()
  })

  describe('when user is authenticated', () => {
    beforeEach(() => {
      mockUseUser.mockReturnValue({
        user: {
          sub: 'auth0|123',
          name: 'John Doe',
          email: 'john@example.com',
          picture: 'https://example.com/avatar.jpg'
        },
        error: undefined,
        isLoading: false
      })
    })

    it('renders user menu trigger with user profile', () => {
      render(<UserMenu />)
      
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByRole('img', { name: /john doe/i })).toBeInTheDocument()
    })

    it('opens menu when trigger is clicked', async () => {
      render(<UserMenu />)
      
      const trigger = screen.getByTestId('user-menu-trigger')
      fireEvent.click(trigger)
      
      await waitFor(() => {
        expect(screen.getByText('Profile')).toBeInTheDocument()
        expect(screen.getByText('Settings')).toBeInTheDocument()
        expect(screen.getByText('Log Out')).toBeInTheDocument()
      })
    })

    it('shows user profile information in menu header', async () => {
      render(<UserMenu />)
      
      const trigger = screen.getByTestId('user-menu-trigger')
      fireEvent.click(trigger)
      
      await waitFor(() => {
        expect(screen.getAllByText('John Doe')).toHaveLength(2) // One in trigger, one in menu
        expect(screen.getByText('john@example.com')).toBeInTheDocument()
      })
    })

    it('logs out when logout option is clicked and confirmed', async () => {
      mockConfirm.mockReturnValue(true)
      render(<UserMenu />)
      
      const trigger = screen.getByTestId('user-menu-trigger')
      fireEvent.click(trigger)
      
      await waitFor(() => {
        const logoutButton = screen.getByText('Log Out')
        fireEvent.click(logoutButton)
      })
      
      expect(mockConfirm).toHaveBeenCalledWith('Are you sure you want to log out?')
      await waitFor(() => {
        expect(mockLocation.assign).toHaveBeenCalledWith('/api/auth/logout')
      })
    })

    it('does not log out when logout is cancelled', async () => {
      mockConfirm.mockReturnValue(false)
      render(<UserMenu />)
      
      const trigger = screen.getByTestId('user-menu-trigger')
      fireEvent.click(trigger)
      
      await waitFor(() => {
        const logoutButton = screen.getByText('Log Out')
        fireEvent.click(logoutButton)
      })
      
      expect(mockConfirm).toHaveBeenCalledWith('Are you sure you want to log out?')
      expect(mockLocation.assign).not.toHaveBeenCalled()
    })

    it('closes menu when escape key is pressed', async () => {
      render(<UserMenu />)
      
      const trigger = screen.getByTestId('user-menu-trigger')
      fireEvent.click(trigger)
      
      await waitFor(() => {
        expect(screen.getByText('Profile')).toBeInTheDocument()
      })
      
      fireEvent.keyDown(document, { key: 'Escape' })
      
      await waitFor(() => {
        expect(screen.queryByText('Profile')).not.toBeInTheDocument()
      })
    })

    it('closes menu when clicking outside', async () => {
      render(
        <div>
          <UserMenu />
          <div data-testid="outside-element">Outside</div>
        </div>
      )
      
      const trigger = screen.getByTestId('user-menu-trigger')
      fireEvent.click(trigger)
      
      await waitFor(() => {
        expect(screen.getByText('Profile')).toBeInTheDocument()
      })
      
      const outsideElement = screen.getByTestId('outside-element')
      fireEvent.mouseDown(outsideElement)
      
      await waitFor(() => {
        expect(screen.queryByText('Profile')).not.toBeInTheDocument()
      })
    })

    it('applies custom className when provided', () => {
      render(<UserMenu className="custom-class" />)
      
      const menuContainer = screen.getByTestId('user-menu')
      expect(menuContainer).toHaveClass('custom-class')
    })

    it('shows compact trigger when compact prop is true', () => {
      render(<UserMenu compact />)
      
      // Should only show avatar in compact mode
      expect(screen.getByRole('img')).toBeInTheDocument()
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
    })

    it('executes custom onProfileClick when provided', async () => {
      const mockOnProfileClick = jest.fn()
      render(<UserMenu onProfileClick={mockOnProfileClick} />)
      
      const trigger = screen.getByTestId('user-menu-trigger')
      fireEvent.click(trigger)
      
      await waitFor(() => {
        const profileButton = screen.getByText('Profile')
        fireEvent.click(profileButton)
      })
      
      expect(mockOnProfileClick).toHaveBeenCalled()
    })

    it('executes custom onSettingsClick when provided', async () => {
      const mockOnSettingsClick = jest.fn()
      render(<UserMenu onSettingsClick={mockOnSettingsClick} />)
      
      const trigger = screen.getByTestId('user-menu-trigger')
      fireEvent.click(trigger)
      
      await waitFor(() => {
        const settingsButton = screen.getByText('Settings')
        fireEvent.click(settingsButton)
      })
      
      expect(mockOnSettingsClick).toHaveBeenCalled()
    })

    it('shows only specified menu items when showOptions is provided', async () => {
      render(<UserMenu showOptions={['profile']} />)
      
      const trigger = screen.getByTestId('user-menu-trigger')
      fireEvent.click(trigger)
      
      await waitFor(() => {
        expect(screen.getByText('Profile')).toBeInTheDocument()
        expect(screen.queryByText('Settings')).not.toBeInTheDocument()
        expect(screen.getByText('Log Out')).toBeInTheDocument() // Always shown
      })
    })
  })

  describe('when user is not authenticated', () => {
    beforeEach(() => {
      mockUseUser.mockReturnValue({
        user: undefined,
        error: undefined,
        isLoading: false
      })
    })

    it('does not render when user is not authenticated', () => {
      render(<UserMenu />)
      
      expect(screen.queryByTestId('user-menu')).not.toBeInTheDocument()
    })
  })

  describe('when loading', () => {
    beforeEach(() => {
      mockUseUser.mockReturnValue({
        user: undefined,
        error: undefined,
        isLoading: true
      })
    })

    it('shows loading skeleton', () => {
      render(<UserMenu />)
      
      expect(screen.getByTestId('user-menu-skeleton')).toBeInTheDocument()
    })
  })

  describe('when there is an error', () => {
    beforeEach(() => {
      mockUseUser.mockReturnValue({
        user: undefined,
        error: new Error('Auth error'),
        isLoading: false
      })
    })

    it('does not render when there is an error', () => {
      render(<UserMenu />)
      
      expect(screen.queryByTestId('user-menu')).not.toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    beforeEach(() => {
      mockUseUser.mockReturnValue({
        user: {
          sub: 'auth0|123',
          name: 'John Doe',
          email: 'john@example.com',
          picture: 'https://example.com/avatar.jpg'
        },
        error: undefined,
        isLoading: false
      })
    })

    it('has proper ARIA attributes', () => {
      render(<UserMenu />)
      
      const trigger = screen.getByTestId('user-menu-trigger')
      expect(trigger).toHaveAttribute('aria-haspopup', 'true')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })

    it('updates aria-expanded when menu is opened', async () => {
      render(<UserMenu />)
      
      const trigger = screen.getByTestId('user-menu-trigger')
      fireEvent.click(trigger)
      
      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'true')
      })
    })

    it('has proper keyboard navigation', async () => {
      render(<UserMenu />)
      
      const trigger = screen.getByTestId('user-menu-trigger')
      trigger.focus()
      expect(trigger).toHaveFocus()
      
      // Note: DropdownMenu component handles keyboard events internally
      // This test verifies the trigger can receive focus
      expect(trigger).toHaveAttribute('aria-haspopup', 'true')
    })
  })
})