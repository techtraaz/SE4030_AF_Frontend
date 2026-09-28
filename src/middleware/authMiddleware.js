/**
 * Authentication Middleware - Toast notifications for auth state changes.
 *
 * The authSlice (src/features/auth/authSlice.js) owns sessionStorage
 * persistence itself, so this middleware only shows toasts and does NOT
 * write/clear storage (avoids double-writes and drift).
 *
 * Listens to the real thunk action types:
 *   auth/login/fulfilled|rejected, auth/register/fulfilled|rejected,
 *   auth/registerContributor/fulfilled|rejected, auth/logout/fulfilled,
 *   plus sync reducers auth/setUser (OAuth callback) and auth/clearUser.
 */

import { toastService } from '../services/toastService.js'

export const authMiddleware = () => (next) => (action) => {
  const result = next(action)

  // Handle login success (async thunk + sync OAuth callback path)
  if (action.type === 'auth/login/fulfilled' || action.type === 'auth/setUser') {
    const user = action.payload?.user
    toastService.success(`Welcome back, ${user?.displayName || user?.name || 'User'}!`)
  }

  // Handle logout (fulfilled clears state; rejected also clears locally)
  if (action.type === 'auth/logout/fulfilled' || action.type === 'auth/clearUser') {
    toastService.info('You have been logged out')
  }

  // Handle register success
  if (action.type === 'auth/register/fulfilled') {
    const user = action.payload?.user
    toastService.success(`Account created successfully! Welcome, ${user?.displayName || 'User'}!`)
  }

  // Contributor signup has no token (pending approval) — different message
  if (action.type === 'auth/registerContributor/fulfilled') {
    toastService.success('Application submitted! Your account is pending approval.')
  }

  // Handle auth errors
  if (
    action.type === 'auth/login/rejected' ||
    action.type === 'auth/register/rejected' ||
    action.type === 'auth/registerContributor/rejected' ||
    action.type === 'auth/logout/rejected'
  ) {
    const errorMessage = action.payload || action.error?.message || 'Authentication failed'
    // logout/rejected already cleared local state — don't alarm the user
    if (action.type !== 'auth/logout/rejected') {
      toastService.error(errorMessage)
    }
  }

  return result
}

export default authMiddleware
