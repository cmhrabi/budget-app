/* eslint-disable @typescript-eslint/no-var-requires */
const React = require('react')

module.exports = {
  Auth0Provider: ({ children }) =>
    React.createElement('div', { 'data-testid': 'auth0-provider' }, children),
  useUser: jest.fn(() => ({
    user: null,
    error: null,
    isLoading: false,
  })),
  withPageAuthRequired: jest.fn((component) => component),
  handleAuth: jest.fn(() => ({
    GET: jest.fn(),
    POST: jest.fn(),
  })),
  handleLogin: jest.fn(),
  handleLogout: jest.fn(),
  handleCallback: jest.fn(),
  handleProfile: jest.fn(),
  getSession: jest.fn(),
  getAccessToken: jest.fn(),
}
