import { createContext, useContext, useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { clearAuthError } from '@/features/auth/authSlice'

const AuthModalContext = createContext(null)

/**
 * AuthModalProvider
 * Provides modal open/close state and active view (login | register)
 * across the entire user layout via context.
 */
export function AuthModalProvider({ children }) {
  const dispatch = useDispatch()
  const [isOpen, setIsOpen] = useState(false)
  const [view, setView] = useState('login') // 'login' | 'register'

  const openLogin = useCallback(() => {
    setView('login')
    setIsOpen(true)
  }, [])

  const openRegister = useCallback(() => {
    setView('register')
    setIsOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsOpen(false)
    dispatch(clearAuthError()) 
  }, [dispatch])

  const switchView = useCallback((newView) => {
    setView(newView)
    dispatch(clearAuthError()) 
  }, [dispatch])

  return (
    <AuthModalContext.Provider
      value={{ isOpen, view, openLogin, openRegister, closeModal, switchView }}
    >
      {children}
    </AuthModalContext.Provider>
  )
}

export function useAuthModal() {
  const context = useContext(AuthModalContext)
  if (!context) {
    throw new Error('useAuthModal must be used within an AuthModalProvider')
  }
  return context
}