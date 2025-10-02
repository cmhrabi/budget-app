/* eslint-disable @typescript-eslint/no-var-requires */
module.exports = {
  UserProvider: ({ children }) => children,
  useUser: () => ({
    user: null,
    error: null,
    isLoading: false,
  }),
}
