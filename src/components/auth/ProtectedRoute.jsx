import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated, selectCurrentUser, selectAuthStatus } from '@/features/auth/authSlice'

/**
 * Loading fallback while auth state resolves (avoids redirect flash).
 */
function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-brand-blue border-t-transparent" />
    </div>
  )
}

/**
 * ProtectedRoute — blocks unauthenticated access.
 * Uses Redux auth state (populated by authSlice + restoreSession),
 * not raw sessionStorage, so DevTools forgery of `auth` alone is not enough.
 * NOTE: defense-in-depth only — backend must still enforce auth on every API call.
 */
export function ProtectedRoute() {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const status = useSelector(selectAuthStatus)

  if (status === 'loading') {
    return <AuthLoading />
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

/**
 * RoleRoute — blocks access if user role doesn't match.
 * @param {string[]} allowedRoles - Array of allowed role strings (e.g. ['REFUGEE']).
 */
export function RoleRoute({ allowedRoles = [] }) {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectCurrentUser)
  const status = useSelector(selectAuthStatus)

  if (status === 'loading') {
    return <AuthLoading />
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
