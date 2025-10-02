import { auth0 } from '../auth0'

describe('Auth0Client', () => {
  it('exports auth0 client instance', () => {
    expect(auth0).toBeDefined()
    expect(typeof auth0).toBe('object')
  })

  it('has middleware method', () => {
    expect(auth0.middleware).toBeDefined()
    expect(typeof auth0.middleware).toBe('function')
  })

  it('has getSession method', () => {
    expect(auth0.getSession).toBeDefined()
    expect(typeof auth0.getSession).toBe('function')
  })
})