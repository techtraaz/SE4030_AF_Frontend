import { useEffect, useMemo, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { setUser } from '@/features/auth/authSlice'
import { getBasePath } from '@/utils/routeHelper'
import api from '@/services/axios'

/**
 * OAuthCallback
 * Handles the redirect back from the backend after a successful
 * OAuth (Google or GitHub via Auth0) Authorization Code flow.
 * Backend redirects to /auth/callback?token=<appJWT>&user=<json>.
 */
export default function OAuthCallback() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const processed = useRef(false)

  // Parse query params during render (no setState in effect needed).
  // Backend may redirect with ?error=&error_description= when Auth0 denies
  // the authorize request (e.g. audience not authorized, callback mismatch).
  const { token, user, parseError } = useMemo(() => {
    const err = searchParams.get('error')
    if (err) {
      const desc = searchParams.get('error_description')
      return { token: null, user: null, parseError: desc ? decodeURIComponent(desc) : err }
    }
    const t = searchParams.get('token')
    const userParam = searchParams.get('user')
    if (!t) {
      return { token: null, user: null, parseError: 'OAuth login failed. No token was returned.' }
    }
    try {
      const parsed = userParam ? JSON.parse(userParam) : null
      if (!parsed) {
        return { token: t, user: null, parseError: 'OAuth login failed. No user data was returned.' }
      }
      return { token: t, user: parsed, parseError: null }
    } catch {
      return { token: t, user: null, parseError: 'OAuth login failed. Invalid user data returned.' }
    }
  }, [searchParams])

  const displayError = parseError

  // One-shot redirect handler: syncs external ?token=&user= into
  // sessionStorage + Redux then navigates. Guarded by ref to run once.
  useEffect(() => {
    if (processed.current) return
    if (parseError || !token || !user) return
    processed.current = true

    // Persist the application JWT (same contract as the regular login flow)
    sessionStorage.setItem('token', token)
    const userId = user?.id ?? user?._id
    if (userId) {
      sessionStorage.setItem('userId', userId)
    }
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`

    // Sync Redux state (which also persists to sessionStorage)
    dispatch(
      setUser({
        user,
        token,
      })
    )

    navigate(getBasePath(user?.role), { replace: true })
  }, [dispatch, navigate, token, user, parseError])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        {displayError ? (
          <>
            <div className="text-2xl font-bold text-red-600 mb-2">Sign-in failed</div>
            <p className="text-brand-gray">{displayError}</p>
            <a href="/" className="mt-4 inline-block text-sm font-semibold text-brand-blue hover:underline">
              Back to home
            </a>
          </>
        ) : (
          <>
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-brand-blue border-t-transparent" />
            <p className="text-brand-navy font-medium">Completing sign-in...</p>
          </>
        )}
      </div>
    </div>
  )
}
