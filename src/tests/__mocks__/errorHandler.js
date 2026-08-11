// Mock error handler for testing
export const handleApiError = jest.fn((error) => {
  throw error
})

export default {
  handleApiError,
}
