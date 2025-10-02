import { render, screen } from '@testing-library/react'
import { AuthProvider } from '../auth-provider'

describe('AuthProvider', () => {
  it('renders children correctly', () => {
    const TestChild = () => <div data-testid="test-child">Test Content</div>

    render(
      <AuthProvider>
        <TestChild />
      </AuthProvider>
    )

    expect(screen.getByTestId('test-child')).toBeInTheDocument()
  })

  it('passes through multiple children correctly', () => {
    render(
      <AuthProvider>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </AuthProvider>
    )

    expect(screen.getByTestId('child-1')).toBeInTheDocument()
    expect(screen.getByTestId('child-2')).toBeInTheDocument()
  })

  it('renders without crashing when no children provided', () => {
    render(<AuthProvider />)
    // Should not throw an error
  })
})