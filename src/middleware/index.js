/**
 * Middleware Barrel Export - Centralized imports for all middleware & services
 */

export { default as apiMiddleware } from './apiMiddleware.js'
export { default as authMiddleware } from './authMiddleware.js'
export { default as logger } from './logger.js'
export {
  isAuthenticated,
  getUserRole,
  isAdmin,
  isUser,
} from './routeProtectionMiddleware.js'
export { default as toastService } from '../services/toastService.js'
export {
  handleApiError,
  handleValidationError,
  shouldRetry,
  handleErrorByType,
  extractErrorMessage,
} from '../services/errorHandler.js'
