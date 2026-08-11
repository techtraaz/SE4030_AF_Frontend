/**
 * API Middleware - Handles API requests/responses globally
 * Manages loading states, error handling, and request tracking with toast notifications
 */

import { toastService } from '../services/toastService.js'

export const apiMiddleware = (store) => (next) => (action) => {
  // Log outgoing API requests
  if (action.type && action.type.includes('pending')) {
    console.log('API Request:', action.payload)
  }

  // Handle API responses - show success toast
  if (action.type && action.type.includes('fulfilled')) {
    console.log('API Success:', action.payload)
    // Show success toast for specific actions if needed
    if (action.payload?.message) {
      toastService.success(action.payload.message)
    }
  }

  // Handle API errors - show error toast
  if (action.type && action.type.includes('rejected')) {
    console.error('API Error:', action.payload)
    const errorMessage = action.payload?.message || 'Something went wrong'
    toastService.error(errorMessage)
  }

  return next(action)
}

export default apiMiddleware
