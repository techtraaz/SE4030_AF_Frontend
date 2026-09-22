/**
 * Route Protection Helpers - Checks authentication before accessing protected routes
 * Used with React Router to protect admin and user routes.
 *
 * Roles are canonicalized to the backend contract in
 * SE4030_AF_Backend/src/utils/constants.js:
 *   REFUGEE | CONTENT_CONTRIBUTOR | ADMIN
 *
 * Auth state is persisted by src/features/auth/authSlice.js as JSON in
 * sessionStorage key 'auth' with shape: { user, token, status }.
 * A separate 'token' key holds the raw JWT for the axios interceptor.
 */

const normalizeRole = (role) => {
  if (!role || typeof role !== 'string') return null
  const upper = role.toUpperCase()
  // Accept legacy lowercase aliases, map to canonical backend roles
  if (upper === 'USER' || upper === 'STUDENT') return 'REFUGEE'
  if (upper === 'CONTRIBUTOR' || upper === 'CONTENT_CONTRIBUTOR') return 'CONTENT_CONTRIBUTOR'
  if (upper === 'ADMIN') return 'ADMIN'
  if (upper === 'REFUGEE') return 'REFUGEE'
  return upper
}

export const isAuthenticated = () => {
  const token = sessionStorage.getItem('token')
  return !!token
}

export const getUserRole = () => {
  const auth = sessionStorage.getItem('auth')
  if (!auth) return null
  try {
    const parsed = JSON.parse(auth)
    // Real shape: { user: { role }, token, status }. Support legacy { role } too.
    const rawRole = parsed?.user?.role ?? parsed?.role ?? parsed?.userType ?? null
    return normalizeRole(rawRole)
  } catch (error) {
    console.error('Error parsing auth data:', error)
    return null
  }
}

export const hasRole = (...allowedRoles) => {
  const role = getUserRole()
  if (!role) return false
  const normalized = allowedRoles.map(normalizeRole)
  return normalized.includes(role)
}

export const isAdmin = () => {
  return hasRole('ADMIN')
}

export const isContributor = () => {
  return hasRole('CONTENT_CONTRIBUTOR')
}

export const isRefugee = () => {
  return hasRole('REFUGEE')
}

// Legacy alias: previous `isUser()` matched 'user|USER|student' which never
// occurs. Keep the export for compatibility but map to REFUGEE.
export const isUser = () => {
  return isRefugee()
}

export default {
  isAuthenticated,
  getUserRole,
  hasRole,
  isAdmin,
  isContributor,
  isRefugee,
  isUser,
}
