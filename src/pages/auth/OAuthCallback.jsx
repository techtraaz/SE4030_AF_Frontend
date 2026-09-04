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

    const code = searchParams.get('code')

    if (!code) {
      setError('OAuth login failed. No authorization code was returned.')
      return
    }

    // SECURITY: Exchange the one-time code for a token via a server-side POST call.
    // The token is NEVER exposed in the URL.
    const exchangeCode = async () => {
      try {
        const response = await api.post('/auth/exchange-code', { code })
        const { user, token } = response.data.content

        // Store auth state via the standard login flow
        sessionStorage.setItem('token', token)
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`

        dispatch(setUser({ user, token }))

        navigate(user?.role === 'REFUGEE' ? '/dashboard' : '/admin', { replace: true })
      } catch (err) {
        setError('OAuth login failed. Please try again.')
      }
    }

    exchangeCode()
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