import { render, screen } from '@testing-library/react'
import { useUser } from '@auth0/nextjs-auth0/client'
import { AuthStatus } from '../auth-status'

// Mock the Auth0 hook
jest.mock('@auth0/nextjs-auth0/client', () => ({
  useUser: jest.fn()
}))

describe('AuthStatus', () => {
  const mockUseUser = useUser as jest.MockedFunction<typeof useUser>

  beforeEach(() => {
    jest.clearAllMocks()
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

    it('displays authenticated status', () => {
      render(<AuthStatus />)
      
      expect(screen.getByText('Authenticated')).toBeInTheDocument()
      expect(screen.getByText('You are logged in as John Doe')).toBeInTheDocument()
    })

    it('shows user email', () => {
      render(<AuthStatus showEmail />)
      
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
    })

    it('displays fallback name when name is not available', () => {
      mockUseUser.mockReturnValue({
        user: {
          sub: 'auth0|123',
          email: 'john@example.com'
        },
        error: undefined,
        isLoading: false
      })

      render(<AuthStatus />)
      
      expect(screen.getByText('You are logged in as john@example.com')).toBeInTheDocument()
    })

    it('applies custom className when provided', () => {
      render(<AuthStatus className="custom-class" />)
      
      const container = screen.getByRole('status')
      expect(container).toHaveClass('custom-class')
    })

    it('shows compact view when compact prop is true', () => {
      render(<AuthStatus compact />)
      
      expect(screen.getByText('Logged in')).toBeInTheDocument()
      expect(screen.queryByText('You are logged in as')).not.toBeInTheDocument()
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

    it('displays unauthenticated status', () => {
      render(<AuthStatus />)
      
      expect(screen.getByText('Not Authenticated')).toBeInTheDocument()
      expect(screen.getByText('Please log in to access your account')).toBeInTheDocument()
    })

    it('shows compact view when compact prop is true', () => {
      render(<AuthStatus compact />)
      
      expect(screen.getByText('Not logged in')).toBeInTheDocument()
      expect(screen.queryByText('Please log in to access your account')).not.toBeInTheDocument()
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

    it('displays loading state', () => {
      render(<AuthStatus />)
      
      expect(screen.getByText('Checking Authentication...')).toBeInTheDocument()
      expect(screen.getByText('Please wait while we verify your login status')).toBeInTheDocument()
    })

    it('shows compact loading view when compact prop is true', () => {
      render(<AuthStatus compact />)
      
      expect(screen.getByText('Loading...')).toBeInTheDocument()
      expect(screen.queryByText('Please wait while we verify your login status')).not.toBeInTheDocument()
    })

    it('displays loading spinner', () => {
      render(<AuthStatus />)
      
      const spinner = screen.getByRole('status', { name: /loading/i })
      expect(spinner).toBeInTheDocument()
    })
  })

  describe('when there is an error', () => {
    beforeEach(() => {
      mockUseUser.mockReturnValue({
        user: undefined,
        error: new Error('Authentication failed'),
        isLoading: false
      })
    })

    it('displays error state', () => {
      render(<AuthStatus />)
      
      expect(screen.getByText('Authentication Error')).toBeInTheDocument()
      expect(screen.getByText('There was a problem with authentication. Please try again.')).toBeInTheDocument()
    })

    it('shows compact error view when compact prop is true', () => {
      render(<AuthStatus compact />)
      
      expect(screen.getByText('Auth Error')).toBeInTheDocument()
      expect(screen.queryByText('There was a problem with authentication')).not.toBeInTheDocument()
    })

    it('shows custom error message when provided', () => {
      render(<AuthStatus showErrorDetails />)
      
      expect(screen.getByText('Authentication failed')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    beforeEach(() => {
      mockUseUser.mockReturnValue({
        user: {
          sub: 'auth0|123',
          name: 'John Doe',
          email: 'john@example.com'
        },
        error: undefined,
        isLoading: false
      })
    })

    it('has proper ARIA attributes', () => {
      render(<AuthStatus />)
      
      const status = screen.getByRole('status')
      expect(status).toBeInTheDocument()
      expect(status).toHaveAttribute('aria-live', 'polite')
    })

    it('uses semantic elements', () => {
      render(<AuthStatus />)
      
      expect(screen.getByRole('status')).toBeInTheDocument()
    })
  })

  describe('visual indicators', () => {
    it('shows success indicator when authenticated', () => {
      mockUseUser.mockReturnValue({
        user: {
          sub: 'auth0|123',
          name: 'John Doe',
          email: 'john@example.com'
        },
        error: undefined,
        isLoading: false
      })

      render(<AuthStatus />)
      
      const indicator = screen.getByTestId('auth-status-indicator')
      expect(indicator).toHaveClass('bg-green-500')
    })

    it('shows error indicator when there is an error', () => {
      mockUseUser.mockReturnValue({
        user: undefined,
        error: new Error('Auth error'),
        isLoading: false
      })

      render(<AuthStatus />)
      
      const indicator = screen.getByTestId('auth-status-indicator')
      expect(indicator).toHaveClass('bg-red-500')
    })

    it('shows warning indicator when not authenticated', () => {
      mockUseUser.mockReturnValue({
        user: undefined,
        error: undefined,
        isLoading: false
      })

      render(<AuthStatus />)
      
      const indicator = screen.getByTestId('auth-status-indicator')
      expect(indicator).toHaveClass('bg-yellow-500')
    })
  })
})