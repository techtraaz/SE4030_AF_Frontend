/**
 * Error Handler Service - Global error handling and backend error message extraction
 * Displays backend error messages, only uses frontend fallback if no backend message
 */

import { toastService } from './toastService.js'

/**
 * Extract error message from various backend response formats
 * Handles different API response structures
 */
const extractErrorMessage = (error) => {
  // Axios error response
  if (error?.response?.data) {
    const data = error.response.data

    // Check various common error message fields
    if (typeof data === 'string') return data
    if (data.message) return data.message
    if (data.error) return data.error
    if (data.msg) return data.msg
    if (data.errors && Array.isArray(data.errors)) {
      return data.errors.map((e) => e.message || e).join(', ')
    }
    if (data.errors && typeof data.errors === 'object') {
      return Object.values(data.errors)
        .flat()
        .join(', ')
    }
  }

  // Network error or no response
  if (error?.message) return error.message

  // Fallback message
  return 'Something went wrong. Please try again.'
}

/**
 * Get generic HTTP status fallback message (only if backend doesn't provide one)
 */
const getStatusFallbackMessage = (status) => {
  const messages = {
    400: 'Please check your input and try again.',
    401: 'Authentication failed. Please try again.',
    403: 'You do not have permission to perform this action.',
    404: 'The requested resource was not found.',
    409: 'This resource already exists.',
    422: 'Please check your input and try again.',
    429: 'Too many requests. Please wait a moment before trying again.',
    500: 'Server error. Please try again later.',
    502: 'Service temporarily unavailable. Please try again later.',
    503: 'Service is under maintenance. Please try again later.',
  }
  return messages[status] || 'Something went wrong. Please try again.'
}

/**
 * Handle API errors globally
 * @param {Error} error - Axios error object
 * @param {Object} options - Options for error handling
 * @returns {Object} - Processed error information
 */
export const handleApiError = (error, options = {}) => {
  const {
    showToast = true,
    logError = true,
    context = '',
  } = options

  const status = error?.response?.status
  const message = extractErrorMessage(error)

  // Log error to console in development
  if (logError && import.meta.env.DEV) {
    console.error(`API Error ${context ? `(${context})` : ''}:`, {
      status,
      message,
      error,
    })
  }

  // Show toast notification - use backend message
  if (showToast) {
    toastService.error(message)
  }

  return {
    message,
    status,
    error,
  }
}

/**
 * Parse field-specific validation errors from backend
 * Handles multiple error response formats
 */
const parseFieldErrors = (errors) => {
  const validationErrors = {}

  if (Array.isArray(errors)) {
    // Array format: [{field: 'email', message: 'Invalid email'}]
    errors.forEach((err) => {
      const field = err.field || err.name || 'general'
      validationErrors[field] = err.message || err.msg || 'Invalid field'
    })
  } else if (typeof errors === 'object') {
    // Object format: {email: ['must be valid'], password: ['must be strong']}
    Object.keys(errors).forEach((field) => {
      const fieldErrors = errors[field]
      validationErrors[field] = Array.isArray(fieldErrors)
        ? fieldErrors.join(', ')
        : fieldErrors
    })
  }

  return validationErrors
}

/**
 * Separate form field errors from general errors
 * Returns structured object with field-specific and general errors
 */
export const separateFormErrors = (error) => {
  const status = error?.response?.status
  const data = error?.response?.data || {}

  // Check if it's a validation error (422)
  if (status === 422 && data.errors) {
    const fieldErrors = parseFieldErrors(data.errors)
    const generalErrors = data.message ? [data.message] : []

    return {
      fieldErrors,      // For inline display {email: 'Invalid email', password: 'Too short'}
      generalErrors,    // Non-field errors to show as toasts
      hasFieldErrors: Object.keys(fieldErrors).length > 0,
      isValidationError: true,
    }
  }

  // Non-validation errors
  return {
    fieldErrors: {},
    generalErrors: [extractErrorMessage(error)],
    hasFieldErrors: false,
    isValidationError: false,
  }
}

/**
 * Handle form submission errors intelligently
 * Shows inline errors for fields, toasts for general errors
 */
export const handleFormError = (error, options = {}) => {
  const {
    context = '',
    logError = true,
  } = options

  const { fieldErrors, generalErrors, isValidationError } = separateFormErrors(error)

  // Log error in development
  if (logError && import.meta.env.DEV) {
    console.error(`Form Error ${context ? `(${context})` : ''}:`, {
      fieldErrors,
      generalErrors,
      error,
    })
  }

  // Show general errors as toasts
  generalErrors.forEach((msg) => {
    if (msg) toastService.error(msg)
  })

  // Show non-field specific errors based on status
  const status = error?.response?.status
  if (!isValidationError) {
    handleErrorByType(error)
  }

  return {
    fieldErrors,
    generalErrors,
    isValidationError,
  }
}

/**
 * Handle form validation errors from backend
 * Usually comes as 422 with field-specific errors
 */
export const handleValidationError = (error) => {
  const validationErrors = {}

  if (error?.response?.data?.errors) {
    const errors = error.response.data.errors
    return parseFieldErrors(errors)
  }

  return validationErrors
}

/**
 * Handle retry logic for failed requests
 */
export const shouldRetry = (error, retryCount = 0, maxRetries = 3) => {
  const status = error?.response?.status

  // Don't retry client errors (4xx)
  if (status >= 400 && status < 500) return false

  // Retry server errors (5xx) and network errors
  if (!status || status >= 500) {
    return retryCount < maxRetries
  }

  return false
}


/**
 * Handle specific error scenarios
 * Uses backend error message, status-specific logic applies
 */
export const handleErrorByType = (error) => {
  const status = error?.response?.status
  const url = error?.config?.url || ''
  const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register')

  // Always use backend message if available
  const backendMessage = extractErrorMessage(error)

  switch (status) {
    case 400:
      // Bad request - validation or request error
      toastService.error(backendMessage)
      return 'BAD_REQUEST_ERROR'

    case 401:
      // Clear auth state for 401 errors (whether invalid credentials or expired session)
      // Backend message will indicate what happened
      if (!isAuthEndpoint) {
        sessionStorage.removeItem('token')
        sessionStorage.removeItem('auth')
      }
      toastService.error(backendMessage)
      return 'AUTH_ERROR'

    case 403:
      toastService.error(backendMessage)
      return 'PERMISSION_ERROR'

    case 404:
      toastService.error(backendMessage)
      return 'NOT_FOUND_ERROR'

    case 422:
      // Validation error - don't show toast, let form handle it
      return 'VALIDATION_ERROR'

    case 429:
      toastService.error(backendMessage)
      return 'RATE_LIMIT_ERROR'

    case 500:
    case 502:
    case 503:
      toastService.error(backendMessage)
      return 'SERVER_ERROR'

    default:
      // Network error or unknown status codes
      if (!status) {
        toastService.error(backendMessage)
        return 'NETWORK_ERROR'
      }
      // For any other 4xx or 5xx errors
      if (status >= 400) {
        toastService.error(backendMessage)
        return 'HTTP_ERROR'
      }
      return 'UNKNOWN_ERROR'
  }
}

export default {
  handleApiError,
  handleValidationError,
  handleFormError,
  separateFormErrors,
  shouldRetry,
  handleErrorByType,
  extractErrorMessage,
}
