import { render, screen, act } from '@testing-library/react'
import { useUser } from '@auth0/nextjs-auth0/client'
import { UserProfile } from '../user-profile'

// Mock the Auth0 hook
jest.mock('@auth0/nextjs-auth0/client', () => ({
  useUser: jest.fn()
}))

describe('UserProfile', () => {
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

    it('displays user name and email', () => {
      render(<UserProfile />)
      
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
    })

    it('displays user avatar with proper alt text', () => {
      render(<UserProfile />)
      
      const avatar = screen.getByRole('img', { name: /john doe/i })
      expect(avatar).toBeInTheDocument()
      expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg')
    })

    it('displays fallback avatar when picture is not available', () => {
      mockUseUser.mockReturnValue({
        user: {
          sub: 'auth0|123',
          name: 'John Doe',
          email: 'john@example.com'
        },
        error: undefined,
        isLoading: false
      })

      render(<UserProfile />)
      
      const fallbackAvatar = screen.getByTestId('fallback-avatar')
      expect(fallbackAvatar).toBeInTheDocument()
      expect(fallbackAvatar).toHaveTextContent('JD')
    })

    it('uses email for fallback name when name is not available', () => {
      mockUseUser.mockReturnValue({
        user: {
          sub: 'auth0|123',
          email: 'john@example.com'
        },
        error: undefined,
        isLoading: false
      })

      render(<UserProfile />)
      
      const nameElements = screen.getAllByText('john@example.com')
      expect(nameElements).toHaveLength(2) // One for name, one for email
    })

    it('generates correct initials from name', () => {
      render(<UserProfile showAvatar={false} />)
      
      const initials = screen.getByTestId('user-initials')
      expect(initials).toHaveTextContent('JD')
    })

    it('generates correct initials from email when name not available', () => {
      mockUseUser.mockReturnValue({
        user: {
          sub: 'auth0|123',
          email: 'jane.smith@example.com'
        },
        error: undefined,
        isLoading: false
      })

      render(<UserProfile showAvatar={false} />)
      
      const initials = screen.getByTestId('user-initials')
      expect(initials).toHaveTextContent('JS')
    })

    it('applies custom className when provided', () => {
      render(<UserProfile className="custom-class" />)
      
      const container = screen.getByTestId('user-profile')
      expect(container).toHaveClass('custom-class')
    })

    it('hides avatar when showAvatar is false', () => {
      render(<UserProfile showAvatar={false} />)
      
      expect(screen.queryByRole('img')).not.toBeInTheDocument()
      expect(screen.queryByTestId('fallback-avatar')).not.toBeInTheDocument()
    })

    it('hides email when showEmail is false', () => {
      render(<UserProfile showEmail={false} />)
      
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.queryByText('john@example.com')).not.toBeInTheDocument()
    })

    it('shows compact layout when compact is true', () => {
      render(<UserProfile compact />)
      
      const container = screen.getByTestId('user-profile')
      expect(container).toHaveClass('flex-row')
    })

    it('shows vertical layout by default', () => {
      render(<UserProfile />)
      
      const container = screen.getByTestId('user-profile')
      expect(container).toHaveClass('flex-col')
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
      render(<UserProfile />)
      
      expect(screen.queryByTestId('user-profile')).not.toBeInTheDocument()
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
      render(<UserProfile />)
      
      expect(screen.getByTestId('user-profile-skeleton')).toBeInTheDocument()
      expect(screen.getByText('Loading user profile...')).toBeInTheDocument()
    })
  })

  describe('when there is an error', () => {
    beforeEach(() => {
      mockUseUser.mockReturnValue({
        user: undefined,
        error: new Error('Failed to load user'),
        isLoading: false
      })
    })

    it('does not render when there is an error', () => {
      render(<UserProfile />)
      
      expect(screen.queryByTestId('user-profile')).not.toBeInTheDocument()
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

    it('has proper ARIA labels for avatar', () => {
      render(<UserProfile />)
      
      const avatar = screen.getByRole('img')
      expect(avatar).toHaveAttribute('alt', "John Doe's profile picture")
    })

    it('has proper structure with semantic elements', () => {
      render(<UserProfile />)
      
      expect(screen.getByTestId('user-profile')).toBeInTheDocument()
    })

    it('provides screen reader friendly text for initials', () => {
      render(<UserProfile showAvatar={false} />)
      
      const initials = screen.getByTestId('user-initials')
      expect(initials).toHaveAttribute('aria-label', 'User initials: JD')
    })
  })

  describe('avatar error handling', () => {
    beforeEach(() => {
      mockUseUser.mockReturnValue({
        user: {
          sub: 'auth0|123',
          name: 'John Doe',
          email: 'john@example.com',
          picture: 'https://example.com/broken-avatar.jpg'
        },
        error: undefined,
        isLoading: false
      })
    })

    it('shows fallback avatar when image fails to load', async () => {
      render(<UserProfile />)
      
      const avatar = screen.getByRole('img')
      
      // Simulate image load error
      await act(async () => {
        const errorEvent = new Event('error')
        avatar.dispatchEvent(errorEvent)
      })
      
      expect(screen.getByTestId('fallback-avatar')).toBeInTheDocument()
    })
  })
})