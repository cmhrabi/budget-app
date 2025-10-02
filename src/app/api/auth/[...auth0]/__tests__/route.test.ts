/**
 * Test for Auth0 API route
 * 
 * This route file is a simple configuration that exports Auth0 handlers.
 * Since it's a thin wrapper around Auth0's handleAuth, we test that the
 * module can be imported without errors and that the handlers exist.
 */

describe('/api/auth/[...auth0] route', () => {
  it('can import the route handlers without errors', async () => {
    // Test that we can import the module
    await expect(import('../route')).resolves.toBeDefined()
  })

  it('exports the expected handler structure', async () => {
    const module = await import('../route')
    
    // Should export GET and POST handlers
    expect(module).toHaveProperty('GET')
    expect(module).toHaveProperty('POST')
    expect(typeof module.GET).toBe('function')
    expect(typeof module.POST).toBe('function')
  })
})