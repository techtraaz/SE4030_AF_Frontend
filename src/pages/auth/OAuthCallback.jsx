import { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { setUser } from '@/features/auth/authSlice'
import api from '@/services/axios'

/**
 * OAuthCallback
 * Handles the redirect back from the backend after a successful
 * OAuth (Google via Auth0) Authorization Code flow.
 */
export default function OAuthCallback() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState(null)
  const processed = useRef(false)

  useEffect(() => {
    if (processed.current) return
    processed.current = true

    const token = searchParams.get('token')
    const userParam = searchParams.get('user')

    if (!token) {
      setError('OAuth login failed. No token was returned.')
      return
    }

    let user = null
    try {
      user = userParam ? JSON.parse(userParam) : null
    } catch {
      user = null
    }

    // Persist the application JWT (same contract as the regular login flow)
    sessionStorage.setItem('token', token)
    if (user?.id) {
      sessionStorage.setItem('userId', user.id)
    }
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`

    // Sync Redux state (which also persists to sessionStorage)
    dispatch(
      setUser({
        user,
        token,
      })
    )

    navigate(user?.role === 'REFUGEE' ? '/dashboard' : '/admin', { replace: true })
  }, [dispatch, navigate, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        {error ? (
          <>
            <div className="text-2xl font-bold text-red-600 mb-2">Sign-in failed</div>
            <p className="text-brand-gray">{error}</p>
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