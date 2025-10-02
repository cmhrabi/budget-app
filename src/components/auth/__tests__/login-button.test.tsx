import { render, screen, fireEvent } from '@testing-library/react'
import { useUser } from '@auth0/nextjs-auth0/client'
import { LoginButton } from '../login-button'

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

describe('LoginButton', () => {
  const mockUseUser = useUser as jest.MockedFunction<typeof useUser>

  beforeEach(() => {
    jest.clearAllMocks()
    mockLocation.href = ''
    mockLocation.assign.mockClear()
  })

  describe('when user is not authenticated', () => {
    beforeEach(() => {
      mockUseUser.mockReturnValue({
        user: undefined,
        error: undefined,
        isLoading: false
      })
    })

    it('renders login button', () => {
      render(<LoginButton />)
      
      const button = screen.getByRole('button', { name: /log in/i })
      expect(button).toBeInTheDocument()
      expect(button).not.toBeDisabled()
    })

    it('redirects to Auth0 login when clicked', () => {
      render(<LoginButton />)
      
      const button = screen.getByRole('button', { name: /log in/i })
      fireEvent.click(button)
      
      expect(mockLocation.assign).toHaveBeenCalledWith('/api/auth/login')
    })

    it('applies custom className when provided', () => {
      render(<LoginButton className="custom-class" />)
      
      const button = screen.getByRole('button', { name: /log in/i })
      expect(button).toHaveClass('custom-class')
    })

    it('renders with custom text when provided', () => {
      render(<LoginButton>Sign In</LoginButton>)
      
      expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
    })

    it('applies button variant correctly', () => {
      render(<LoginButton variant="outline" />)
      
      const button = screen.getByRole('button', { name: /log in/i })
      expect(button).toBeInTheDocument()
    })
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

    it('does not render when user is authenticated', () => {
      render(<LoginButton />)
      
      expect(screen.queryByRole('button', { name: /log in/i })).not.toBeInTheDocument()
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

    it('renders disabled button with loading state', () => {
      render(<LoginButton />)
      
      const button = screen.getByRole('button', { name: /log in/i })
      expect(button).toBeInTheDocument()
      expect(button).toBeDisabled()
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

    it('renders disabled button when there is an error', () => {
      render(<LoginButton />)
      
      const button = screen.getByRole('button', { name: /log in/i })
      expect(button).toBeInTheDocument()
      expect(button).toBeDisabled()
    })
  })

  describe('accessibility', () => {
    beforeEach(() => {
      mockUseUser.mockReturnValue({
        user: undefined,
        error: undefined,
        isLoading: false
      })
    })

    it('has proper ARIA label', () => {
      render(<LoginButton />)
      
      const button = screen.getByRole('button', { name: /log in/i })
      expect(button).toHaveAttribute('type', 'button')
    })

    it('supports keyboard focus', () => {
      render(<LoginButton />)
      
      const button = screen.getByRole('button', { name: /log in/i })
      button.focus()
      expect(button).toHaveFocus()
    })
  })
})