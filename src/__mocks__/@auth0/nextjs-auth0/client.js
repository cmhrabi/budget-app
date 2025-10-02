const React = require('react')

module.exports = {
  UserProvider: ({ children }) => children,
  useUser: () => ({
    user: null,
    error: null,
    isLoading: false,
  }),
}