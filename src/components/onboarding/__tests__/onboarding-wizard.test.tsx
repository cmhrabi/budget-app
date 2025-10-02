import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { OnboardingWizard } from '../onboarding-wizard'

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

describe('OnboardingWizard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  describe('initialization', () => {
    it('renders welcome step by default', () => {
      render(<OnboardingWizard />)
      
      expect(screen.getByText('Welcome to Budget App')).toBeInTheDocument()
      expect(screen.getByText('Get started with tracking your expenses')).toBeInTheDocument()
    })

    it('shows step progress indicator', () => {
      render(<OnboardingWizard />)
      
      expect(screen.getByText('Step 1 of 4')).toBeInTheDocument()
    })

    it('shows correct step titles in progress', () => {
      render(<OnboardingWizard />)
      
      expect(screen.getByText('Welcome')).toBeInTheDocument()
      expect(screen.getByText('Preferences')).toBeInTheDocument()
      expect(screen.getByText('Preview')).toBeInTheDocument()
      expect(screen.getByText('Complete')).toBeInTheDocument()
    })

    it('highlights current step in progress indicator', () => {
      render(<OnboardingWizard />)
      
      const currentStep = screen.getByTestId('step-0')
      expect(currentStep).toHaveClass('bg-primary')
    })
  })

  describe('navigation', () => {
    it('navigates to next step when Next is clicked', async () => {
      render(<OnboardingWizard />)
      
      const nextButton = screen.getByText('Next')
      fireEvent.click(nextButton)
      
      await waitFor(() => {
        expect(screen.getByText('Set Your Preferences')).toBeInTheDocument()
        expect(screen.getByText('Step 2 of 4')).toBeInTheDocument()
      })
    })

    it('navigates to previous step when Back is clicked', async () => {
      render(<OnboardingWizard />)
      
      // Go to step 2
      fireEvent.click(screen.getByText('Next'))
      
      await waitFor(() => {
        expect(screen.getByText('Set Your Preferences')).toBeInTheDocument()
      })
      
      // Go back to step 1
      const backButton = screen.getByText('Back')
      fireEvent.click(backButton)
      
      await waitFor(() => {
        expect(screen.getByText('Welcome to Budget App')).toBeInTheDocument()
        expect(screen.getByText('Step 1 of 4')).toBeInTheDocument()
      })
    })

    it('hides Back button on first step', () => {
      render(<OnboardingWizard />)
      
      expect(screen.queryByText('Back')).not.toBeInTheDocument()
    })

    it('shows Skip button on all steps except last', () => {
      render(<OnboardingWizard />)
      
      expect(screen.getByText('Skip')).toBeInTheDocument()
    })

    it('hides Skip button on last step', async () => {
      render(<OnboardingWizard />)
      
      // Navigate to last step
      fireEvent.click(screen.getByText('Next')) // Step 2
      await waitFor(() => fireEvent.click(screen.getByText('Next'))) // Step 3
      await waitFor(() => fireEvent.click(screen.getByText('Next'))) // Step 4
      
      await waitFor(() => {
        expect(screen.queryByText('Skip')).not.toBeInTheDocument()
      })
    })
  })

  describe('step content', () => {
    it('renders preferences step with currency and timezone options', async () => {
      render(<OnboardingWizard />)
      
      fireEvent.click(screen.getByText('Next'))
      
      await waitFor(() => {
        expect(screen.getByLabelText('Currency')).toBeInTheDocument()
        expect(screen.getByLabelText('Timezone')).toBeInTheDocument()
      })
    })

    it('renders preview step with mock data', async () => {
      render(<OnboardingWizard />)
      
      // Navigate to preview step
      fireEvent.click(screen.getByText('Next'))
      await waitFor(() => fireEvent.click(screen.getByText('Next')))
      
      await waitFor(() => {
        expect(screen.getByText('Preview Your Dashboard')).toBeInTheDocument()
        expect(screen.getByText('Sample Purchase 1')).toBeInTheDocument()
      })
    })

    it('renders completion step with success message', async () => {
      render(<OnboardingWizard />)
      
      // Navigate to completion step
      fireEvent.click(screen.getByText('Next'))
      await waitFor(() => fireEvent.click(screen.getByText('Next')))
      await waitFor(() => fireEvent.click(screen.getByText('Next')))
      
      await waitFor(() => {
        expect(screen.getByText('Setup Complete!')).toBeInTheDocument()
        expect(screen.getByText('Get Started')).toBeInTheDocument()
      })
    })
  })

  describe('data persistence', () => {
    it('saves preferences to localStorage', async () => {
      render(<OnboardingWizard />)
      
      fireEvent.click(screen.getByText('Next'))
      
      await waitFor(() => {
        const currencySelect = screen.getByLabelText('Currency')
        fireEvent.change(currencySelect, { target: { value: 'EUR' } })
        
        const timezoneSelect = screen.getByLabelText('Timezone')
        fireEvent.change(timezoneSelect, { target: { value: 'Europe/London' } })
        
        fireEvent.click(screen.getByText('Next'))
      })
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'onboarding-preferences',
        JSON.stringify({
          currency: 'EUR',
          timezone: 'Europe/London'
        })
      )
    })

    it('loads existing preferences from localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify({
          currency: 'EUR',
          timezone: 'Europe/London'
        })
      )
      
      render(<OnboardingWizard />)
      
      fireEvent.click(screen.getByText('Next'))
      
      const currencySelect = screen.getByDisplayValue('EUR')
      const timezoneSelect = screen.getByDisplayValue('Europe/London')
      
      expect(currencySelect).toBeInTheDocument()
      expect(timezoneSelect).toBeInTheDocument()
    })

    it('marks onboarding as complete in localStorage', async () => {
      render(<OnboardingWizard />)
      
      // Navigate to completion and finish
      fireEvent.click(screen.getByText('Next'))
      await waitFor(() => fireEvent.click(screen.getByText('Next')))
      await waitFor(() => fireEvent.click(screen.getByText('Next')))
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Get Started'))
      })
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'onboarding-completed',
        'true'
      )
    })
  })

  describe('skip functionality', () => {
    it('completes onboarding when Skip is clicked', async () => {
      const mockOnComplete = jest.fn()
      render(<OnboardingWizard onComplete={mockOnComplete} />)
      
      fireEvent.click(screen.getByText('Skip'))
      
      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalled()
      })
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'onboarding-completed',
        'true'
      )
    })
  })

  describe('completion callback', () => {
    it('calls onComplete when wizard is finished', async () => {
      const mockOnComplete = jest.fn()
      render(<OnboardingWizard onComplete={mockOnComplete} />)
      
      // Navigate to completion and finish
      fireEvent.click(screen.getByText('Next'))
      await waitFor(() => fireEvent.click(screen.getByText('Next')))
      await waitFor(() => fireEvent.click(screen.getByText('Next')))
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Get Started'))
      })
      
      expect(mockOnComplete).toHaveBeenCalled()
    })
  })

  describe('accessibility', () => {
    it('has proper ARIA labels for navigation', () => {
      render(<OnboardingWizard />)
      
      const nextButton = screen.getByText('Next')
      expect(nextButton).toHaveAttribute('aria-label', 'Go to next step')
    })

    it('announces step changes to screen readers', async () => {
      render(<OnboardingWizard />)
      
      const stepAnnouncement = screen.getByRole('status', { name: /step announcement/i })
      expect(stepAnnouncement).toHaveTextContent('Step 1 of 4: Welcome')
      
      fireEvent.click(screen.getByText('Next'))
      
      await waitFor(() => {
        expect(stepAnnouncement).toHaveTextContent('Step 2 of 4: Preferences')
      })
    })

    it('has proper heading hierarchy', () => {
      render(<OnboardingWizard />)
      
      const mainHeading = screen.getByRole('heading', { level: 1 })
      expect(mainHeading).toHaveTextContent('Welcome to Budget App')
    })
  })

  describe('responsive design', () => {
    it('applies custom className when provided', () => {
      render(<OnboardingWizard className="custom-wizard" />)
      
      const wizard = screen.getByTestId('onboarding-wizard')
      expect(wizard).toHaveClass('custom-wizard')
    })
  })
})