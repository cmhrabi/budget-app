module.exports = {
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