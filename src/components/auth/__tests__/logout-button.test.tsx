import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useUser } from '@auth0/nextjs-auth0/client'
import { LogoutButton } from '../logout-button'

// Mock the Auth0 hook
jest.mock('@auth0/nextjs-auth0/client', () => ({
  useUser: jest.fn()
}))

// Mock window.location for redirect tests
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

describe('LogoutButton', () => {
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
          sub: '123',
          name: 'John Doe',
          email: 'john@example.com'
        },
        error: undefined,
        isLoading: false
      })
    })

    it('renders logout button', () => {
      render(<LogoutButton />)
      
      const button = screen.getByRole('button', { name: /log out/i })
      expect(button).toBeInTheDocument()
      expect(button).not.toBeDisabled()
    })

    it('shows confirmation dialog and logs out when confirmed', async () => {
      mockConfirm.mockReturnValue(true)
      render(<LogoutButton />)
      
      const button = screen.getByRole('button', { name: /log out/i })
      fireEvent.click(button)
      
      expect(mockConfirm).toHaveBeenCalledWith('Are you sure you want to log out?')
      await waitFor(() => {
        expect(mockLocation.assign).toHaveBeenCalledWith('/api/auth/logout')
      })
    })

    it('does not log out when confirmation is cancelled', () => {
      mockConfirm.mockReturnValue(false)
      render(<LogoutButton />)
      
      const button = screen.getByRole('button', { name: /log out/i })
      fireEvent.click(button)
      
      expect(mockConfirm).toHaveBeenCalledWith('Are you sure you want to log out?')
      expect(mockLocation.assign).not.toHaveBeenCalled()
    })

    it('applies custom className when provided', () => {
      render(<LogoutButton className="custom-class" />)
      
      const button = screen.getByRole('button', { name: /log out/i })
      expect(button).toHaveClass('custom-class')
    })

    it('renders with custom text when provided', () => {
      render(<LogoutButton>Sign Out</LogoutButton>)
      
      expect(screen.getByRole('button', { name: 'Sign Out' })).toBeInTheDocument()
    })

    it('uses custom confirmation message when provided', () => {
      const customMessage = 'Do you really want to leave?'
      mockConfirm.mockReturnValue(true)
      
      render(<LogoutButton confirmMessage={customMessage} />)
      
      const button = screen.getByRole('button', { name: /log out/i })
      fireEvent.click(button)
      
      expect(mockConfirm).toHaveBeenCalledWith(customMessage)
    })

    it('skips confirmation when showConfirmation is false', async () => {
      render(<LogoutButton showConfirmation={false} />)
      
      const button = screen.getByRole('button', { name: /log out/i })
      fireEvent.click(button)
      
      expect(mockConfirm).not.toHaveBeenCalled()
      await waitFor(() => {
        expect(mockLocation.assign).toHaveBeenCalledWith('/api/auth/logout')
      })
    })

    it('applies button variant correctly', () => {
      render(<LogoutButton variant="outline" />)
      
      const button = screen.getByRole('button', { name: /log out/i })
      expect(button).toBeInTheDocument()
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
      render(<LogoutButton />)
      
      expect(screen.queryByRole('button', { name: /log out/i })).not.toBeInTheDocument()
    })
  })

  describe('when loading', () => {
    beforeEach(() => {
      mockUseUser.mockReturnValue({
        user: {
          sub: '123',
          name: 'John Doe',
          email: 'john@example.com'
        },
        error: undefined,
        isLoading: true
      })
    })

    it('renders disabled button with loading state', () => {
      render(<LogoutButton />)
      
      const button = screen.getByRole('button', { name: /log out/i })
      expect(button).toBeInTheDocument()
      expect(button).toBeDisabled()
    })
  })

  describe('when there is an error', () => {
    beforeEach(() => {
      mockUseUser.mockReturnValue({
        user: {
          sub: '123',
          name: 'John Doe',
          email: 'john@example.com'
        },
        error: new Error('Auth error'),
        isLoading: false
      })
    })

    it('renders disabled button when there is an error', () => {
      render(<LogoutButton />)
      
      const button = screen.getByRole('button', { name: /log out/i })
      expect(button).toBeInTheDocument()
      expect(button).toBeDisabled()
    })
  })

  describe('accessibility', () => {
    beforeEach(() => {
      mockUseUser.mockReturnValue({
        user: {
          sub: '123',
          name: 'John Doe',
          email: 'john@example.com'
        },
        error: undefined,
        isLoading: false
      })
    })

    it('has proper ARIA label', () => {
      render(<LogoutButton />)
      
      const button = screen.getByRole('button', { name: /log out/i })
      expect(button).toHaveAttribute('type', 'button')
    })

    it('supports keyboard focus', () => {
      render(<LogoutButton />)
      
      const button = screen.getByRole('button', { name: /log out/i })
      button.focus()
      expect(button).toHaveFocus()
    })
  })
})