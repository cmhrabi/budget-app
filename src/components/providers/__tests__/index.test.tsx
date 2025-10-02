import { render, screen } from '@testing-library/react'
import { Providers } from '../index'

describe('Providers', () => {
  it('renders children with all providers', () => {
    render(
      <Providers>
        <div data-testid="test-child">Test Content</div>
      </Providers>
    )

    expect(screen.getByTestId('test-child')).toBeInTheDocument()
  })

  it('renders multiple children correctly', () => {
    render(
      <Providers>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </Providers>
    )

    expect(screen.getByTestId('child-1')).toBeInTheDocument()
    expect(screen.getByTestId('child-2')).toBeInTheDocument()
  })

  it('renders without children', () => {
    render(<Providers />)
    // Should not crash
  })
})