/**
 * Authentication Middleware - Handles auth state changes and token management
 * Syncs authentication state with session storage and shows toast notifications
 */

import { toastService } from '../services/toastService.js'

export const authMiddleware = (store) => (next) => (action) => {
  // Handle login success
  if (action.type === 'auth/loginSuccess') {
    const { token, user } = action.payload
    sessionStorage.setItem('token', token)
    sessionStorage.setItem('auth', JSON.stringify(user))
    toastService.success(`Welcome back, ${user.name || 'User'}!`)
  }

  // Handle logout
  if (action.type === 'auth/logout') {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('auth')
    toastService.info('You have been logged out')
  }

  // Handle register success
  if (action.type === 'auth/registerSuccess') {
    const { token, user } = action.payload
    sessionStorage.setItem('token', token)
    sessionStorage.setItem('auth', JSON.stringify(user))
    toastService.success('Account created successfully! Welcome!')
  }

  // Handle auth errors
  if (action.type === 'auth/loginFailure' || action.type === 'auth/registerFailure') {
    const errorMessage = action.payload?.message || 'Authentication failed'
    toastService.error(errorMessage)
  }

  return next(action)
}

export default authMiddleware
