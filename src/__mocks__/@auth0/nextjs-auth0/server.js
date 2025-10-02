module.exports = {
  Auth0Client: jest.fn().mockImplementation(() => ({
    middleware: jest.fn().mockResolvedValue({
      status: 200,
      headers: new Map(),
    }),
    getSession: jest.fn().mockResolvedValue(null),
  })),
  handleAuth: jest.fn(() => ({
    GET: jest.fn(),
    POST: jest.fn(),
  })),
}